import { Injectable } from '@nestjs/common';
import { Module } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateAuditLogParams {
  userId: string;
  module: Module;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: CreateAuditLogParams) {
    try {
      await this.prisma.auditLog.create({ data: params });
    } catch {
      // Audit failure must never block business operations
    }
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
