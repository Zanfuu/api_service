import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReviewReportReason } from '../enums/review-report-reason.enum.js';

export class CreateReviewReportDto {
  @IsNotEmpty({ message: 'Alasan laporan wajib dipilih' })
  @IsEnum(ReviewReportReason, { message: 'Alasan laporan tidak valid' })
  reason: ReviewReportReason;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Detail penjelasan maksimal 1000 karakter' })
  description?: string;
}
