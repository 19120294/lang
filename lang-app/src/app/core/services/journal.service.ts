import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { JournalEntry } from '../models/journal.model';
import { MoodLevel } from '../models/mood.model';
import { JournalApiService } from './journal-api.service';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'lang_journal_entries';

/**
 * Local-first: localStorage là nguồn hiển thị tức thì.
 * Khi đăng nhập → đồng bộ best-effort lên server (content mã hóa).
 */
@Injectable({ providedIn: 'root' })
export class JournalService {
  private api = inject(JournalApiService);
  private auth = inject(AuthService);

  private readonly entries = signal<JournalEntry[]>(this.load());
  private pulled = false;

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn() && !this.pulled) {
        this.pulled = true;
        this.pullFromServer();
      }
    });
  }

  readonly all = computed(() =>
    [...this.entries()].sort((a, b) => b.createdAt - a.createdAt)
  );

  save(content: string, mood?: MoodLevel, title?: string): JournalEntry {
    const now = Date.now();
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      title,
      content,
      mood,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [entry, ...this.entries()];
    this.entries.set(updated);
    this.persist(updated);

    // Sync: thay id local bằng id server để update/delete sau khớp
    if (this.auth.isLoggedIn()) {
      this.api.create(content, mood, title).subscribe({
        next: srv => this.replaceId(entry.id, this.normalize(srv)),
        error: () => {},
      });
    }
    return entry;
  }

  update(id: string, content: string, title?: string): void {
    const updated = this.entries().map(e =>
      e.id === id ? { ...e, content, title, updatedAt: Date.now() } : e
    );
    this.entries.set(updated);
    this.persist(updated);

    if (this.auth.isLoggedIn() && this.isServerId(id)) {
      this.api.update(id, content, title).subscribe({ error: () => {} });
    }
  }

  remove(id: string): void {
    const updated = this.entries().filter(e => e.id !== id);
    this.entries.set(updated);
    this.persist(updated);

    if (this.auth.isLoggedIn() && this.isServerId(id)) {
      this.api.remove(id).subscribe({ error: () => {} });
    }
  }

  /** Kéo dữ liệu server, merge (thêm entry server chưa có trong local) */
  pullFromServer(): void {
    if (!this.auth.isLoggedIn()) return;
    this.api.getAll().subscribe({
      next: server => {
        const localIds = new Set(this.entries().map(e => e.id));
        const newOnes = server.map(e => this.normalize(e)).filter(e => !localIds.has(e.id));
        const merged = [...this.entries(), ...newOnes];
        this.entries.set(merged);
        this.persist(merged);
      },
      error: () => {},
    });
  }

  /** Backend trả createdAt/updatedAt dạng ISO string → chuyển sang number */
  private normalize(e: any): JournalEntry {
    return {
      ...e,
      createdAt: typeof e.createdAt === 'string' ? Date.parse(e.createdAt) : e.createdAt,
      updatedAt: typeof e.updatedAt === 'string' ? Date.parse(e.updatedAt) : e.updatedAt,
    };
  }

  private replaceId(oldId: string, serverEntry: JournalEntry): void {
    const updated = this.entries().map(e => e.id === oldId ? serverEntry : e);
    this.entries.set(updated);
    this.persist(updated);
  }

  /** cuid của Prisma dài ~25 ký tự, không có dấu '-' như uuid */
  private isServerId(id: string): boolean {
    return !id.includes('-');
  }

  private load(): JournalEntry[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      return [];
    }
  }

  private persist(entries: JournalEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}
