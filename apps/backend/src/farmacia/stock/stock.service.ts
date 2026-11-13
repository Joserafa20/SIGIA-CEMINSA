import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StockMovementType, LotStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateStockEntryDto } from './dto/stock-entry.dto';
import { DispenseDto } from './dto/dispense.dto';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  // ─── Stock queries ────────────────────────────────────────────

  async getStockBySede(sedeId: string) {
    return this.prisma.productStock.findMany({
      where: { sedeId },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            activePrinciple: true,
            commercialName: true,
            minimumStock: true,
            requiresColdChain: true,
            isControlled: true,
          },
        },
      },
      orderBy: { product: { activePrinciple: 'asc' } },
    });
  }

  async getMovements(params: {
    sedeId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }) {
    const { sedeId, productId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {
      ...(sedeId && { sedeId }),
      ...(productId && { lot: { productId } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          lot: {
            include: {
              product: { select: { activePrinciple: true, commercialName: true, code: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // ─── Stock entry (ingreso) ─────────────────────────────────────

  async createEntry(dto: CreateStockEntryDto, userId: string) {
    const sede = await this.prisma.sede.findUnique({ where: { id: dto.sedeId } });
    if (!sede) throw new NotFoundException('Sede no encontrada');

    const entry = await this.prisma.$transaction(async (tx) => {
      // Create the entry header
      const stockEntry = await tx.stockEntry.create({
        data: {
          sedeId: dto.sedeId,
          documentRef: dto.documentRef,
          supplier: dto.supplier,
          notes: dto.notes,
          createdById: userId,
        },
      });

      let totalValue = 0;

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Producto ${item.productId} no encontrado o inactivo`,
          );
        }

        // Upsert lot
        let lot = await tx.lot.findUnique({
          where: {
            productId_lotNumber: { productId: item.productId, lotNumber: item.lotNumber },
          },
        });

        if (!lot) {
          lot = await tx.lot.create({
            data: {
              productId: item.productId,
              lotNumber: item.lotNumber,
              quantity: item.quantity,
              expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
              status: LotStatus.DISPONIBLE,
            },
          });
        } else {
          if (lot.status === LotStatus.VENCIDO) {
            throw new BadRequestException(
              `El lote ${item.lotNumber} está vencido y no puede recibir más unidades`,
            );
          }
          await tx.lot.update({
            where: { id: lot.id },
            data: { quantity: { increment: item.quantity } },
          });
        }

        const lineTotal = item.unitValue ? item.quantity * item.unitValue : 0;
        totalValue += lineTotal;

        // Movement record
        await tx.stockMovement.create({
          data: {
            lotId: lot.id,
            stockEntryId: stockEntry.id,
            movementType: StockMovementType.ENTRADA,
            quantity: item.quantity,
            unitValue: item.unitValue,
            totalValue: lineTotal || undefined,
            sedeId: dto.sedeId,
            requestedById: userId,
            documentRef: dto.documentRef,
          },
        });

        // Update or create ProductStock for this sede
        await tx.productStock.upsert({
          where: { productId_sedeId: { productId: item.productId, sedeId: dto.sedeId } },
          create: { productId: item.productId, sedeId: dto.sedeId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });
      }

      // Update total value on entry
      await tx.stockEntry.update({
        where: { id: stockEntry.id },
        data: { totalValue: totalValue || undefined },
      });

      return stockEntry;
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'STOCK_ENTRY',
      entityType: 'StockEntry',
      entityId: entry.id,
      newValues: { sedeId: dto.sedeId, itemCount: dto.items.length, supplier: dto.supplier },
    });

    return entry;
  }

  // ─── FEFO Dispensing ───────────────────────────────────────────

  async dispense(dto: DispenseDto, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || !product.isActive) throw new NotFoundException('Producto no encontrado o inactivo');

    // Check total available stock in sede
    const stockRecord = await this.prisma.productStock.findUnique({
      where: { productId_sedeId: { productId: dto.productId, sedeId: dto.sedeId } },
    });

    const availableStock = stockRecord ? Number(stockRecord.quantity) : 0;
    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${availableStock}, solicitado: ${dto.quantity}`,
      );
    }

    // FEFO: get available lots ordered by expiresAt ASC (nulls last — no-expiry lots consumed last)
    const availableLots = await this.prisma.lot.findMany({
      where: {
        productId: dto.productId,
        status: LotStatus.DISPONIBLE,
        quantity: { gt: 0 },
      },
      orderBy: [
        { expiresAt: { sort: 'asc', nulls: 'last' } },
      ],
    });

    if (availableLots.length === 0) {
      throw new BadRequestException('No hay lotes disponibles para este producto');
    }

    const movements: Array<{
      lotId: string;
      lotNumber: string;
      consumed: number;
      expiresAt: Date | null;
    }> = [];

    await this.prisma.$transaction(async (tx) => {
      let remaining = dto.quantity;

      for (const lot of availableLots) {
        if (remaining <= 0) break;

        const consume = Math.min(remaining, Number(lot.quantity));
        remaining -= consume;

        // Deduct from lot
        const newQty = Number(lot.quantity) - consume;
        await tx.lot.update({
          where: { id: lot.id },
          data: {
            quantity: newQty,
            status: newQty === 0 ? LotStatus.AGOTADO : LotStatus.DISPONIBLE,
          },
        });

        // Movement record
        await tx.stockMovement.create({
          data: {
            lotId: lot.id,
            movementType: StockMovementType.SALIDA,
            quantity: consume,
            sedeId: dto.sedeId,
            requestedById: userId,
            authorizedById: dto.authorizedById ?? null,
            documentRef: dto.documentRef,
            notes: dto.notes,
          },
        });

        movements.push({
          lotId: lot.id,
          lotNumber: lot.lotNumber,
          consumed: consume,
          expiresAt: lot.expiresAt,
        });
      }

      if (remaining > 0) {
        throw new BadRequestException(
          `No se pudo completar la dispensación. Faltan ${remaining} unidades en lotes disponibles`,
        );
      }

      // Update ProductStock
      await tx.productStock.update({
        where: { productId_sedeId: { productId: dto.productId, sedeId: dto.sedeId } },
        data: { quantity: { decrement: dto.quantity } },
      });
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'DISPENSE',
      entityType: 'Product',
      entityId: dto.productId,
      newValues: {
        sedeId: dto.sedeId,
        quantity: dto.quantity,
        lotsConsumed: movements.map((m) => m.lotNumber),
      },
    });

    return {
      dispensed: dto.quantity,
      product: { id: product.id, activePrinciple: product.activePrinciple },
      movements,
    };
  }

  // ─── Stock adjustment ─────────────────────────────────────────

  async adjust(params: {
    productId: string;
    lotId: string;
    sedeId: string;
    newQuantity: number;
    reason: string;
    userId: string;
  }) {
    const { productId, lotId, sedeId, newQuantity, reason, userId } = params;

    const lot = await this.prisma.lot.findUnique({ where: { id: lotId } });
    if (!lot) throw new NotFoundException('Lote no encontrado');
    if (lot.productId !== productId) {
      throw new BadRequestException('El lote no pertenece a este producto');
    }

    const currentQty = Number(lot.quantity);
    const delta = newQuantity - currentQty;
    const movementType = delta >= 0
      ? StockMovementType.AJUSTE_POSITIVO
      : StockMovementType.AJUSTE_NEGATIVO;

    await this.prisma.$transaction(async (tx) => {
      await tx.lot.update({
        where: { id: lotId },
        data: {
          quantity: newQuantity,
          status: newQuantity === 0 ? LotStatus.AGOTADO : LotStatus.DISPONIBLE,
        },
      });

      await tx.stockMovement.create({
        data: {
          lotId,
          movementType,
          quantity: Math.abs(delta),
          sedeId,
          requestedById: userId,
          notes: reason,
        },
      });

      await tx.productStock.upsert({
        where: { productId_sedeId: { productId, sedeId } },
        create: { productId, sedeId, quantity: newQuantity },
        update: { quantity: { increment: delta } },
      });
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'STOCK_ADJUST',
      entityType: 'Lot',
      entityId: lotId,
      oldValues: { quantity: currentQty },
      newValues: { quantity: newQuantity, delta, reason },
    });

    return { lotId, oldQuantity: currentQty, newQuantity, delta };
  }
}
