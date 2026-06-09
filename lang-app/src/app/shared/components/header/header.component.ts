import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Sun, Moon, Menu, X, UserRound, ChevronDown, HeartPulse, Wind, SmilePlus, NotebookPen, ShieldCheck } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem { label: string; path: string; }

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Menu = Menu;
  readonly X = X;
  readonly UserRound = UserRound;
  readonly ChevronDown = ChevronDown;
  readonly HeartPulse = HeartPulse;
  readonly Wind = Wind;
  readonly SmilePlus = SmilePlus;
  readonly NotebookPen = NotebookPen;
  readonly ShieldCheck = ShieldCheck;

  private auth = inject(AuthService);
  private host = inject(ElementRef);
  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly currentUser = this.auth.currentUser;

  isDark = signal(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches)
  );
  mobileOpen = signal(false);
  selfCareOpen = signal(false);

  // Mục chính trên nav
  readonly navLinks: NavItem[] = [
    { label: 'Đánh giá',      path: '/assessment' },
    { label: 'Tra cứu',       path: '/knowledge' },
    { label: 'Thư viện sách', path: '/books' },
    { label: 'Cộng đồng',     path: '/community' },
  ];

  // Nhóm "Tự chăm sóc" (dropdown)
  readonly selfCareLinks = [
    { label: 'Bài tập thở',     path: '/breathe',      desc: 'Thư giãn theo nhịp',   icon: Wind },
    { label: 'Cảm xúc',         path: '/mood',         desc: 'Theo dõi tâm trạng',   icon: SmilePlus },
    { label: 'Nhật ký',         path: '/journal',      desc: 'Viết ra lòng mình',    icon: NotebookPen },
    { label: 'Kế hoạch an toàn', path: '/safety-plan', desc: 'Chuẩn bị cho lúc khó', icon: ShieldCheck },
  ];

  // Mục cuối
  readonly endLinks: NavItem[] = [
    { label: 'Cơ sở hỗ trợ', path: '/facilities' },
  ];

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  toggleMobile(): void { this.mobileOpen.update(v => !v); }
  closeMobile(): void { this.mobileOpen.set(false); }
  toggleSelfCare(): void { this.selfCareOpen.update(v => !v); }
  closeSelfCare(): void { this.selfCareOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.mobileOpen.set(false); this.selfCareOpen.set(false); }

  // Đóng dropdown khi click ra ngoài
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.selfCareOpen() && !this.host.nativeElement.contains(e.target)) {
      this.selfCareOpen.set(false);
    }
  }
}
