import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateMovementDto } from './dto/create-movement.dto';

const MOVEMENTS_REQUIRING_AUTHORIZATION: MovementType[] = [
  MovementType.SALIDA_AUTORIZADA,
  MovementType.SALIDA_BAJA,
  MovementType.AJUSTE_NEGATIVO,
  MovementType.AJUSTE_POSITIVO,
];

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async create(dto: CreateMovementDto, requestedById: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
      include: { sede: true },
    });
    if (!asset) throw new NotFoundException('Activo no encontrado');

    if (asset.status === 'BAJA') {
      throw new BadRequestException('No se pueden registrar movimientos en un activo dado de baja');
    }

    // Movimientos que exigen autorización explícita
    if (MOVEMENTS_REQUIRING_AUTHORIZATION.includes(dto.movementType) && !dto.authorizedById) {
      throw new BadRequestException(
        `El movimiento "${dto.movementType}" requiere un usuario autorizante`,
      );
    }

    if (dto.authorizedById) {
      const authorizer = await this.prisma.user.findUnique({
        where: { id: dto.authorizedById },
      });
      if (!authorizer || !authorizer.isActive) {
        throw new ForbiddenException('El usuario autorizante no existe o está inactivo');
      }
    }

    const movement = await this.prisma.$transaction(async (tx) => {
      const mov = await tx.assetMovement.create({
        data: {
          assetId: dto.assetId,
          movementType: dto.movementType,
          quantity: dto.quantity,
          previousValue: asset.currentValue,
          newValue: dto.newValue ?? asset.currentValue,
          requestedById,
          authorizedById: dto.authorizedById ?? null,
          documentRef: dto.documentRef,
          notes: dto.notes,
        },
        include: {
          requestedBy: { select: { firstName: true, lastName: true } },
          authorizedBy: { select: { firstName: true, lastName: true } },
        },
      });

      // Actualizar valor del activo si se especificó uno nuevo
      if (dto.newValue !== undefined && dto.newValue !== Number(asset.currentValue)) {
        await tx.asset.update({
          where: { id: dto.assetId },
          data: { currentValue: dto.newValue },
        });
      }

      return mov;
    });

    await this.audit.log({
      userId: requestedById,
      module: 'ALMACEN',
      action: dto.movementType,
      entityType: 'Asset',
      entityId: dto.assetId,
      newValues: {
        movementId: movement.id,
        quantity: dto.quantity,
        documentRef: dto.documentRef,
      },
    });

    return movement;
  }

  async findByAsset(assetId: string) {
    return this.prisma.assetMovement.findMany({
      where: { assetId },
      include: {
        requestedBy: { select: { firstName: true, lastName: true, email: true } },
        authorizedBy: { select: { firstName: true, lastName: true, email: true } },
        deliveredBy: { select: { firstName: true, lastName: true } },
        receivedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecent(sedeId?: string, limit = 50) {
    return this.prisma.assetMovement.findMany({
      where: sedeId ? { asset: { sedeId } } : {},
      include: {
        asset: { select: { name: true, plaque: true, institutionalCode: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
        authorizedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
