import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataForSeoService } from './dataforseo.service.js';

@Module({
  imports: [ConfigModule],
  providers: [DataForSeoService],
  exports: [DataForSeoService],
})
export class DataForSeoModule {}
