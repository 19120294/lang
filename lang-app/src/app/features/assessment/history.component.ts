import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowLeft, TrendingUp, Lock, Inbox, ArrowRight } from 'lucide-angular';
import { AssessmentApiService, AssessmentHistoryItem } from '../../core/services/assessment-api.service';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { TESTS, TestId } from '../../core/models/assessment.model';

interface SeriesPoint { date: string; total: number; x: number; y: number; }

@Component({
  selector: 'app-assessment-history',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './history.component.html',
})
export class AssessmentHistoryComponent implements OnInit {
  readonly ArrowLeft = ArrowLeft;
  readonly TrendingUp = TrendingUp;
  readonly Lock = Lock;
  readonly Inbox = Inbox;
  readonly ArrowRight = ArrowRight;

  private api = inject(AssessmentApiService);
  private router = inject(Router);
  private tokens = inject(TokenService);
  readonly isLoggedIn = inject(AuthService).isLoggedIn;

  loading = signal(true);
  items = signal<AssessmentHistoryItem[]>([]);
  selectedTest = signal<TestId>('phq9');

  ngOnInit(): void {
    // Luôn thử tải nếu có token (không phụ thuộc timing của fetchMe).
    // Guest sẽ nhận về danh sách rỗng; user thật nhận kết quả đã lưu.
    if (!this.tokens.hasToken) { this.loading.set(false); return; }
    this.api.getHistory().subscribe({
      next: list => {
        this.items.set(list);
        const first = this.testsWithData()[0];
        if (first) this.selectedTest.set(first);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Điểm tối đa từng thang đo (dass21 dùng phân nhánh trầm cảm 0–42) */
  private readonly MAX: Record<string, number> = {
    phq9: 27, gad7: 21, dass21: 42, epds: 30, gds15: 15, pss10: 40,
  };

  readonly testsWithData = computed(() => {
    const ids = new Set(this.items().map(i => i.testId));
    return (['phq9', 'gad7', 'dass21', 'epds', 'gds15', 'pss10'] as TestId[]).filter(id => ids.has(id));
  });

  /** Tổng điểm chuẩn hóa cho test đang chọn, theo thời gian tăng dần */
  readonly series = computed(() => {
    const id = this.selectedTest();
    const max = this.MAX[id] ?? 27;
    const rows = this.items()
      .filter(i => i.testId === id)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    if (rows.length === 0) return { points: [] as SeriesPoint[], path: '', max, hasData: false };

    const totals = rows.map(r => id === 'dass21' ? (r.scores['d'] ?? 0) : (r.scores['total'] ?? 0));
    const points: SeriesPoint[] = rows.map((r, idx) => {
      const total = totals[idx];
      const x = rows.length === 1 ? 150 : (idx / (rows.length - 1)) * 300;
      const y = 95 - (total / max) * 90;
      return { date: r.createdAt.slice(0, 10), total, x, y };
    });
    return { points, path: points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '), max, hasData: points.length >= 1 };
  });

  /** Thay đổi điểm: lần mới nhất so với lần đầu (âm = cải thiện vì điểm thấp tốt hơn) */
  readonly change = computed(() => {
    const pts = this.series().points;
    if (pts.length < 2) return null;
    return pts[pts.length - 1].total - pts[0].total;
  });

  testName(id: TestId): string { return TESTS[id].name; }
  selectTest(id: TestId): void { this.selectedTest.set(id); }
  goAuth(): void { this.router.navigate(['/auth']); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });
  }
}
