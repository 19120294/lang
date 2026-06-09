import { Injectable, signal, inject } from '@angular/core';
import { MoodService } from './mood.service';

const KEY_ENABLED = 'lang_reminder_enabled';
const KEY_TIME = 'lang_reminder_time';
const KEY_LAST = 'lang_reminder_last';

/**
 * Nhắc nhở ghi mood — opt-in, dùng Notification API.
 * Web không chạy nền khi đóng tab; reminder hoạt động khi tab đang mở
 * (kiểm tra mỗi phút). Best-effort, không thay thế push notification.
 */
@Injectable({ providedIn: 'root' })
export class ReminderService {
  private mood = inject(MoodService);

  readonly enabled = signal(localStorage.getItem(KEY_ENABLED) === '1');
  readonly time = signal(localStorage.getItem(KEY_TIME) ?? '20:00');
  readonly permission = signal<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  /** Trình duyệt có hỗ trợ Notification API không */
  get supported(): boolean {
    return typeof Notification !== 'undefined';
  }

  init(): void {
    if (this.enabled()) this.startLoop();
  }

  async enable(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    this.permission.set(perm);
    if (perm !== 'granted') return false;
    this.enabled.set(true);
    localStorage.setItem(KEY_ENABLED, '1');
    this.startLoop();
    return true;
  }

  disable(): void {
    this.enabled.set(false);
    localStorage.setItem(KEY_ENABLED, '0');
    this.stopLoop();
  }

  setTime(t: string): void {
    this.time.set(t);
    localStorage.setItem(KEY_TIME, t);
  }

  private startLoop(): void {
    this.stopLoop();
    this.check();
    this.timer = setInterval(() => this.check(), 60000);
  }

  private stopLoop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private check(): void {
    if (!this.enabled() || Notification.permission !== 'granted') return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(KEY_LAST) === today) return;

    const now = new Date();
    const [h, m] = this.time().split(':').map(Number);
    const past = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
    if (!past) return;

    const loggedToday = this.mood.all().some(e => e.date === today);
    if (loggedToday) return;

    localStorage.setItem(KEY_LAST, today);
    try {
      new Notification('Lặng 🌿', {
        body: 'Hôm nay bạn cảm thấy thế nào? Dành một chút ghi lại cảm xúc nhé.',
        icon: '/favicon.ico',
        tag: 'lang-mood-reminder',
      });
    } catch { /* bỏ qua */ }
  }
}
