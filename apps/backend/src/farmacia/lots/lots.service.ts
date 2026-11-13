import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { LotStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateLotDto } from './dto/create-lot.dto';

@Injectable()
export class LotsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByProduct(productId: string) {
    return this.prisma.lot.findMany({
      where: { productId },
      include: {
        _count: { select: { movements: true } },
      },
      orderBy: [{ status: 'asc' }, { expiresAt: 'asc' }],
    });
  }

  async findOne(id: string) {
    const lot = await this.prisma.lot.findUnique({
      where: { id },
      include: {
        product: { select: { activePrinciple: true, commercialName: true, code: true } },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!lot) throw new NotFoundException('Lote no encontrado');
    return lot;
  }

  async create(dto: CreateLotDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (!product.isActive) throw new BadRequestException('El producto está inactivo');

    const existing = await this.prisma.lot.findUnique({
      where: { productId_lotNumber: { productId: dto.productId, lotNumber: dto.lotNumber } },
    });
    if (existing) {
      throw new ConflictException(
        `El lote ${dto.lotNumber} ya existe para este producto`,
      );
    }

    const lot = await this.prisma.lot.create({
      data: {
        productId: dto.productId,
        lotNumber: dto.lotNumber,
        quantity: dto.quantity,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: LotStatus.DISPONIBLE,
      },
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'CREATE_LOT',
      entityType: 'Lot',
      entityId: lot.id,
      newValues: { productId: dto.productId, lotNumber: dto.lotNumber, quantity: dto.quantity },
    });

    return lot;
  }

  async quarantine(id: string, reason: string, userId: string) {
    const lot = await this.prisma.lot.findUnique({ where: { id } });
    if (!lot) throw new NotFoundException('Lote no encontrado');
    if (lot.status !== LotStatus.DISPONIBLE) {
      throw new BadRequestException(`El lote ya está en estado "${lot.status}"`);
    }

    const updated = await this.prisma.lot.update({
      where: { id },
      data: { status: LotStatus.CUARENTENA },
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'QUARANTINE_LOT',
      entityType: 'Lot',
      entityId: id,
      oldValues: { status: LotStatus.DISPONIBLE },
      newValues: { status: LotStatus.CUARENTENA, reason },
    });

    return updated;
  }

  async releaseFromQuarantine(id: string, userId: string) {
    const lot = await this.prisma.lot.findUnique({ where: { id } });
    if (!lot) throw new NotFoundException('Lote no encontrado');
    if (lot.status !== LotStatus.CUARENTENA) {
      throw new BadRequestException('El lote no está en cuarentena');
    }

    const updated = await this.prisma.lot.update({
      where: { id },
      data: { status: LotStatus.DISPONIBLE },
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'RELEASE_QUARANTINE',
      entityType: 'Lot',
      entityId: id,
    });

    return updated;
  }

  /**
   * Run nightly: marks lots whose expiresAt is in the past as VENCIDO.
   * Returns count of lots updated.
   */
  async markExpiredLots(): Promise<number> {
    const result = await this.prisma.lot.updateMany({
      where: {
        status: LotStatus.DISPONIBLE,
        expiresAt: { lt: new Date() },
        quantity: { gt: 0 },
      },
      data: { status: LotStatus.VENCIDO },
    });
    return result.count;
  }
}
