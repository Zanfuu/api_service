import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessClaimsService } from './business-claims.service.js';
import { ReviewBusinessClaimDto } from './dto/review-business-claim.dto.js';
import { BusinessClaimQueryDto } from './dto/business-claim-query.dto.js';
import { PlatformRoleGuard, PlatformRoles } from './guards/platform-role.guard.js';
import { PlatformRole } from '../users/entities/user.entity.js';

@Controller('admin/business-claims')
@UseGuards(AuthGuard('jwt'), PlatformRoleGuard)
@PlatformRoles(PlatformRole.SUPER_ADMIN)
export class AdminBusinessClaimsController {
  constructor(private readonly businessClaimsService: BusinessClaimsService) {}

  @Get()
  async getClaims(@Query() query: BusinessClaimQueryDto) {
    return this.businessClaimsService.getClaimsForAdmin(query);
  }

  @Get(':id')
  async getClaimDetail(@Param('id') id: string) {
    return this.businessClaimsService.getClaimDetail(id);
  }

  @Post(':id/approve')
  async approveClaim(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewBusinessClaimDto,
  ) {
    return this.businessClaimsService.approveClaim(req.user.id, id, dto);
  }

  @Post(':id/reject')
  async rejectClaim(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewBusinessClaimDto,
  ) {
    return this.businessClaimsService.rejectClaim(req.user.id, id, dto);
  }
}
