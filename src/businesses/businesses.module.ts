import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity.js';
import { BusinessMember } from './entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BusinessesService } from './businesses.service.js';
import { BusinessesController } from './businesses.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessMember, User])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService, TypeOrmModule],
})
export class BusinessesModule {}
