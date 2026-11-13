import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, AssetStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: QueryAssetsDto) {
    const { search, sedeId, categoryId, status, page = 1, limit = 25 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      ...(sedeId && { sedeId }),
      ...(categoryId && { categoryId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { serial: { contains: search, mode: 'insensitive' } },
          { plaque: { contains: search, mode: 'insensitive' } },
          { institutionalCode: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          category: true,
          sede: true,
          techAsset: { select: { id: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        sede: true,
        techAsset: true,
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            requestedBy: { select: { firstName: true, lastName: true } },
            authorizedBy: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!asset) throw new NotFoundException('Activo no encontrado');
    return asset;
  }

  async create(dto: CreateAssetDto, createdById: string) {
    if (dto.plaque) {
      const dup = await this.prisma.asset.findUnique({ where: { plaque: dto.plaque } });
      if (dup) throw new ConflictException(`La placa ${dto.plaque} ya está registrada`);
    }
    if (dto.institutionalCode) {
      const dup = await this.prisma.asset.findUnique({ where: { institutionalCode: dto.institutionalCode } });
      if (dup) throw new ConflictException(`El código ${dto.institutionalCode} ya está registrado`);
    }

    const asset = await this.prisma.asset.create({
      data: {
        ...dto,
        currentValue: dto.initialValue,
        acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
        createdById,
      },
      include: { category: true, sede: true },
    });

    await this.audit.log({
      userId: createdById,
      module: 'ALMACEN',
      action: 'CREATE_ASSET',
      entityType: 'Asset',
      entityId: asset.id,
      newValues: { name: asset.name, categoryId: asset.categoryId, sedeId: asset.sedeId },
    });

    return asset;
  }

  async update(id: string, dto: Partial<CreateAssetDto>, userId: string) {
    const asset = await this.findOne(id);

    if (dto.plaque && dto.plaque !== asset.plaque) {
      const dup = await this.prisma.asset.findUnique({ where: { plaque: dto.plaque } });
      if (dup) throw new ConflictException(`La placa ${dto.plaque} ya está registrada`);
    }

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : undefined,
      },
      include: { category: true, sede: true },
    });

    await this.audit.log({
      userId,
      module: 'ALMACEN',
      action: 'UPDATE_ASSET',
      entityType: 'Asset',
      entityId: id,
      oldValues: { status: asset.status, observations: asset.observations },
      newValues: dto as Record<string, any>,
    });

    return updated;
  }

  async getKardex(assetId: string) {
    await this.findOne(assetId);
    return this.prisma.assetMovement.findMany({
      where: { assetId },
      include: {
        requestedBy: { select: { firstName: true, lastName: true } },
        authorizedBy: { select: { firstName: true, lastName: true } },
        deliveredBy: { select: { firstName: true, lastName: true } },
        receivedBy: { select: { firstName: true, lastName: true } },
        transfer: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async requestBaja(assetId: string, reason: string, userId: string) {
    const asset = await this.findOne(assetId);
    if (asset.status === AssetStatus.BAJA) {
      throw new BadRequestException('El activo ya está dado de baja');
    }

    const updated = await this.prisma.asset.update({
      where: { id: assetId },
      data: { status: AssetStatus.BAJA, observations: reason },
    });

    await this.audit.log({
      userId,
      module: 'ALMACEN',
      action: 'REQUEST_BAJA',
      entityType: 'Asset',
      entityId: assetId,
      oldValues: { status: asset.status },
      newValues: { status: AssetStatus.BAJA, reason },
    });

    return updated;
  }
}
