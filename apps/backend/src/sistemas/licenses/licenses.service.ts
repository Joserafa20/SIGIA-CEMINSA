import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicensesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findByTechAsset(techAssetId: string) {
    return this.prisma.license.findMany({
      where: { techAssetId },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async findExpiringSoon(daysAhead = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);
    return this.prisma.license.findMany({
      where: {
        expiresAt: { lte: cutoff, gte: new Date() },
      },
      include: {
        techAsset: {
          include: {
            asset: { select: { name: true, plaque: true } },
            sede: { select: { name: true } },
          },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async create(dto: CreateLicenseDto, userId: string) {
    const techAsset = await this.prisma.techAsset.findUnique({
      where: { id: dto.techAssetId },
    });
    if (!techAsset) throw new NotFoundException('Equipo TIC no encontrado');

    const license = await this.prisma.license.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'CREATE_LICENSE',
      entityType: 'License',
      entityId: license.id,
      newValues: { techAssetId: dto.techAssetId, productName: dto.productName },
    });

    return license;
  }

  async update(id: string, dto: Partial<CreateLicenseDto>, userId: string) {
    const license = await this.prisma.license.findUnique({ where: { id } });
    if (!license) throw new NotFoundException('Licencia no encontrada');

    const updated = await this.prisma.license.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'UPDATE_LICENSE',
      entityType: 'License',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const license = await this.prisma.license.findUnique({ where: { id } });
    if (!license) throw new NotFoundException('Licencia no encontrada');

    await this.prisma.license.delete({ where: { id } });

    await this.audit.log({
      userId,
      module: 'SISTEMAS',
      action: 'DELETE_LICENSE',
      entityType: 'License',
      entityId: id,
      oldValues: { productName: license.productName },
    });

    return { message: 'Licencia eliminada', id };
  }
}
