import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProviderService } from './provider.service.js';

@Module({
  imports: [ConfigModule],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
