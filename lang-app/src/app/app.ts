import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { filter, map } from 'rxjs';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SosButtonComponent } from './shared/components/sos-button/sos-button.component';
import { OnboardingComponent } from './shared/components/onboarding/onboarding.component';
import { ChatbotComponent } from './shared/components/chatbot/chatbot.component';
import { AuthService } from './core/services/auth.service';
import { ReminderService } from './core/services/reminder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SosButtonComponent, OnboardingComponent, ChatbotComponent],
  template: `
    <app-header />
    <main id="main" class="min-h-[60vh]">
      <router-outlet />
    </main>
    <app-footer />
    <app-sos-button />
    <app-chatbot />
    <app-onboarding />
  `,
})
export class App implements OnInit {
  private auth = inject(AuthService);
  private reminder = inject(ReminderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private meta = inject(Meta);

  ngOnInit(): void {
    // Cập nhật meta description theo route (SEO)
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        let r = this.route.firstChild;
        while (r?.firstChild) r = r.firstChild;
        return r?.snapshot.data?.['description'] as string | undefined;
      }),
    ).subscribe(desc => {
      if (desc) this.meta.updateTag({ name: 'description', content: desc });
    });

    // Khởi tạo dark mode từ localStorage / prefers-color-scheme
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);

    // Guest-first: tạo session ngay khi vào app (nếu chưa có)
    this.auth.init().subscribe({
      error: () => console.warn('Không kết nối được backend — chạy ở chế độ offline (local-first).'),
    });

    // Khôi phục nhắc nhở ghi mood nếu đã bật
    this.reminder.init();
  }
}
