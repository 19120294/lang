import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/** Chỉ cho phép user có isAdmin=true. Dùng SAU JwtAuthGuard. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user?.isAdmin) {
      throw new ForbiddenException('Chỉ quản trị viên mới có quyền truy cập');
    }
    return true;
  }
}
