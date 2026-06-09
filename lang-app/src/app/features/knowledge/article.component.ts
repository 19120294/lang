import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Clock, BadgeCheck, BookOpen, ChevronRight, FileText } from 'lucide-angular';
import { ARTICLES, CATEGORIES, KnowledgeArticle } from '../../core/models/knowledge.model';
import { KnowledgeApiService } from '../../core/services/knowledge-api.service';

type Article = KnowledgeArticle & { slug?: string };

/** Khối nội dung sau khi parse markdown đơn giản */
interface Block { type: 'h2' | 'p' | 'ul'; html?: string; items?: string[]; }

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './article.component.html',
})
export class ArticleComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly Clock = Clock;
  readonly BadgeCheck = BadgeCheck;
  readonly BookOpen = BookOpen;
  readonly ChevronRight = ChevronRight;
  readonly FileText = FileText;

  private route = inject(ActivatedRoute);
  private api = inject(KnowledgeApiService);

  readonly article = signal<Article | null>(null);
  readonly related = signal<Article[]>([]);
  readonly notFound = signal(false);

  ngOnInit(): void {
    // Theo dõi param: khi bấm sang bài liên quan (cùng component), router không
    // tạo lại component → phải nghe paramMap để tải lại bài mới.
    this.route.paramMap.subscribe(pm => {
      const param = pm.get('id') ?? '';
      this.notFound.set(false);
      this.article.set(null);
      this.related.set([]);
      this.api.getBySlug(param).subscribe({
        next: art => {
          if (art) { this.article.set(art); this.loadRelated(art); this.scrollTop(); }
          else this.fallbackStatic(param);
        },
        error: () => this.fallbackStatic(param),
      });
    });
  }

  private scrollTop(): void {
    if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private fallbackStatic(param: string): void {
    const art = ARTICLES.find(a => a.id === param) ?? null;
    if (!art) { this.notFound.set(true); return; }
    this.article.set(art);
    this.related.set(ARTICLES.filter(a => a.id !== art.id && a.category === art.category).slice(0, 3));
    this.scrollTop();
  }

  private loadRelated(art: Article): void {
    this.api.getAll().subscribe({
      next: list => this.related.set(list.filter(a => a.id !== art.id && a.category === art.category).slice(0, 3)),
      error: () => {},
    });
  }

  readonly categoryLabel = computed(() => {
    const art = this.article();
    return art ? (CATEGORIES.find(c => c.id === art.category)?.label ?? '') : '';
  });

  /** Parse content markdown → các khối để render */
  readonly blocks = computed<Block[]>(() => {
    const art = this.article();
    const c = art?.content;
    if (!c || c === '...') {
      return art?.excerpt ? [{ type: 'p', html: this.inline(art.excerpt) }] : [];
    }
    return this.parse(c);
  });

  readonly sources = computed(() => this.article()?.sources ?? []);

  private parse(md: string): Block[] {
    const blocks: Block[] = [];
    let para: string[] = [], list: string[] = [];
    const flushP = () => { if (para.length) { blocks.push({ type: 'p', html: this.inline(para.join(' ')) }); para = []; } };
    const flushL = () => { if (list.length) { blocks.push({ type: 'ul', items: list.map(i => this.inline(i)) }); list = []; } };
    for (const raw of md.split('\n')) {
      const line = raw.trim();
      if (!line) { flushP(); flushL(); continue; }
      if (line.startsWith('## ')) { flushP(); flushL(); blocks.push({ type: 'h2', html: this.inline(line.slice(3)) }); }
      else if (line.startsWith('- ')) { flushP(); list.push(line.slice(2)); }
      else { flushL(); para.push(line); }
    }
    flushP(); flushL();
    return blocks;
  }

  /** Chỉ cho phép **đậm** — nội dung từ nguồn tin cậy (seed) */
  private inline(text: string): string {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  linkId(a: Article): string { return a.slug ?? a.id; }
}
