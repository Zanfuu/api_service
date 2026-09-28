import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../../users/entities/user.entity.js';

export class UpdateAdminStatusDto {
  @IsNotEmpty({ message: 'Status wajib diisi' })
  @IsEnum(UserStatus, { message: 'Status harus ACTIVE, PENDING, atau SUSPENDED' })
  status: UserStatus;
}
