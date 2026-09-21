import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BusinessesService } from './businesses.service.js';
import { CreateBusinessDto, UpdateBusinessDto, AddBusinessMemberDto } from './dto/business.dto.js';

@Controller('businesses')
@UseGuards(AuthGuard('jwt'))
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(req.user.id, dto);
  }

  @Get()
  async findAll() {
    return this.businessesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, dto);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddBusinessMemberDto) {
    return this.businessesService.addMember(id, dto);
  }
}
