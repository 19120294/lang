import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TestId } from '../models/assessment.model';

export interface SaveAssessmentPayload {
  testId: TestId;
  scores: Record<string, number>;
  answers: number[];
  q9Score?: number;
  consentGiven: boolean;
}

export interface SaveAssessmentResult {
  id: string;
  crisisTriggered: boolean;
}

@Injectable({ providedIn: 'root' })
export class AssessmentApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/assessment`;

  save(payload: SaveAssessmentPayload): Observable<SaveAssessmentResult> {
    return this.http.post<SaveAssessmentResult>(`${this.base}/save`, payload);
  }

  getHistory(): Observable<AssessmentHistoryItem[]> {
    return this.http.get<AssessmentHistoryItem[]>(`${this.base}/history`);
  }
}

export interface AssessmentHistoryItem {
  id: string;
  testId: TestId;
  scores: Record<string, number>;
  createdAt: string;
  crisisTriggered: boolean;
}
