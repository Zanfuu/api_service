import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { OtpType } from '../entities/otp-code.entity.js';

export class SendOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsEnum(OtpType, { message: 'Tipe OTP harus REGISTRATION atau FORGOT_PASSWORD' })
  @IsNotEmpty({ message: 'Tipe OTP wajib diisi' })
  type: OtpType;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP wajib diisi' })
  @Length(6, 6, { message: 'Kode OTP harus 6 digit' })
  otp: string;

  @IsEnum(OtpType, { message: 'Tipe OTP harus REGISTRATION atau FORGOT_PASSWORD' })
  @IsNotEmpty({ message: 'Tipe OTP wajib diisi' })
  type: OtpType;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP wajib diisi' })
  @Length(6, 6, { message: 'Kode OTP harus 6 digit' })
  otp: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode OTP wajib diisi' })
  @Length(6, 6, { message: 'Kode OTP harus 6 digit' })
  otp: string;

  @IsString()
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Password lama wajib diisi' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @MinLength(6, { message: 'Password baru minimal 6 karakter' })
  newPassword: string;
}
