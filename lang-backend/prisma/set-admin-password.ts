import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

/**
 * Đổi mật khẩu admin mà KHÔNG hardcode vào code (tránh lộ trên git).
 * Cách dùng (PowerShell):
 *   $env:DATABASE_URL="<chuỗi Neon>"
 *   $env:ADMIN_PASSWORD="<mật khẩu mới>"
 *   npm run set-admin-pw
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@lang.dev';
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) {
    throw new Error('Thiếu ADMIN_PASSWORD (tối thiểu 8 ký tự). Hãy đặt biến môi trường ADMIN_PASSWORD.');
  }
  const hash = await bcrypt.hash(pw, 12);
  const user = await prisma.user.update({
    where: { email },
    data: { password: hash, isAdmin: true },
  });
  console.log(`✅ Đã đổi mật khẩu cho admin: ${user.email}`);
}

main()
  .catch((e) => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
