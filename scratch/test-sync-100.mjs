import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { BusinessesService } from '../dist/businesses/businesses.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const businessesService = app.get(BusinessesService);

  console.log('🚀 Memulai sync 100 data dari Geoapify...');
  const res1 = await businessesService.syncBusinesses({ keyword: 'hotel', location: 'Jakarta', limit: 100 });
  console.log('Hasil Sync 1 (Jakarta Hotel):', res1);

  const res2 = await businessesService.syncBusinesses({ keyword: 'restaurant', location: 'Bandung', limit: 100 });
  console.log('Hasil Sync 2 (Bandung Restaurant):', res2);

  await app.close();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
