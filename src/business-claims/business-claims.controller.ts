import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessClaimsService } from './business-claims.service.js';
import { CreateBusinessClaimDto } from './dto/create-business-claim.dto.js';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class BusinessClaimsController {
  constructor(private readonly businessClaimsService: BusinessClaimsService) {}

  @Post('businesses/:businessId/claim')
  async createClaim(
    @Request() req: any,
    @Param('businessId') businessId: string,
    @Body() dto: CreateBusinessClaimDto,
  ) {
    return this.businessClaimsService.createClaim(req.user.id, businessId, dto);
  }

  @Get('businesses/:businessId/claim-status')
  async getClaimStatus(@Request() req: any, @Param('businessId') businessId: string) {
    return this.businessClaimsService.getClaimStatus(req.user.id, businessId);
  }

  @Get('my-business-claims')
  async getMyClaims(@Request() req: any) {
    return this.businessClaimsService.getMyClaims(req.user.id);
  }
}
