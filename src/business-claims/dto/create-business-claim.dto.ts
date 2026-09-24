import { IsEnum, IsOptional, IsString, IsUrl, IsObject } from 'class-validator';
import { VerificationMethod } from '../entities/business-claim.entity.js';

export class CreateBusinessClaimDto {
  @IsOptional()
  @IsEnum(VerificationMethod)
  verification_method?: VerificationMethod;

  @IsOptional()
  @IsUrl({}, { message: 'proof_url harus berupa URL yang valid' })
  proof_url?: string;

  @IsOptional()
  @IsObject()
  verification_data?: Record<string, any>;

  @IsOptional()
  @IsString()
  message?: string;
}
