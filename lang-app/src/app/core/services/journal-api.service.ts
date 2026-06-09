import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JournalEntry } from '../models/journal.model';
import { MoodLevel } from '../models/mood.model';

@Injectable({ providedIn: 'root' })
export class JournalApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/journal`;

  getAll(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(this.base);
  }

  create(content: string, mood?: MoodLevel, title?: string): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.base, { content, mood, title });
  }

  update(id: string, content: string, title?: string): Observable<JournalEntry> {
    return this.http.patch<JournalEntry>(`${this.base}/${id}`, { content, title });
  }

  remove(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
