import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.assetCategory.findMany({ orderBy: { code: 'asc' } });
  }

  async findOne(id: string) {
    const cat = await this.prisma.assetCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.assetCategory.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`El código ${dto.code} ya existe`);
    return this.prisma.assetCategory.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    await this.findOne(id);
    return this.prisma.assetCategory.update({ where: { id }, data: dto });
  }
}
