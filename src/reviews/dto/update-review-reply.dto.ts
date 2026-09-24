import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReviewReplyDto {
  @IsNotEmpty({ message: 'Isi balasan (content) wajib diisi' })
  @IsString()
  content: string;
}
