import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessClaim } from './entities/business-claim.entity.js';
import { Business } from '../businesses/entities/business.entity.js';
import { BusinessMember } from '../businesses/entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BusinessClaimsService } from './business-claims.service.js';
import { BusinessClaimsController } from './business-claims.controller.js';
import { AdminBusinessClaimsController } from './admin-business-claims.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessClaim, Business, BusinessMember, User])],
  controllers: [BusinessClaimsController, AdminBusinessClaimsController],
  providers: [BusinessClaimsService],
  exports: [BusinessClaimsService],
})
export class BusinessClaimsModule {}
