import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessesService } from './businesses.service.js';
import { CreateBusinessDto, UpdateBusinessDto, AddBusinessMemberDto, SyncGoogleBusinessDto } from './dto/business.dto.js';
import { SyncBusinessesDto } from './dto/sync-businesses.dto.js';
import { GetBusinessesQueryDto } from './dto/get-businesses-query.dto.js';
import { BusinessMemberGuard } from '../business-claims/guards/business-member.guard.js';

@Controller()
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post('internal/businesses/sync')
  async syncInternal(@Body() dto: SyncBusinessesDto) {
    return this.businessesService.syncBusinesses(dto);
  }

  @Get('businesses')
  async findAll(@Query() query: GetBusinessesQueryDto) {
    return this.businessesService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-businesses')
  async getMyBusinesses(@Request() req: any) {
    return this.businessesService.getMyBusinesses(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), BusinessMemberGuard)
  @Get('businesses/:businessId/dashboard')
  async getDashboard(@Request() req: any, @Param('businessId') businessId: string) {
    const business = await this.businessesService.findOne(businessId, req.user.id);
    return {
      message: 'Selamat datang di Business Dashboard Katamereka',
      role: req.businessMember?.role,
      business: business.data,
    };
  }

  @Get('businesses/slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Get('businesses/:id')
  async findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('businesses')
  async create(@Request() req: any, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('businesses/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('businesses/:id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddBusinessMemberDto) {
    return this.businessesService.addMember(id, dto);
  }
}
