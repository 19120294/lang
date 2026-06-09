import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { MoodEntry, MoodLevel } from '../models/mood.model';
import { MoodApiService } from './mood-api.service';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'lang_mood_entries';

/**
 * Local-first: localStorage là nguồn hiển thị tức thì.
 * Nếu user đã đăng nhập → đồng bộ best-effort lên server (mã hóa).
 */
@Injectable({ providedIn: 'root' })
export class MoodService {
  private api = inject(MoodApiService);
  private auth = inject(AuthService);

  private readonly entries = signal<MoodEntry[]>(this.load());
  private pulled = false;

  constructor() {
    // Khi user đăng nhập → tự động kéo dữ liệu từ server (chỉ 1 lần)
    effect(() => {
      if (this.auth.isLoggedIn() && !this.pulled) {
        this.pulled = true;
        this.pullFromServer();
      }
    });
  }

  readonly all = computed(() => this.entries());
  readonly thisMonth = computed(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.entries().filter(e => e.date.startsWith(prefix));
  });

  add(mood: MoodLevel, note?: string): void {
    const today = new Date().toISOString().slice(0, 10);
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date: today,
      mood,
      note,
      createdAt: Date.now(),
    };
    const updated = [entry, ...this.entries().filter(e => e.date !== today)];
    this.entries.set(updated);
    this.persist(updated);

    if (this.auth.isLoggedIn()) {
      this.api.upsert(today, mood, note).subscribe({ error: () => {} });
    }
  }

  remove(id: string): void {
    const entry = this.entries().find(e => e.id === id);
    const updated = this.entries().filter(e => e.id !== id);
    this.entries.set(updated);
    this.persist(updated);

    if (entry && this.auth.isLoggedIn()) {
      this.api.remove(entry.date).subscribe({ error: () => {} });
    }
  }

  /** Kéo dữ liệu từ server và merge vào local (gọi khi đăng nhập xong) */
  pullFromServer(): void {
    if (!this.auth.isLoggedIn()) return;
    this.api.getAll().subscribe({
      next: server => {
        // Merge: server là nguồn ưu tiên theo date; giữ entry local chưa có trên server
        const byDate = new Map<string, MoodEntry>();
        for (const e of this.entries()) byDate.set(e.date, e);
        for (const e of server) byDate.set(e.date, e);
        const merged = [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
        this.entries.set(merged);
        this.persist(merged);
      },
      error: () => {},
    });
  }

  private load(): MoodEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(entries: MoodEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}
