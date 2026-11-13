import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(query: QueryProductsDto) {
    const {
      search, category, requiresColdChain, isControlled, belowMinimum, page = 1, limit = 25,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && { category }),
      ...(requiresColdChain !== undefined && { requiresColdChain }),
      ...(isControlled !== undefined && { isControlled }),
      ...(search && {
        OR: [
          { activePrinciple: { contains: search, mode: 'insensitive' } },
          { commercialName: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { invima: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          productStock: {
            include: { sede: { select: { name: true } } },
          },
          _count: { select: { lots: true } },
        },
        orderBy: { activePrinciple: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Filter below-minimum after fetch (requires cross-table aggregation)
    const filtered = belowMinimum
      ? data.filter((p) => {
          const totalStock = p.productStock.reduce(
            (sum, s) => sum + Number(s.quantity),
            0,
          );
          return totalStock < p.minimumStock;
        })
      : data;

    return {
      data: filtered,
      meta: {
        total: belowMinimum ? filtered.length : total,
        page,
        limit,
        totalPages: Math.ceil((belowMinimum ? filtered.length : total) / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        lots: {
          where: { status: 'DISPONIBLE' },
          orderBy: { expiresAt: 'asc' },
        },
        productStock: {
          include: { sede: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findExpiringLots(daysAhead = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);
    return this.prisma.lot.findMany({
      where: {
        status: 'DISPONIBLE',
        expiresAt: { lte: cutoff, gte: new Date() },
        quantity: { gt: 0 },
      },
      include: {
        product: {
          select: { activePrinciple: true, commercialName: true, code: true },
        },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async create(dto: CreateProductDto, userId: string) {
    const existing = await this.prisma.product.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`El código ${dto.code} ya está registrado`);

    const product = await this.prisma.product.create({ data: dto });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: product.id,
      newValues: { code: dto.code, activePrinciple: dto.activePrinciple },
    });

    return product;
  }

  async update(id: string, dto: Partial<CreateProductDto>, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (dto.code && dto.code !== product.code) {
      const dup = await this.prisma.product.findUnique({ where: { code: dto.code } });
      if (dup) throw new ConflictException(`El código ${dto.code} ya está registrado`);
    }

    const updated = await this.prisma.product.update({ where: { id }, data: dto });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return updated;
  }

  async deactivate(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      userId,
      module: 'FARMACIA',
      action: 'DEACTIVATE_PRODUCT',
      entityType: 'Product',
      entityId: id,
      oldValues: { isActive: true },
    });

    return updated;
  }
}
