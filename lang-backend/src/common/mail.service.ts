import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Gửi email qua SMTP (Nodemailer). Cấu hình qua env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * Tương thích mọi nhà cung cấp free (Brevo, Mailjet, Gmail...).
 * Khi CHƯA cấu hình SMTP → in nội dung ra log (tiện dev, không chặn luồng).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('MailService');
  private transporter: nodemailer.Transporter | null = null;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host, port, secure: port === 465, auth: { user, pass },
      });
      this.logger.log(`SMTP đã cấu hình (${host}:${port})`);
    } else {
      this.logger.warn('Chưa cấu hình SMTP — email sẽ chỉ được in ra log (chế độ dev).');
    }
  }

  /** true nếu đã cấu hình SMTP thật */
  get isConfigured(): boolean { return this.transporter !== null; }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const from = this.config.get<string>('MAIL_FROM') ?? 'Lặng <no-reply@lang.app>';
    if (!this.transporter) {
      this.logger.debug(`[DEV EMAIL] To: ${to} | ${subject}\n${html}`);
      return;
    }
    await this.transporter.sendMail({ from, to, subject, html });
  }

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4b614f">Đặt lại mật khẩu Lặng</h2>
        <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Bấm nút dưới đây để tiếp tục — liên kết có hiệu lực trong <strong>15 phút</strong>.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}" style="background:#4b614f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">Đặt lại mật khẩu</a>
        </p>
        <p style="color:#6b7280;font-size:13px">Nếu bạn không yêu cầu điều này, hãy bỏ qua email. Mật khẩu của bạn vẫn an toàn.</p>
      </div>`;
    await this.send(to, 'Đặt lại mật khẩu Lặng', html);
  }
}
