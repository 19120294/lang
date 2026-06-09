import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/** Từ khóa phát hiện rủi ro tự hại — dùng cho chatbot & community wall */
const RISK_KEYWORDS = [
  'tự tử', 'tự vẫn', 'muốn chết', 'không muốn sống', 'kết thúc cuộc đời',
  'tự làm hại', 'tự làm đau', 'cắt tay', 'nhảy lầu', 'uống thuốc',
];

export type CrisisSource = 'phq9_q9' | 'dass21_severe' | 'community_post' | 'chatbot' | 'sos_button';

@Injectable({ providedIn: 'root' })
export class CrisisService {
  private http = inject(HttpClient);

  /** true = đang hiển thị SOS modal */
  readonly sosVisible = signal(false);

  openSos(): void  { this.sosVisible.set(true); }
  closeSos(): void { this.sosVisible.set(false); }

  /** Phát hiện nguy cơ trong văn bản (chatbot, community) */
  detectRisk(text: string): boolean {
    const lower = text.toLowerCase();
    return RISK_KEYWORDS.some(kw => lower.includes(kw));
  }

  /** PHQ-9 câu 9 > 0 → kích hoạt ngay */
  handlePhq9Q9(score: number): void {
    if (score > 0) this.openSos();
  }

  /** Log sự kiện khủng hoảng ẩn danh (aggregate, không gửi PII) */
  logEvent(source: CrisisSource): void {
    this.http.post(`${environment.apiUrl}/crisis/log`, { source })
      .subscribe({ error: () => { /* offline: bỏ qua */ } });
  }
}
