import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { OtpType } from './entities/otp-code.entity.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_SECRET');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_SECRET belum dikonfigurasi di environment!');
    }
  }

  async sendOtpEmail(email: string, code: string, type: OtpType): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_SECRET');
    if (!apiKey) {
      this.logger.error('Tidak dapat mengirim email: RESEND_SECRET belum diset.');
      throw new InternalServerErrorException('Konfigurasi email server belum lengkap');
    }

    if (!this.resend) {
      this.resend = new Resend(apiKey);
    }

    const isRegistration = type === OtpType.REGISTRATION;
    const subject = isRegistration
      ? 'Kode OTP Verifikasi Registrasi - Katamereka'
      : 'Kode OTP Reset Password - Katamereka';

    const title = isRegistration ? 'Verifikasi Email Registrasi' : 'Reset Password Akun';
    const description = isRegistration
      ? 'Terima kasih telah mendaftar di <strong>Katamereka</strong>. Gunakan kode OTP di bawah ini untuk menyelesaikan proses registrasi akun Anda:'
      : 'Kami menerima permintaan untuk mereset password akun <strong>Katamereka</strong> Anda. Gunakan kode OTP di bawah ini untuk melanjutkan reset password:';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: bold; color: #4F46E5; letter-spacing: -0.5px; }
          .title { font-size: 20px; font-weight: 600; color: #111827; margin-top: 10px; margin-bottom: 10px; }
          .description { font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 25px; }
          .otp-box { background-color: #EEF2FF; border: 2px dashed #6366F1; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 25px; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4F46E5; }
          .footer-note { font-size: 12px; color: #9CA3AF; text-align: center; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Katamereka</div>
            <div class="title">${title}</div>
          </div>
          <div class="description">${description}</div>
          <div class="otp-box">
            <div class="otp-code">${code}</div>
          </div>
          <div class="description" style="font-size: 13px; color: #6B7280; text-align: center;">
            Kode OTP ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.
          </div>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;" />
          <div class="footer-note">
            Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.<br>
            &copy; ${new Date().getFullYear()} Katamereka. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const fromAddress = this.configService.get<string>('RESEND_FROM_EMAIL') || 'Katamereka <onboarding@resend.dev>';
      const data = await this.resend.emails.send({
        from: fromAddress,
        to: [email],
        subject,
        html: htmlContent,
      });

      this.logger.log(`OTP Email berhasil dikirim ke ${email} (ID: ${data.data?.id})`);
    } catch (error: any) {
      this.logger.error(`Gagal mengirim OTP email ke ${email}:`, error);
      throw new InternalServerErrorException(`Gagal mengirim email OTP: ${error?.message || 'Error server Resend'}`);
    }
  }
}
