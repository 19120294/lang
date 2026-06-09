import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KnowledgeArticle, KnowledgeCategory } from '../models/knowledge.model';

/** Article trả về từ backend (category dạng gạch dưới + có slug) */
interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;      // 'lo_au', 'tram_cam', ...
  readMinutes: number;
  reviewedBy: string;
  tags: string[];
  sources?: string[];
}

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/knowledge`;

  getAll(): Observable<(KnowledgeArticle & { slug: string })[]> {
    return this.http.get<ApiArticle[]>(this.base).pipe(
      map(list => list.map(a => this.toModel(a))),
    );
  }

  getBySlug(slug: string): Observable<(KnowledgeArticle & { slug: string }) | null> {
    return this.http.get<ApiArticle | null>(`${this.base}/${slug}`).pipe(
      map(a => (a ? this.toModel(a) : null)),
    );
  }

  /** Map enum backend (gạch dưới) → frontend (gạch ngang) */
  private toModel(a: ApiArticle): KnowledgeArticle & { slug: string } {
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      category: a.category.replace(/_/g, '-') as KnowledgeCategory,
      readMinutes: a.readMinutes,
      reviewedBy: a.reviewedBy,
      tags: a.tags,
      sources: a.sources ?? [],
    };
  }
}
