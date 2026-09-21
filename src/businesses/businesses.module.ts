import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity.js';
import { BusinessMember } from './entities/business-member.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessMember])],
  exports: [TypeOrmModule],
})
export class BusinessesModule {}
