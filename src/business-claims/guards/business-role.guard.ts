import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessRole } from '../../businesses/entities/business-member.entity.js';

export const BUSINESS_ROLES_KEY = 'business_roles';
export const BusinessRoles = (...roles: BusinessRole[]) => SetMetadata(BUSINESS_ROLES_KEY, roles);

@Injectable()
export class BusinessRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(BUSINESS_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const member = request.businessMember;

    if (!member) {
      throw new ForbiddenException('Akses ditolak: Data keanggotaan bisnis tidak ditemukan');
    }

    const hasRole = requiredRoles.includes(member.role);

    if (!hasRole) {
      throw new ForbiddenException(`Akses ditolak: Membutuhkan role ${requiredRoles.join(', ')} di bisnis ini`);
    }

    return true;
  }
}
