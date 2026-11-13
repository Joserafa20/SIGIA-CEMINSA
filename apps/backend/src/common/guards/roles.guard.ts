import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, Module } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MODULES_KEY } from '../decorators/modules.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredModules = this.reflector.getAllAndOverride<Module[]>(MODULES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredModules) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('No autenticado');

    const userRoles: Role[] = user.roles.map((r: any) => r.role);

    if (userRoles.includes('SUPER_ADMIN' as Role)) return true;

    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) throw new ForbiddenException('Rol insuficiente para esta operación');
    }

    if (requiredModules) {
      const userModuleRoles = user.roles.filter((r: any) =>
        requiredModules.includes(r.module),
      );
      if (userModuleRoles.length === 0) {
        throw new ForbiddenException('Sin acceso al módulo requerido');
      }
    }

    return true;
  }
}
