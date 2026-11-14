import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

function stripHash<T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash: _, ...rest } = user;
  return rest as Omit<T, 'passwordHash'>;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El correo ya está registrado');

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
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
    });
    return stripHash(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { roles: true },
      orderBy: { lastName: 'asc' },
    });
    return users.map(stripHash);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true, sedeAccess: { include: { sede: true } } },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return stripHash(user);
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return stripHash(updated);
  }
}
