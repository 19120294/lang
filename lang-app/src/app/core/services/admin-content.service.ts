import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** CRUD nội dung cho admin (bài viết + cơ sở). Token gắn tự động qua interceptor. */
@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  // ===== Articles =====
  listArticles() { return this.http.get<any[]>(`${this.api}/knowledge/admin/all`); }
  createArticle(dto: any) { return this.http.post(`${this.api}/knowledge`, dto); }
  updateArticle(id: string, dto: any) { return this.http.patch(`${this.api}/knowledge/${id}`, dto); }
  deleteArticle(id: string) { return this.http.delete(`${this.api}/knowledge/${id}`); }

  // ===== Facilities =====
  listFacilities() { return this.http.get<any[]>(`${this.api}/facilities/admin/all`); }
  createFacility(dto: any) { return this.http.post(`${this.api}/facilities`, dto); }
  updateFacility(id: string, dto: any) { return this.http.patch(`${this.api}/facilities/${id}`, dto); }
  deleteFacility(id: string) { return this.http.delete(`${this.api}/facilities/${id}`); }

  // ===== Books =====
  listBooks() { return this.http.get<any[]>(`${this.api}/books/admin/all`); }
  createBook(dto: any) { return this.http.post(`${this.api}/books`, dto); }
  updateBook(id: string, dto: any) { return this.http.patch(`${this.api}/books/${id}`, dto); }
  deleteBook(id: string) { return this.http.delete(`${this.api}/books/${id}`); }
}
