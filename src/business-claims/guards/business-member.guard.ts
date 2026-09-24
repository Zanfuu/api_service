import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessMember } from '../../businesses/entities/business-member.entity.js';

@Injectable()
export class BusinessMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(BusinessMember)
    private readonly memberRepository: Repository<BusinessMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    const businessId = params.businessId || params.id;

    if (!user || !businessId) {
      throw new ForbiddenException('Akses ditolak: User ID atau Business ID tidak valid');
    }

    const member = await this.memberRepository.findOne({
      where: { businessId, userId: user.id },
    });

    if (!member) {
      throw new ForbiddenException('Akses ditolak: Anda bukan anggota dari bisnis ini');
    }

    request.businessMember = member;
    return true;
  }
}
