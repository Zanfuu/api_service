import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewSortOption } from './get-reviews-query.dto.js';

export enum ReplyStatusFilter {
  ALL = 'ALL',
  REPLIED = 'REPLIED',
  UNREPLIED = 'UNREPLIED',
}

export class DashboardReviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  rating?: number;

  @IsOptional()
  @IsEnum(ReplyStatusFilter)
  reply_status?: ReplyStatusFilter = ReplyStatusFilter.ALL;

  @IsOptional()
  @IsEnum(ReviewSortOption)
  sort?: ReviewSortOption = ReviewSortOption.NEWEST;
}
