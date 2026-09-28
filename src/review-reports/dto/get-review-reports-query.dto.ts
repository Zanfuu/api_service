import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewReportReason } from '../enums/review-report-reason.enum.js';
import { ReviewReportStatus } from '../enums/review-report-status.enum.js';

export class GetReviewReportsQueryDto {
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

  @IsOptional()
  @IsEnum(ReviewReportStatus)
  status?: ReviewReportStatus;

  @IsOptional()
  @IsEnum(ReviewReportReason)
  reason?: ReviewReportReason;

  @IsOptional()
  @IsString()
  sort?: 'ASC' | 'DESC' = 'DESC';
}
