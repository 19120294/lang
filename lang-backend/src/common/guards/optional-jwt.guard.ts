import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Xác thực tùy chọn: nếu có token hợp lệ → gắn req.user;
 * nếu không có / không hợp lệ → vẫn cho qua (req.user = undefined).
 * Dùng cho endpoint cho phép cả người dùng ẩn danh lẫn đã đăng nhập.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Bỏ qua việc throw khi không có user
  handleRequest(err: any, user: any) {
    return user ?? null;
  }
}
