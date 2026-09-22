import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { User } from './users/entities/user.entity.js';
import { Business } from './businesses/entities/business.entity.js';
import { BusinessMember } from './businesses/entities/business-member.entity.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { BusinessesModule } from './businesses/businesses.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST') || '43.133.133.58',
        port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
        username: configService.get<string>('DATABASE_USER') || 'postgres',
        password: configService.get<string>('DATABASE_PASSWORD') || 'bismillah_transgo_emas',
        database: configService.get<string>('DATABASE_NAME') || 'katamereka_db',
        entities: [User, Business, BusinessMember],
        synchronize: true, // Kembali normal tanpa dropSchema
      }),
    }),
    AuthModule,
    UsersModule,
    BusinessesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
