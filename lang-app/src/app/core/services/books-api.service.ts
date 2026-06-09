import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BookCategory } from '../models/book.model';

interface ApiBook {
  id: string; title: string; author: string; excerpt: string; category: string;
  rating: number; coverGradient: string; coverUrl?: string; detail?: string;
  whyRead?: string; reviewedByExpert: boolean;
}

@Injectable({ providedIn: 'root' })
export class BooksApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/books`;

  getAll(): Observable<Book[]> {
    return this.http.get<ApiBook[]>(this.base).pipe(
      map(list => list.map(b => ({
        id: b.id, title: b.title, author: b.author, excerpt: b.excerpt,
        category: b.category.replace(/_/g, '-') as BookCategory,
        rating: b.rating, coverGradient: b.coverGradient, coverUrl: b.coverUrl,
        detail: b.detail, whyRead: b.whyRead, reviewedByExpert: b.reviewedByExpert,
      }))),
    );
  }
}
