import { IsNotEmpty, IsString } from 'class-validator';

export class SyncBusinessesDto {
  @IsString()
  @IsNotEmpty({ message: 'Keyword pencarian wajib diisi' })
  keyword: string;

  @IsString()
  @IsNotEmpty({ message: 'Lokasi pencarian wajib diisi' })
  location: string;
}
