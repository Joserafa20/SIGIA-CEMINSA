import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    const passwordHash = await argon2.hash(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentId: dto.documentId,
        phone: dto.phone,
        roles: {
          create: dto.roles?.map((r) => ({ role: r.role, module: r.module })) ?? [],
        },
      },
      include: { roles: true },
      omit: { passwordHash: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { roles: true },
      omit: { passwordHash: true },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true, sedeAccess: { include: { sede: true } } },
      omit: { passwordHash: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      omit: { passwordHash: true },
    });
  }
}
