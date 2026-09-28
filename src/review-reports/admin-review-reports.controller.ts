import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewReportsService } from './review-reports.service.js';
import { GetReviewReportsQueryDto } from './dto/get-review-reports-query.dto.js';
import { PlatformRoleGuard, PlatformRoles } from '../business-claims/guards/platform-role.guard.js';
import { PlatformRole } from '../users/entities/user.entity.js';

@Controller('admin/review-reports')
@UseGuards(AuthGuard('jwt'), PlatformRoleGuard)
@PlatformRoles(PlatformRole.SUPER_ADMIN)
export class AdminReviewReportsController {
  constructor(private readonly reviewReportsService: ReviewReportsService) {}

  @Get()
  async getAdminReports(@Query() query: GetReviewReportsQueryDto) {
    return this.reviewReportsService.getAdminReports(query);
  }

  @Get(':id')
  async getAdminReportDetail(@Param('id') id: string) {
    return this.reviewReportsService.getAdminReportDetail(id);
  }
}
