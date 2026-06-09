import { Controller, Post, Body, Get, UseGuards, Delete } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /** Tạo guest session — không cần email/password */
  @Public()
  @Post('guest')
  guestLogin() { return this.auth.guestLogin(); }

  // Chống brute-force: tối đa 5 lần / phút / IP
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) { return this.auth.refresh(dto.refreshToken); }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) { return this.auth.forgotPassword(dto.email); }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto.token, dto.newPassword); }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: User) {
    return { id: user.id, email: user.email, isGuest: user.isGuest, isAdmin: user.isAdmin };
  }

  /** Xóa toàn bộ dữ liệu — quyền của người dùng theo NĐ13 */
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@CurrentUser() user: User) { return this.auth.deleteAccount(user.id); }
}
