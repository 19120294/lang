import { isWeakPassword } from './weak-passwords';

describe('isWeakPassword', () => {
  const email = 'khanhlinh@lang.dev';

  it('chặn mật khẩu phổ biến', () => {
    expect(isWeakPassword('password123', email)).toBeTruthy();
    expect(isWeakPassword('qwerty', email)).toBeTruthy();
    expect(isWeakPassword('matkhau123', email)).toBeTruthy();
  });

  it('chặn mật khẩu toàn ký tự giống nhau', () => {
    expect(isWeakPassword('aaaaaaaa', email)).toBeTruthy();
  });

  it('chặn mật khẩu chứa phần tên email', () => {
    expect(isWeakPassword('khanhlinh99', email)).toBeTruthy();
  });

  it('không phân biệt hoa thường khi so khớp blocklist', () => {
    expect(isWeakPassword('PASSWORD123', email)).toBeTruthy();
  });

  it('cho phép mật khẩu mạnh / passphrase', () => {
    expect(isWeakPassword('toi-thich-mua-thu-2024', email)).toBeNull();
    expect(isWeakPassword('C@yX@nh#2024!', email)).toBeNull();
  });
});
