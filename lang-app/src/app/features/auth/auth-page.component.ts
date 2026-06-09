import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, ArrowRight, ShieldCheck, Info } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

type Mode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './auth-page.component.html',
})
export class AuthPageComponent implements OnInit {
  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly ArrowRight = ArrowRight;
  readonly ShieldCheck = ShieldCheck;
  readonly Info = Info;

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Mở từ link reset trong email: /auth?reset=<token>
    const token = this.route.snapshot.queryParamMap.get('reset');
    if (token) {
      this.mode.set('forgot');
      this.forgotStep.set('reset');
      this.resetToken.set(token);
    }
  }

  mode = signal<Mode>('login');
  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  /** Đo độ mạnh mật khẩu (chỉ để hướng dẫn, không chặn) */
  readonly strength = computed(() => {
    const p = this.password();
    if (!p) return { score: 0, label: '', barClass: '', pct: 0 };
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    const score = Math.min(s, 4);
    const meta = [
      { label: 'Rất yếu',   barClass: 'bg-sos-500' },
      { label: 'Yếu',       barClass: 'bg-sos-400' },
      { label: 'Trung bình', barClass: 'bg-stone-400' },
      { label: 'Khá',       barClass: 'bg-sage-500' },
      { label: 'Mạnh',      barClass: 'bg-sage-600' },
    ][score];
    return { score, label: meta.label, barClass: meta.barClass, pct: ((score + 1) / 5) * 100 };
  });

  setMode(m: Mode): void {
    this.mode.set(m);
    this.error.set(null);
  }

  submit(): void {
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.error.set('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    if (this.mode() === 'register' && password.length < 8) {
      this.error.set('Mật khẩu cần tối thiểu 8 ký tự.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const op = this.mode() === 'login'
      ? this.auth.login(email, password)
      : this.auth.register(email, password);

    op.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message;
        this.error.set(
          typeof msg === 'string' ? msg
          : this.mode() === 'login' ? 'Sai email hoặc mật khẩu.'
          : 'Email đã được sử dụng hoặc dữ liệu không hợp lệ.'
        );
      },
    });
  }

  // ===== Quên mật khẩu =====
  forgotStep = signal<'email' | 'reset'>('email');
  resetToken = signal('');
  newPassword = signal('');
  forgotMsg = signal<string | null>(null);

  submitForgot(): void {
    const email = this.email().trim();
    if (!email) { this.error.set('Vui lòng nhập email.'); return; }
    this.loading.set(true); this.error.set(null);
    this.auth.forgotPassword(email).subscribe({
      next: res => {
        this.loading.set(false);
        this.forgotMsg.set(res.message);
        if (res.resetToken) { this.resetToken.set(res.resetToken); this.forgotStep.set('reset'); }
      },
      error: () => { this.loading.set(false); this.error.set('Có lỗi xảy ra, thử lại sau.'); },
    });
  }

  submitReset(): void {
    const token = this.resetToken().trim();
    const pw = this.newPassword();
    if (!token || pw.length < 8) { this.error.set('Cần token và mật khẩu mới (≥ 8 ký tự).'); return; }
    this.loading.set(true); this.error.set(null);
    this.auth.resetPassword(token, pw).subscribe({
      next: () => {
        this.loading.set(false);
        this.setMode('login');
        this.forgotStep.set('email'); this.resetToken.set(''); this.newPassword.set('');
        this.forgotMsg.set('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
      },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.message || 'Token không hợp lệ hoặc đã hết hạn.'); },
    });
  }
}
