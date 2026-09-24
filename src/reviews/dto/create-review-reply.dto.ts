import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReviewReplyDto {
  @IsNotEmpty({ message: 'Isi balasan (content) wajib diisi' })
  @IsString()
  content: string;
}
