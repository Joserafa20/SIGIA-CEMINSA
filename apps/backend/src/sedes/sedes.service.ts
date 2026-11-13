import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSedeDto } from './dto/create-sede.dto';

@Injectable()
export class SedesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sede.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const sede = await this.prisma.sede.findUnique({ where: { id } });
    if (!sede) throw new NotFoundException('Sede no encontrada');
    return sede;
  }

  async create(dto: CreateSedeDto) {
    const existing = await this.prisma.sede.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`El código ${dto.code} ya existe`);
    return this.prisma.sede.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateSedeDto>) {
    await this.findOne(id);
    return this.prisma.sede.update({ where: { id }, data: dto });
  }

  async toggleActive(id: string) {
    const sede = await this.findOne(id);
    return this.prisma.sede.update({ where: { id }, data: { isActive: !sede.isActive } });
  }
}
