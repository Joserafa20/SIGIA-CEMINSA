import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/create-maintenance.dto';

const VALID_STATUSES = ['PROGRAMADO', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO'] as const;
type MaintenanceStatus = (typeof VALID_STATUSES)[number];

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByTechAsset(techAssetId: string) {
    return this.prisma.maintenance.findMany({
      where: { techAssetId },
      include: {
        technician: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findScheduled() {
    return this.prisma.maintenance.findMany({
      where: { status: 'PROGRAMADO' },
      include: {
        techAsset: {
          include: {
            asset: { select: { name: true, plaque: true } },
            sede: { select: { name: true } },
          },
        },
        technician: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const m = await this.prisma.maintenance.findUnique({
      where: { id },
      include: {
        techAsset: {
          include: {
            asset: { select: { name: true, plaque: true, serial: true } },
            sede: { select: { name: true } },
          },
        },
        technician: { select: { id: true, firstName: true, lastName: true, email: true } },
        documents: true,
      },
    });
    if (!m) throw new NotFoundException('Mantenimiento no encontrado');
    return m;
  }

  async create(dto: CreateMaintenanceDto, userId: string) {
    const techAsset = await this.prisma.techAsset.findUnique({
      where: { id: dto.techAssetId },
    });
    if (!techAsset) throw new NotFoundException('Equipo TIC no encontrado');

    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technicianId },
    });
    if (!technician || !technician.isActive) {
      throw new NotFoundException('Técnico no encontrado o inactivo');
    }

    const maintenance = await this.prisma.maintenance.create({
      data: {
        ...dto,
        status: 'PROGRAMADO',
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        executedDate: dto.executedDate ? new Date(dto.executedDate) : undefined,
        nextScheduled: dto.nextScheduled ? new Date(dto.nextScheduled) : undefined,
      },
      include: {
        technician: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'CREATE_MAINTENANCE',
      entityType: 'Maintenance',
      entityId: maintenance.id,
      newValues: { techAssetId: dto.techAssetId, type: dto.type },
    });

    return maintenance;
  }

  async update(id: string, dto: UpdateMaintenanceDto, userId: string) {
    const maintenance = await this.findOne(id);

    if (dto.status && !VALID_STATUSES.includes(dto.status as MaintenanceStatus)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
      );
    }

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        ...dto,
        executedDate: dto.executedDate ? new Date(dto.executedDate) : undefined,
        nextScheduled: dto.nextScheduled ? new Date(dto.nextScheduled) : undefined,
      },
      include: {
        technician: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'UPDATE_MAINTENANCE',
      entityType: 'Maintenance',
      entityId: id,
      oldValues: { status: maintenance.status },
      newValues: dto as Record<string, unknown>,
    });

    return updated;
  }
}
