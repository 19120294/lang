import { Component, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, Plus, Lock, Save, Pencil, Trash2, X, Laugh, Smile, Meh, Angry, Frown, Check } from 'lucide-angular';
import { JournalService } from '../../core/services/journal.service';
import { MoodLevel, MOOD_META } from '../../core/models/mood.model';
import { JournalEntry } from '../../core/models/journal.model';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './journal.component.html',
})
export class JournalComponent {
  readonly Plus = Plus;
  readonly Lock = Lock;
  readonly Save = Save;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly X = X;
  readonly Check = Check;
  readonly Laugh = Laugh;
  readonly Smile = Smile;
  readonly Meh = Meh;
  readonly Angry = Angry;
  readonly Frown = Frown;
  readonly MOOD_META = MOOD_META;

  private journalService = inject(JournalService);

  readonly entries = computed(() => this.journalService.all());

  // Composer state
  composerOpen = signal(false);
  draft = signal('');
  draftMood = signal<MoodLevel | null>(null);
  editingId = signal<string | null>(null);
  saved = signal(false);

  readonly moodOptions: { level: MoodLevel; icon: any }[] = [
    { level: 'great',   icon: Laugh },
    { level: 'ok',      icon: Smile },
    { level: 'anxious', icon: Meh },
    { level: 'angry',   icon: Angry },
    { level: 'bad',     icon: Frown },
  ];

  openNew(): void {
    this.draft.set('');
    this.draftMood.set(null);
    this.editingId.set(null);
    this.saved.set(false);
    this.composerOpen.set(true);
  }

  openEdit(entry: JournalEntry): void {
    this.draft.set(entry.content);
    this.draftMood.set(entry.mood ?? null);
    this.editingId.set(entry.id);
    this.saved.set(false);
    this.composerOpen.set(true);
  }

  saveEntry(): void {
    if (!this.draft().trim()) return;
    const id = this.editingId();
    if (id) {
      this.journalService.update(id, this.draft());
    } else {
      this.journalService.save(this.draft(), this.draftMood() ?? undefined);
    }
    this.saved.set(true);
    setTimeout(() => { this.composerOpen.set(false); this.saved.set(false); }, 600);
  }

  deleteEntry(id: string): void {
    if (confirm('Xóa trang nhật ký này?')) this.journalService.remove(id);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  moodIcon(mood: MoodLevel) {
    return { great: this.Laugh, ok: this.Smile, anxious: this.Meh, angry: this.Angry, bad: this.Frown }[mood];
  }
}
