import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, X, Check, ArrowLeft, FileText, Building2, BookOpen } from 'lucide-angular';
import { AdminContentService } from '../../core/services/admin-content.service';
import { AuthService } from '../../core/services/auth.service';

type Tab = 'articles' | 'facilities' | 'books';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './content.component.html',
})
export class AdminContentComponent implements OnInit {
  readonly Plus = Plus; readonly Pencil = Pencil; readonly Trash2 = Trash2;
  readonly X = X; readonly Check = Check; readonly ArrowLeft = ArrowLeft;
  readonly FileText = FileText; readonly Building2 = Building2; readonly BookOpen = BookOpen;

  private api = inject(AdminContentService);
  private auth = inject(AuthService);

  readonly CATEGORIES = [
    { v: 'lo_au', l: 'Lo âu' }, { v: 'tram_cam', l: 'Trầm cảm' }, { v: 'giac_ngu', l: 'Giấc ngủ' },
    { v: 'cang_thang', l: 'Căng thẳng' }, { v: 'quan_he', l: 'Quan hệ' }, { v: 'tu_cham_soc', l: 'Tự chăm sóc' },
  ];
  readonly AREAS = [{ v: 'hn', l: 'Hà Nội' }, { v: 'hcm', l: 'TP.HCM' }, { v: 'dn', l: 'Đà Nẵng' }, { v: 'online', l: 'Trực tuyến' }];
  readonly COSTS = [{ v: 'free', l: 'Miễn phí' }, { v: 'insurance', l: 'BHYT' }, { v: 'affordable', l: 'Phải chăng' }, { v: 'private_pay', l: 'Tự trả' }];
  readonly TYPES = [{ v: 'online', l: 'Trực tuyến' }, { v: 'clinic', l: 'Phòng khám' }, { v: 'hospital', l: 'Bệnh viện' }];
  readonly BOOK_CATS = [
    { v: 'tram_cam', l: 'Trầm cảm' }, { v: 'lo_au', l: 'Lo âu' }, { v: 'chanh_niem', l: 'Chánh niệm' },
    { v: 'chua_lanh', l: 'Chữa lành' }, { v: 'y_nghia', l: 'Ý nghĩa sống' }, { v: 'thoi_quen', l: 'Thói quen' },
  ];

  tab = signal<Tab>('articles');
  forbidden = signal(false);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  articles = signal<any[]>([]);
  facilities = signal<any[]>([]);
  books = signal<any[]>([]);
  /** Object đang soạn (null = không mở form). Có .id nếu đang sửa. */
  draft = signal<any | null>(null);

  ngOnInit(): void {
    if (!this.auth.currentUser()?.isAdmin) { this.forbidden.set(true); this.loading.set(false); return; }
    this.loadAll();
  }

  setTab(t: Tab): void { this.tab.set(t); this.draft.set(null); this.error.set(null); }

  private loadAll(): void {
    this.loading.set(true);
    this.api.listArticles().subscribe({ next: a => this.articles.set(a), error: () => {} });
    this.api.listBooks().subscribe({ next: b => this.books.set(b), error: () => {} });
    this.api.listFacilities().subscribe({ next: f => this.facilities.set(f), complete: () => this.loading.set(false), error: () => this.loading.set(false) });
  }

  // ===== Mở form =====
  newArticle(): void {
    this.draft.set({ slug: '', title: '', excerpt: '', content: '', category: 'lo_au', readMinutes: 5, reviewedBy: '', tagsStr: '', sourcesStr: '', published: true });
    this.error.set(null);
  }
  editArticle(a: any): void {
    this.draft.set({ ...a, tagsStr: (a.tags ?? []).join(', '), sourcesStr: (a.sources ?? []).join('\n') });
    this.error.set(null);
  }
  newFacility(): void {
    this.draft.set({ name: '', description: '', address: '', area: 'hn', cost: [], type: [], phone: '', website: '', hours: '', tagsStr: '', verified: false, published: true });
    this.error.set(null);
  }
  editFacility(f: any): void {
    this.draft.set({ ...f, tagsStr: (f.tags ?? []).join(', ') });
    this.error.set(null);
  }
  newBook(): void {
    this.draft.set({ title: '', author: '', excerpt: '', category: 'tram_cam', rating: 4.5, coverGradient: 'linear-gradient(150deg,#4b614f,#2a342c)', coverUrl: '', detail: '', whyRead: '', reviewedByExpert: true, published: true });
    this.error.set(null);
  }
  editBook(b: any): void { this.draft.set({ ...b }); this.error.set(null); }
  cancel(): void { this.draft.set(null); this.error.set(null); }

