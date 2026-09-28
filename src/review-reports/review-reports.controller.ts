import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewReportsService } from './review-reports.service.js';
import { CreateReviewReportDto } from './dto/create-review-report.dto.js';
import { GetReviewReportsQueryDto } from './dto/get-review-reports-query.dto.js';
import { BusinessMemberGuard } from '../business-claims/guards/business-member.guard.js';
import { BusinessRoleGuard, BusinessRoles } from '../business-claims/guards/business-role.guard.js';
import { BusinessRole } from '../businesses/entities/business-member.entity.js';

@Controller()
export class ReviewReportsController {
  constructor(private readonly reviewReportsService: ReviewReportsService) {}

  // USER ENDPOINTS
  @UseGuards(AuthGuard('jwt'))
  @Post('reviews/:reviewId/report')
  async createReport(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReviewReportDto,
  ) {
    return this.reviewReportsService.createReport(req.user.id, reviewId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('reviews/:reviewId/report-status')
  async getUserReportStatus(@Request() req: any, @Param('reviewId') reviewId: string) {
    return this.reviewReportsService.getUserReportStatus(req.user.id, reviewId);
  }

  // BUSINESS DASHBOARD ENDPOINTS
  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @Get('businesses/:businessId/review-reports/summary')
  async getBusinessReportsSummary(@Param('businessId') businessId: string) {
    return this.reviewReportsService.getBusinessReportsSummary(businessId);
  }

  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @Get('businesses/:businessId/review-reports')
  async getBusinessReports(
    @Param('businessId') businessId: string,
    @Query() query: GetReviewReportsQueryDto,
  ) {
    return this.reviewReportsService.getBusinessReports(businessId, query);
  }

  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @Get('businesses/:businessId/review-reports/:reportId')
  async getBusinessReportDetail(
    @Param('businessId') businessId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reviewReportsService.getBusinessReportDetail(businessId, reportId);
  }

  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @Post('businesses/:businessId/review-reports/:reportId/keep')
  async keepReview(
    @Request() req: any,
    @Param('businessId') businessId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reviewReportsService.keepReview(businessId, reportId, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN)
  @Post('businesses/:businessId/review-reports/:reportId/hide')
  async hideReview(
    @Request() req: any,
    @Param('businessId') businessId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reviewReportsService.hideReview(businessId, reportId, req.user.id);
  }
}
