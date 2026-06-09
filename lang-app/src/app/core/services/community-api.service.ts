import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiPost {
  id: string;
  content: string;
  hasCW: boolean;
  cwLabel: string | null;
  likes: number;
  hugs: number;
  createdAt: string;
}

export interface SubmitResult {
  id: string;
  status: 'pending';
  riskDetected: boolean;
}

@Injectable({ providedIn: 'root' })
export class CommunityApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/community`;

  getApproved(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>(this.base);
  }

  submit(content: string): Observable<SubmitResult> {
    return this.http.post<SubmitResult>(this.base, { content });
  }

  react(id: string, type: 'like' | 'hug'): Observable<{ id: string; likes: number; hugs: number }> {
    return this.http.post<{ id: string; likes: number; hugs: number }>(`${this.base}/${id}/react/${type}`, {});
  }

  report(id: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/${id}/report`, {});
  }

  // ===== MODERATION (admin) =====
  getPending(): Observable<PendingPost[]> {
    return this.http.get<PendingPost[]>(`${this.base}/pending`);
  }

  approve(id: string, hasCW: boolean, cwLabel?: string): Observable<unknown> {
    return this.http.post(`${this.base}/${id}/approve`, { hasCW, cwLabel });
  }

  reject(id: string, note?: string): Observable<unknown> {
    return this.http.post(`${this.base}/${id}/reject`, { note });
  }
}

export interface PendingPost {
  id: string;
  content: string;
  riskDetected: boolean;
  createdAt: string;
}
