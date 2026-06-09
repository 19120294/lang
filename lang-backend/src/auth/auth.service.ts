import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { isWeakPassword } from './weak-passwords';
import { MailService } from '../common/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  /** Hash refresh token để lưu DB (nếu DB rò rỉ, token vẫn không dùng lại được) */
  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /** Tạo guest token — không cần đăng ký */
  async guestLogin() {
    const guest = await this.prisma.user.create({
      data: { isGuest: true },
    });
    return this.issueTokens(guest.id, undefined, true);
  }

  async register(dto: RegisterDto) {
    // Chặn mật khẩu yếu/phổ biến/trùng email
    const weak = isWeakPassword(dto.password, dto.email);
    if (weak) throw new BadRequestException(weak);

    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hash },
    });
    return this.issueTokens(user.id, user.email ?? undefined, false);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (!user || !user.password) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Sai email hoặc mật khẩu');

    return this.issueTokens(user.id, user.email ?? undefined, false);
  }

  async refresh(token: string) {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });
    if (!record || record.expiresAt < new Date()) {
      if (record) await this.prisma.refreshToken.delete({ where: { token: tokenHash } });
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    await this.prisma.refreshToken.delete({ where: { token: tokenHash } });
    return this.issueTokens(record.user.id, record.user.email ?? undefined, record.user.isGuest);
  }

  /**
   * Quên mật khẩu: tạo token reset (hết hạn 15 phút).
   * Production: gửi token qua email. Dev: trả token trong response để thử.
   * Luôn trả message chung để không lộ email nào tồn tại.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
    const generic = { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' };
    if (!user) return generic;

    const raw = randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: this.hashToken(raw),
        resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Gửi email chứa liên kết đặt lại
    const frontend = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    const resetUrl = `${frontend}/auth?reset=${raw}`;
    await this.mail.sendPasswordReset(user.email!, resetUrl);

    // Khi CHƯA cấu hình SMTP (dev) → trả token để thử ngay. Có SMTP → chỉ message chung.
    return this.mail.isConfigured ? generic : { ...generic, resetToken: raw };
  }

  async resetPassword(token: string, newPassword: string) {
    const hash = this.hashToken(token);
    const user = await this.prisma.user.findFirst({
      where: { resetTokenHash: hash, resetTokenExpiry: { gt: new Date() }, deletedAt: null },
    });
    if (!user) throw new BadRequestException('Liên kết đặt lại không hợp lệ hoặc đã hết hạn.');

    const weak = isWeakPassword(newPassword, user.email ?? '');
    if (weak) throw new BadRequestException(weak);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash, resetTokenHash: null, resetTokenExpiry: null },
    });
    // Đăng xuất mọi phiên cũ
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return { message: 'Đặt lại mật khẩu thành công. Hãy đăng nhập lại.' };
  }

  /** Xóa toàn bộ dữ liệu người dùng (quyền xóa theo NĐ13) */
  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: null,
        password: null,
      },
    });
    // Xóa các bản ghi con ngay lập tức
    await Promise.all([
      this.prisma.moodEntry.deleteMany({ where: { userId } }),
      this.prisma.journalEntry.deleteMany({ where: { userId } }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);
    return { message: 'Dữ liệu của bạn đã được xóa hoàn toàn' };
  }

  private async issueTokens(userId: string, email?: string, isGuest = false) {
    const payload = { sub: userId, email, isGuest };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshRaw = randomBytes(40).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(refreshRaw), // lưu hash, không lưu token thô
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      },
    });
    return { accessToken, refreshToken: refreshRaw };
  }
}
