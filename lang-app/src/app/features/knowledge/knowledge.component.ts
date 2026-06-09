import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, ArrowRight, BadgeCheck, Clock, X } from 'lucide-angular';
import { ARTICLES, CATEGORIES, KnowledgeCategory, KnowledgeArticle } from '../../core/models/knowledge.model';
import { KnowledgeApiService } from '../../core/services/knowledge-api.service';

type Article = KnowledgeArticle & { slug?: string };

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './knowledge.component.html',
})
export class KnowledgeComponent implements OnInit {
  readonly Search = Search;
  readonly ArrowRight = ArrowRight;
  readonly BadgeCheck = BadgeCheck;
  readonly Clock = Clock;
  readonly X = X;

  private api = inject(KnowledgeApiService);

  readonly categories = CATEGORIES;
  query = signal('');
  activeCategory = signal<KnowledgeCategory | null>(null);

  /** Nguồn dữ liệu — load từ API, fallback sang ARTICLES tĩnh nếu lỗi */
  private articles = signal<Article[]>(ARTICLES);

  ngOnInit(): void {
    this.api.getAll().subscribe({
      next: list => { if (list.length) this.articles.set(list); },
      error: () => { /* giữ ARTICLES tĩnh khi offline */ },
    });
  }

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const cat = this.activeCategory();
    return this.articles().filter(a => {
      const matchCat = !cat || a.category === cat;
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)) || a.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  });

  /** Định danh dùng cho route detail: ưu tiên slug, fallback id */
  linkId(a: Article): string { return a.slug ?? a.id; }

  getCategoryLabel(id: string): string {
    return this.categories.find(c => c.id === id)?.label ?? id;
  }

  setCategory(id: KnowledgeCategory | null): void { this.activeCategory.set(id); }
  onSearch(e: Event): void { this.query.set((e.target as HTMLInputElement).value); }
  clearSearch(): void { this.query.set(''); }
}
