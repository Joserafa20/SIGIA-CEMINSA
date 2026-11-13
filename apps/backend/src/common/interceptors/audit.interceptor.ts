import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.getAllAndOverride<AuditMetadata>(AUDIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditMeta) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    return next.handle().pipe(
      tap(async (responseData) => {
        if (!user) return;
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              module: auditMeta.module,
              action: auditMeta.action,
              entityType: auditMeta.entityType ?? '',
              entityId: responseData?.id ?? req.params?.id ?? '',
              newValues: responseData ?? null,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
            },
          });
        } catch {
          // Audit failure must not break the main flow
        }
      }),
    );
  }
}