  /** Bật/tắt giá trị trong mảng (cost/type) */
  toggleArr(field: 'cost' | 'type', value: string): void {
    const d = this.draft(); if (!d) return;
    const arr: string[] = d[field] ?? [];
    d[field] = arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value];
    this.draft.set({ ...d });
  }
  inArr(field: 'cost' | 'type', value: string): boolean {
    return (this.draft()?.[field] ?? []).includes(value);
  }

  // ===== Lưu =====
  save(): void {
    const d = this.draft(); if (!d) return;
    this.saving.set(true); this.error.set(null);
    const done = () => { this.saving.set(false); this.draft.set(null); this.loadAll(); };
    const fail = (e: any) => { this.saving.set(false); this.error.set(this.msg(e)); };

    if (this.tab() === 'articles') {
      const dto = {
        slug: d.slug, title: d.title, excerpt: d.excerpt, content: d.content, category: d.category,
        readMinutes: Number(d.readMinutes), reviewedBy: d.reviewedBy,
        tags: this.splitCsv(d.tagsStr), sources: this.splitLines(d.sourcesStr), published: !!d.published,
      };
      (d.id ? this.api.updateArticle(d.id, dto) : this.api.createArticle(dto)).subscribe({ next: done, error: fail });
    } else if (this.tab() === 'facilities') {
      const dto = {
        name: d.name, description: d.description, address: d.address || undefined, area: d.area,
        cost: d.cost, type: d.type, phone: d.phone || undefined, website: d.website || undefined,
        hours: d.hours, tags: this.splitCsv(d.tagsStr), verified: !!d.verified, published: !!d.published,
      };
      (d.id ? this.api.updateFacility(d.id, dto) : this.api.createFacility(dto)).subscribe({ next: done, error: fail });
    } else {
      const dto = {
        title: d.title, author: d.author, excerpt: d.excerpt, category: d.category,
        rating: Number(d.rating), coverGradient: d.coverGradient, coverUrl: d.coverUrl || undefined,
        detail: d.detail || undefined, whyRead: d.whyRead || undefined,
        reviewedByExpert: !!d.reviewedByExpert, published: !!d.published,
      };
      (d.id ? this.api.updateBook(d.id, dto) : this.api.createBook(dto)).subscribe({ next: done, error: fail });
    }
  }

  remove(kind: Tab, item: any): void {
    if (!confirm(`Xóa "${item.title || item.name}"? Không thể hoàn tác.`)) return;
    const op = kind === 'articles' ? this.api.deleteArticle(item.id)
      : kind === 'facilities' ? this.api.deleteFacility(item.id)
      : this.api.deleteBook(item.id);
    op.subscribe({ next: () => this.loadAll(), error: e => this.error.set(this.msg(e)) });
  }

  /** Mở form thêm mới theo tab hiện tại */
  newItem(): void {
    const t = this.tab();
    if (t === 'articles') this.newArticle();
    else if (t === 'facilities') this.newFacility();
    else this.newBook();
  }
  editItem(item: any): void {
    const t = this.tab();
    if (t === 'articles') this.editArticle(item);
    else if (t === 'facilities') this.editFacility(item);
    else this.editBook(item);
  }
  currentList() {
    const t = this.tab();
    return t === 'articles' ? this.articles() : t === 'facilities' ? this.facilities() : this.books();
  }

  private splitCsv(s: string): string[] { return (s ?? '').split(',').map(x => x.trim()).filter(Boolean); }
  private splitLines(s: string): string[] { return (s ?? '').split('\n').map(x => x.trim()).filter(Boolean); }
  private msg(e: any): string {
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join('. ') : (typeof m === 'string' ? m : 'Có lỗi xảy ra, thử lại.');
  }
}
