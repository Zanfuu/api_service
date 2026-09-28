import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminManagementService } from './admin-management.service.js';
import { AdminQueryDto } from './dto/admin-query.dto.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto.js';
import { PlatformRoleGuard, PlatformRoles } from '../business-claims/guards/platform-role.guard.js';
import { PlatformRole } from '../users/entities/user.entity.js';

@Controller('admin/admins')
@UseGuards(AuthGuard('jwt'), PlatformRoleGuard)
@PlatformRoles(PlatformRole.SUPER_ADMIN)
export class AdminManagementController {
  constructor(private readonly adminManagementService: AdminManagementService) {}

  @Get()
  async getAdmins(@Query() query: AdminQueryDto) {
    return this.adminManagementService.getAdmins(query);
  }

  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminManagementService.createAdmin(dto);
  }

  @Patch(':id/status')
  async updateAdminStatus(@Param('id') id: string, @Body() dto: UpdateAdminStatusDto) {
    return this.adminManagementService.updateAdminStatus(id, dto);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminManagementService.deleteAdmin(id);
  }
}
