import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { User } from './users/entities/user.entity.js';
import { OtpCode } from './auth/entities/otp-code.entity.js';
import { Business } from './businesses/entities/business.entity.js';
import { BusinessMember } from './businesses/entities/business-member.entity.js';
import { BusinessClaim } from './business-claims/entities/business-claim.entity.js';
import { Review } from './reviews/entities/review.entity.js';
import { ReviewReply } from './reviews/entities/review-reply.entity.js';

import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { BusinessesModule } from './businesses/businesses.module.js';
import { BusinessClaimsModule } from './business-claims/business-claims.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { DataForSeoModule } from './dataforseo/dataforseo.module.js';

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
        entities: [User, OtpCode, Business, BusinessMember, BusinessClaim, Review, ReviewReply],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    BusinessesModule,
    BusinessClaimsModule,
    ReviewsModule,
    DataForSeoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
