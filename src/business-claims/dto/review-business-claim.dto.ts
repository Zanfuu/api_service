import { IsOptional, IsString } from 'class-validator';

export class ReviewBusinessClaimDto {
  @IsOptional()
  @IsString()
  admin_notes?: string;
}
