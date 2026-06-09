import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoodEntry, MoodLevel } from '../models/mood.model';

@Injectable({ providedIn: 'root' })
export class MoodApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/mood`;

  getAll(month?: string): Observable<MoodEntry[]> {
    const params: Record<string, string> = {};
    if (month) params['month'] = month;
    return this.http.get<MoodEntry[]>(this.base, { params });
  }

  upsert(date: string, mood: MoodLevel, note?: string): Observable<unknown> {
    return this.http.put(this.base, { date, mood, note });
  }

  remove(date: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${date}`);
  }
}
