import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlatformRole } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'platform_roles';
export const PlatformRoles = (...roles: PlatformRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class PlatformRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PlatformRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Akses ditolak: User belum terotentikasi');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(`Akses ditolak: Hanya ${requiredRoles.join(', ')} yang diperbolehkan`);
    }

    return true;
  }
}
