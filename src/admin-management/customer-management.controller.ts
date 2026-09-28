import {
  Controller,
  Get,
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
import { UpdateAdminStatusDto } from './dto/update-admin-status.dto.js';
import { PlatformRoleGuard, PlatformRoles } from '../business-claims/guards/platform-role.guard.js';
import { PlatformRole } from '../users/entities/user.entity.js';

@Controller('admin/customers')
@UseGuards(AuthGuard('jwt'), PlatformRoleGuard)
@PlatformRoles(PlatformRole.SUPER_ADMIN)
export class CustomerManagementController {
  constructor(private readonly adminManagementService: AdminManagementService) {}

  @Get()
  async getCustomers(@Query() query: AdminQueryDto) {
    return this.adminManagementService.getCustomers(query);
  }

  @Patch(':id/status')
  async updateCustomerStatus(@Param('id') id: string, @Body() dto: UpdateAdminStatusDto) {
    return this.adminManagementService.updateAdminStatus(id, dto);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.adminManagementService.deleteAdmin(id);
  }
}
