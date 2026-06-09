/** Danh sách mật khẩu phổ biến/yếu cần chặn (chuẩn hóa lowercase) */
export const WEAK_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123',
  'qwerty', 'qwertyuiop', 'qwerty123', '11111111', '00000000', '12341234',
  'abc12345', 'iloveyou', 'admin123', 'welcome1', 'letmein1', 'sunshine',
  'princess', 'football', 'baseball', 'dragon123', 'monkey123', 'master123',
  'matkhau', 'matkhau123', '88888888', '66668888', 'aa123456', 'a1234567',
  'p@ssw0rd', 'passw0rd', 'changeme', 'whatever', 'trustno1', 'superman',
]);

/** Kiểm tra mật khẩu có yếu không (quá phổ biến hoặc chứa email/tên đăng nhập) */
export function isWeakPassword(password: string, email: string): string | null {
  const pw = password.toLowerCase();
  if (WEAK_PASSWORDS.has(pw)) {
    return 'Mật khẩu này quá phổ biến và dễ đoán. Vui lòng chọn mật khẩu khác.';
  }
  // Toàn ký tự giống nhau (aaaaaaaa) hoặc dãy số liên tục đơn giản
  if (/^(.)\1+$/.test(pw)) {
    return 'Mật khẩu quá đơn giản (toàn ký tự giống nhau).';
  }
  // Không được trùng/chứa phần tên email
  const localPart = email.toLowerCase().split('@')[0];
  if (localPart.length >= 3 && pw.includes(localPart)) {
    return 'Mật khẩu không nên chứa địa chỉ email của bạn.';
  }
  return null;
}
