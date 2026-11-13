import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TransferStatus, MovementType, AssetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

// Valid state transitions: DESPACHADO → EN_TRANSITO → RECIBIDO
const NEXT_STATUS: Partial<Record<TransferStatus, TransferStatus>> = {
  [TransferStatus.DESPACHADO]: TransferStatus.EN_TRANSITO,
  [TransferStatus.EN_TRANSITO]: TransferStatus.RECIBIDO,
};

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateTransferDto, requestedById: string) {
    if (dto.fromSedeId === dto.toSedeId) {
      throw new BadRequestException('La sede de origen y destino no pueden ser la misma');
    }

    const assets = await this.prisma.asset.findMany({
      where: { id: { in: dto.assetIds } },
    });

    if (assets.length !== dto.assetIds.length) {
      throw new NotFoundException('Uno o más activos no fueron encontrados');
    }

    for (const asset of assets) {
      if (asset.sedeId !== dto.fromSedeId) {
        throw new BadRequestException(
          `El activo ${asset.plaque ?? asset.name} no pertenece a la sede de origen`,
        );
      }
      if (asset.status === AssetStatus.BAJA) {
        throw new BadRequestException(
          `El activo ${asset.plaque ?? asset.name} está dado de baja y no puede transferirse`,
        );
      }
      if (asset.status === AssetStatus.EN_TRANSITO) {
        throw new BadRequestException(
          `El activo ${asset.plaque ?? asset.name} ya tiene un traslado en curso`,
        );
      }
    }

    const transfer = await this.prisma.$transaction(async (tx) => {
      const tr = await tx.transfer.create({
        data: {
          fromSedeId: dto.fromSedeId,
          toSedeId: dto.toSedeId,
          status: TransferStatus.DESPACHADO,
          requestedById,
          documentRef: dto.documentRef,
          notes: dto.notes,
          assets: { connect: dto.assetIds.map((id) => ({ id })) },
        },
        include: {
          fromSede: true,
          toSede: true,
          assets: { select: { id: true, name: true, plaque: true } },
        },
      });

      // Mark assets as EN_TRANSITO and create movement records
      await tx.asset.updateMany({
        where: { id: { in: dto.assetIds } },
        data: { status: AssetStatus.EN_TRANSITO },
      });

      await tx.assetMovement.createMany({
        data: dto.assetIds.map((assetId) => ({
          assetId,
          movementType: MovementType.TRASLADO_SALIDA,
          quantity: 1,
          requestedById,
          documentRef: dto.documentRef,
          notes: dto.notes,
          transferId: tr.id,
        })),
      });

      return tr;
    });

    await this.audit.log({
      userId: requestedById,
      module: 'ALMACEN',
      action: 'CREATE_TRANSFER',
      entityType: 'Transfer',
      entityId: transfer.id,
      newValues: { assetCount: dto.assetIds.length, fromSedeId: dto.fromSedeId, toSedeId: dto.toSedeId },
    });

    return transfer;
  }

  async advanceStatus(transferId: string, userId: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        assets: { select: { id: true, name: true, plaque: true } },
        fromSede: true,
        toSede: true,
      },
    });

    if (!transfer) throw new NotFoundException('Traslado no encontrado');

    const nextStatus = NEXT_STATUS[transfer.status];
    if (!nextStatus) {
      throw new BadRequestException(
        `El traslado ya está en estado "${transfer.status}" y no puede avanzar`,
      );
    }

    const assetIds = transfer.assets.map((a) => a.id);

    const updated = await this.prisma.$transaction(async (tx) => {
      const tr = await tx.transfer.update({
        where: { id: transferId },
        data: {
          status: nextStatus,
          ...(nextStatus === TransferStatus.RECIBIDO && { receivedAt: new Date() }),
        },
        include: { fromSede: true, toSede: true },
      });

      if (nextStatus === TransferStatus.RECIBIDO) {
        // Move assets to destination sede and restore status to BUENO
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { sedeId: transfer.toSedeId, status: AssetStatus.BUENO },
        });

        await tx.assetMovement.createMany({
          data: assetIds.map((assetId) => ({
            assetId,
            movementType: MovementType.TRASLADO_ENTRADA,
            quantity: 1,
            requestedById: userId,
            documentRef: transfer.documentRef ?? undefined,
            notes: `Recepción traslado ${transferId}`,
            transferId,
          })),
        });
      }

      return tr;
    });

    await this.audit.log({
      userId,
      module: 'ALMACEN',
      action: `TRANSFER_${nextStatus}`,
      entityType: 'Transfer',
      entityId: transferId,
      oldValues: { status: transfer.status },
      newValues: { status: nextStatus },
    });

    return updated;
  }

  async findAll(sedeId?: string) {
    return this.prisma.transfer.findMany({
      where: sedeId
        ? { OR: [{ fromSedeId: sedeId }, { toSedeId: sedeId }] }
        : {},
      include: {
        fromSede: true,
        toSede: true,
        requestedBy: { select: { firstName: true, lastName: true } },
        assets: { select: { id: true, name: true, plaque: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id },
      include: {
        fromSede: true,
        toSede: true,
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
        assets: {
          include: {
            category: true,
            movements: {
              where: { transferId: id },
              include: { requestedBy: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });
    if (!transfer) throw new NotFoundException('Traslado no encontrado');
    return transfer;
  }

  async cancel(transferId: string, reason: string, userId: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { assets: { select: { id: true } } },
    });

    if (!transfer) throw new NotFoundException('Traslado no encontrado');
    if (transfer.status === TransferStatus.RECIBIDO) {
      throw new ForbiddenException('No se puede cancelar un traslado ya recibido');
    }

    const assetIds = transfer.assets.map((a) => a.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.transfer.update({
        where: { id: transferId },
        data: { status: TransferStatus.CANCELADO, notes: reason },
      });

      await tx.asset.updateMany({
        where: { id: { in: assetIds } },
        data: { status: AssetStatus.BUENO },
      });
    });

    await this.audit.log({
      userId,
      module: 'ALMACEN',
      action: 'CANCEL_TRANSFER',
      entityType: 'Transfer',
      entityId: transferId,
      newValues: { reason },
    });

    return { message: 'Traslado cancelado', transferId };
  }
}
