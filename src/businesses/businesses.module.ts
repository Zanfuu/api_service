import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity.js';
import { BusinessMember } from './entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BusinessesService } from './businesses.service.js';
import { BusinessesController } from './businesses.controller.js';
import { ProviderModule } from '../provider/provider.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessMember, User]), ProviderModule],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, TypeOrmModule],
})
export class BusinessesModule {}
