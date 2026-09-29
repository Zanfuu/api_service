import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncBusinessesDto {
  @IsString()
  @IsNotEmpty({ message: 'Keyword pencarian wajib diisi' })
  keyword: string;

  @IsString()
  @IsNotEmpty({ message: 'Lokasi pencarian wajib diisi' })
  location: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;
}
