import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { BusinessMember } from '../businesses/entities/business-member.entity.js';
import { AdminManagementService } from './admin-management.service.js';
import { AdminManagementController } from './admin-management.controller.js';
import { CustomerManagementController } from './customer-management.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, BusinessMember])],
  controllers: [AdminManagementController, CustomerManagementController],
  providers: [AdminManagementService],
  exports: [AdminManagementService],
})
export class AdminManagementModule {}
