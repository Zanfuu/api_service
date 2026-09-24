import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessClaimStatus } from '../entities/business-claim.entity.js';

export class BusinessClaimQueryDto {
  @IsOptional()
  @IsEnum(BusinessClaimStatus)
  status?: BusinessClaimStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
