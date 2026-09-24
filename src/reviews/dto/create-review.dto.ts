import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt({ message: 'Rating harus berupa angka bulat' })
  @Min(1, { message: 'Rating minimal 1' })
  @Max(5, { message: 'Rating maksimal 5' })
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty({ message: 'Isi ulasan (content) wajib diisi' })
  @IsString()
  content: string;
}
