import { Component, computed, signal, HostListener, OnInit, inject } from '@angular/core';
import { LucideAngularModule, BadgeCheck, ArrowRight, Star, X, Sparkles } from 'lucide-angular';
import { BOOKS, BOOK_CATEGORIES, BookCategory, Book } from '../../core/models/book.model';
import { BooksApiService } from '../../core/services/books-api.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './books.component.html',
})
export class BooksComponent implements OnInit {
  readonly BadgeCheck = BadgeCheck;
  readonly ArrowRight = ArrowRight;
  readonly Star = Star;
  readonly X = X;
  readonly Sparkles = Sparkles;

  private api = inject(BooksApiService);
  readonly categories = BOOK_CATEGORIES;
  activeCategory = signal<BookCategory | null>(null);

  /** Danh sách sách — khởi tạo bằng static (fallback offline), thay bằng API khi tải xong */
  books = signal<Book[]>(BOOKS);

  ngOnInit(): void {
    this.api.getAll().subscribe({
      next: list => { if (list.length) this.books.set(list); },
      error: () => { /* offline → giữ static */ },
    });
  }

  /** Sách đang xem chi tiết (modal) */
  selected = signal<Book | null>(null);
  openDetail(b: Book): void { this.selected.set(b); }
  closeDetail(): void { this.selected.set(null); }

  @HostListener('document:keydown.escape')
  onEsc(): void { this.closeDetail(); }

  readonly filtered = computed(() => {
    const cat = this.activeCategory();
    const all = this.books();
    return cat ? all.filter(b => b.category === cat) : all;
  });

  setCategory(id: BookCategory | null): void { this.activeCategory.set(id); }

  /** id sách có ảnh lỗi → dùng bìa gradient thay thế */
  private failedCovers = signal<Set<string>>(new Set());
  onCoverError(id: string): void {
    this.failedCovers.update(s => new Set(s).add(id));
  }
  showImage(b: { id: string; coverUrl?: string }): boolean {
    return !!b.coverUrl && !this.failedCovers().has(b.id);
  }

  getCategoryLabel(id: string): string {
    return this.categories.find(c => c.id === id)?.label ?? id;
  }

  stars(rating: number): { full: number; half: boolean } {
    return { full: Math.floor(rating), half: rating % 1 >= 0.5 };
  }
}
