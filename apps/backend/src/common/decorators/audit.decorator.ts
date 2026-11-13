import { SetMetadata } from '@nestjs/common';
import { Module } from '@prisma/client';

export interface AuditMetadata {
  module: Module;
  action: string;
  entityType?: string;
}

export const AUDIT_KEY = 'audit';
export const Audit = (meta: AuditMetadata) => SetMetadata(AUDIT_KEY, meta);
