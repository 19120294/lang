import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, CalendarCheck, Smile, TrendingUp, ChevronLeft, ChevronRight, Lock, Laugh, Meh, Angry, Frown, Bell, BellOff, Flame } from 'lucide-angular';
import { MoodService } from '../../core/services/mood.service';
import { MoodLevel, MOOD_META } from '../../core/models/mood.model';
import { ReminderService } from '../../core/services/reminder.service';

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './mood.component.html',
})
export class MoodComponent {
  readonly CalendarCheck = CalendarCheck;
  readonly Smile = Smile;
  readonly TrendingUp = TrendingUp;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Lock = Lock;
  readonly Laugh = Laugh;
  readonly Meh = Meh;
  readonly Angry = Angry;
  readonly Frown = Frown;
  readonly Bell = Bell;
  readonly BellOff = BellOff;
  readonly Flame = Flame;
  readonly MOOD_META = MOOD_META;

  private moodService = inject(MoodService);
  readonly reminder = inject(ReminderService);

  reminderError = signal<string | null>(null);

  // ===== Ghi cảm xúc hôm nay (vote) =====
  readonly moodIcons = [
    { level: 'great'   as MoodLevel, icon: Laugh, meta: MOOD_META['great'] },
    { level: 'ok'      as MoodLevel, icon: Smile, meta: MOOD_META['ok'] },
    { level: 'anxious' as MoodLevel, icon: Meh,   meta: MOOD_META['anxious'] },
    { level: 'angry'   as MoodLevel, icon: Angry, meta: MOOD_META['angry'] },
    { level: 'bad'     as MoodLevel, icon: Frown, meta: MOOD_META['bad'] },
  ];
  private readonly todayKey = new Date().toISOString().slice(0, 10);
  readonly todayMood = computed(() => this.moodService.all().find(e => e.date === this.todayKey)?.mood ?? null);
  noteDraft = signal('');

  logMood(level: MoodLevel): void {
    const note = this.noteDraft().trim() || undefined;
    this.moodService.add(level, note);
    this.noteDraft.set('');
  }

  /** Chuỗi ngày ghi cảm xúc liên tiếp (tính tới hôm nay hoặc hôm qua) */
  readonly streak = computed(() => {
    const dates = new Set(this.moodService.all().map(e => e.date));
    let count = 0;
    const d = new Date();
    if (!dates.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1); // chưa ghi hôm nay vẫn tính chuỗi tới hôm qua
    while (dates.has(d.toISOString().slice(0, 10))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  });

  async toggleReminder(): Promise<void> {
    this.reminderError.set(null);
    if (this.reminder.enabled()) {
      this.reminder.disable();
    } else {
      const ok = await this.reminder.enable();
      if (!ok) {
        this.reminderError.set(
          this.reminder.supported
            ? 'Bạn cần cho phép thông báo trong trình duyệt để bật nhắc nhở.'
            : 'Trình duyệt không hỗ trợ thông báo.'
        );
      }
    }
  }

  onReminderTime(e: Event): void {
    this.reminder.setTime((e.target as HTMLInputElement).value);
  }

  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth()); // 0-based

  private allEntries = computed(() => this.moodService.all());

  readonly calendarDays = computed(() => {
    const y = this.viewYear();
    const m = this.viewMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Monday=0 offset
    const firstDay = (new Date(y, m, 1).getDay() + 6) % 7;
    const entries = this.allEntries();
    const map = new Map(entries.map(e => [e.date, e.mood]));

    const days: { day: number | null; date: string; mood: MoodLevel | null }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: null, date: '', mood: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      days.push({ day: d, date, mood: map.get(date) ?? null });
    }
    return days;
  });

  readonly monthLabel = computed(() => {
    return new Date(this.viewYear(), this.viewMonth(), 1)
      .toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  });

  readonly stats = computed(() => {
    const entries = this.allEntries();
    const y = this.viewYear();
    const m = this.viewMonth();
    const prefix = `${y}-${String(m + 1).padStart(2,'0')}`;
    const monthEntries = entries.filter(e => e.date.startsWith(prefix));
    const counts = monthEntries.reduce((acc, e) => ({ ...acc, [e.mood]: (acc[e.mood as string] ?? 0) + 1 }), {} as Record<string,number>);
    const topMood = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    return { logged: monthEntries.length, topMood: topMood ? topMood[0] as MoodLevel : null };
  });

  readonly recentEntries = computed(() =>
    this.allEntries().slice(0, 7)
  );

  /** Giá trị số cho từng mood (cao = tích cực) */
  private readonly MOOD_VALUE: Record<MoodLevel, number> = {
    great: 5, ok: 4, anxious: 3, angry: 2, bad: 1,
  };

  /**
   * Dữ liệu biểu đồ xu hướng cho tháng đang xem.
   * Trả về các điểm có dữ liệu + tọa độ SVG (viewBox 300x100).
   */
  readonly chart = computed(() => {
    const y = this.viewYear();
    const m = this.viewMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const map = new Map(this.allEntries().map(e => [e.date, e.mood]));

    const points: { day: number; value: number; mood: MoodLevel; x: number; y: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const mood = map.get(date);
      if (!mood) continue;
      const value = this.MOOD_VALUE[mood];
      const x = ((d - 1) / (daysInMonth - 1)) * 300;
      const yPos = 100 - ((value - 1) / 4) * 90 - 5; // 5..95
      points.push({ day: d, value, mood, x, y: yPos });
    }

    // Đường polyline nối các điểm
    const path = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { points, path, hasData: points.length >= 2 };
  });

  moodDot(mood: MoodLevel): string {
    const map: Record<MoodLevel, string> = {
      great: 'fill-sage-500', ok: 'fill-sage-400', anxious: 'fill-stone-400', angry: 'fill-sos-400', bad: 'fill-sos-600',
    };
    return map[mood];
  }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewYear.update(y => y-1); this.viewMonth.set(11); }
    else this.viewMonth.update(m => m-1);
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewYear.update(y => y+1); this.viewMonth.set(0); }
    else this.viewMonth.update(m => m+1);
  }

  moodBg(mood: MoodLevel | null): string {
    if (!mood) return 'bg-stone-100 dark:bg-sage-700/40';
    const map: Record<MoodLevel, string> = {
      great: 'bg-sage-400', ok: 'bg-sage-200', anxious: 'bg-stone-300', angry: 'bg-sos-200', bad: 'bg-sos-400',
    };
    return map[mood];
  }

  moodIcon(mood: MoodLevel) {
    const map = { great: this.Laugh, ok: this.Smile, anxious: this.Meh, angry: this.Angry, bad: this.Frown };
    return map[mood];
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', { weekday:'long', day:'numeric', month:'long' });
  }
}
