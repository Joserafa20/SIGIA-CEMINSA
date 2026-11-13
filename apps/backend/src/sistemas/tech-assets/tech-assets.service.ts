import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTechAssetDto } from './dto/create-tech-asset.dto';
import { QueryTechAssetsDto } from './dto/query-tech-assets.dto';

@Injectable()
export class TechAssetsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: QueryTechAssetsDto) {
    const { search, sedeId, assignedToId, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TechAssetWhereInput = {
      ...(sedeId && { sedeId }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { asset: { name: { contains: search, mode: 'insensitive' } } },
          { asset: { plaque: { contains: search, mode: 'insensitive' } } },
          { asset: { serial: { contains: search, mode: 'insensitive' } } },
          { ipAddress: { contains: search, mode: 'insensitive' } },
          { macAddress: { contains: search, mode: 'insensitive' } },
          { processor: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.techAsset.findMany({
        where,
        include: {
          asset: { include: { category: true } },
          sede: true,
          assignedTo: { select: { firstName: true, lastName: true, email: true } },
          _count: { select: { licenses: true, maintenances: true, tickets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.techAsset.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const tech = await this.prisma.techAsset.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true, sede: true } },
        sede: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        licenses: { orderBy: { createdAt: 'desc' } },
        maintenances: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            technician: { select: { firstName: true, lastName: true } },
          },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: { select: { firstName: true, lastName: true } },
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!tech) throw new NotFoundException('Equipo TIC no encontrado');
    return tech;
  }

  async findByQr(qrCode: string) {
    const tech = await this.prisma.techAsset.findUnique({ where: { qrCode } });
    if (!tech) throw new NotFoundException('Código QR no reconocido');
    return this.findOne(tech.id);
  }

  async create(dto: CreateTechAssetDto, userId: string) {
    const existing = await this.prisma.techAsset.findUnique({
      where: { assetId: dto.assetId },
    });
    if (existing) {
      throw new ConflictException('Este activo ya tiene un registro TIC asociado');
    }

    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset) throw new NotFoundException('Activo base no encontrado');

    const qrCode = `SIGIA-TIC-${randomUUID().toUpperCase().replace(/-/g, '').slice(0, 12)}`;

    const tech = await this.prisma.techAsset.create({
      data: {
        ...dto,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        assignedAt: dto.assignedToId ? new Date() : undefined,
        qrCode,
      },
      include: {
        asset: { include: { category: true } },
        sede: true,
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'CREATE_TECH_ASSET',
      entityType: 'TechAsset',
      entityId: tech.id,
      newValues: { assetId: dto.assetId, sedeId: dto.sedeId, qrCode },
    });

    return tech;
  }

  async update(id: string, dto: Partial<CreateTechAssetDto>, userId: string) {
    const tech = await this.prisma.techAsset.findUnique({ where: { id } });
    if (!tech) throw new NotFoundException('Equipo TIC no encontrado');

    const updated = await this.prisma.techAsset.update({
      where: { id },
      data: {
        ...dto,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        // Set assignedAt when changing assignee
        ...(dto.assignedToId !== undefined && {
          assignedAt: dto.assignedToId ? new Date() : null,
        }),
      },
      include: {
        asset: { include: { category: true } },
        sede: true,
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'UPDATE_TECH_ASSET',
      entityType: 'TechAsset',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return updated;
  }
}
