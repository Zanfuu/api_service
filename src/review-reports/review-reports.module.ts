import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewReport } from './entities/review-report.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Business } from '../businesses/entities/business.entity.js';
import { BusinessMember } from '../businesses/entities/business-member.entity.js';
import { User } from '../users/entities/user.entity.js';
import { ReviewReportsService } from './review-reports.service.js';
import { ReviewReportsController } from './review-reports.controller.js';
import { AdminReviewReportsController } from './admin-review-reports.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewReport, Review, Business, BusinessMember, User]),
  ],
  controllers: [ReviewReportsController, AdminReviewReportsController],
  providers: [ReviewReportsService],
  exports: [ReviewReportsService, TypeOrmModule],
})
export class ReviewReportsModule {}
