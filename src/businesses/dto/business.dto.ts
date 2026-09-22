import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BusinessStatus } from '../entities/business.entity.js';
import { BusinessRole } from '../entities/business-member.entity.js';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;
}

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  googlePlaceId?: string;

  @IsOptional()
  @IsEnum(BusinessStatus)
  status?: BusinessStatus;
}

export class SyncGoogleBusinessDto {
  @IsOptional()
  @IsString()
  googlePlaceId?: string;
}

export class AddBusinessMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsEnum(BusinessRole)
  role?: BusinessRole;
}
