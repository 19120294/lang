import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, CloudDrizzle, Wind, ChartNoAxesColumn, RotateCcw, Info, Baby, Users, Activity } from 'lucide-angular';
import { TESTS, TestDefinition, TestId, ScoreRange, AUDIENCE_LABELS, Audience } from '../../core/models/assessment.model';
import { CrisisService } from '../../core/services/crisis.service';
import { AssessmentApiService } from '../../core/services/assessment-api.service';
import { AuthService } from '../../core/services/auth.service';

type Step = 'select' | 'disclaimer' | 'questions' | 'result';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './assessment.component.html',
})
export class AssessmentComponent {
  readonly ArrowRight = ArrowRight;
  readonly ArrowLeft = ArrowLeft;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly CloudDrizzle = CloudDrizzle;
  readonly Wind = Wind;
  readonly ChartNoAxesColumn = ChartNoAxesColumn;
  readonly RotateCcw = RotateCcw;
  readonly Info = Info;

  private crisis = inject(CrisisService);
  private api = inject(AssessmentApiService);
  readonly isLoggedIn = inject(AuthService).isLoggedIn;

  step = signal<Step>('select');
  selectedTest = signal<TestDefinition | null>(null);
  currentQ = signal(0);
  answers = signal<(number | null)[]>([]);
  scores = signal<number | number[] | null>(null);
  crisisTriggered = signal(false);
  saveConsent = signal(false);
  saved = signal(false);

  // Các bài đánh giá nhóm theo đối tượng
  readonly groups: { audience: Audience; label: string; items: { id: TestId; icon: any; tag: string }[] }[] = [
    { audience: 'chung', label: AUDIENCE_LABELS['chung'], items: [
      { id: 'phq9',   icon: CloudDrizzle,      tag: 'Trầm cảm' },
      { id: 'gad7',   icon: Wind,              tag: 'Lo âu' },
      { id: 'dass21', icon: ChartNoAxesColumn, tag: 'Tổng hợp' },
      { id: 'pss10',  icon: Activity,          tag: 'Căng thẳng' },
    ]},
    { audience: 'thai-ky', label: AUDIENCE_LABELS['thai-ky'], items: [
      { id: 'epds', icon: Baby, tag: 'Trầm cảm chu sinh' },
    ]},
    { audience: 'cao-tuoi', label: AUDIENCE_LABELS['cao-tuoi'], items: [
      { id: 'gds15', icon: Users, tag: 'Trầm cảm lão khoa' },
    ]},
  ];

  readonly progress = computed(() => {
    const test = this.selectedTest();
    if (!test) return 0;
    return Math.round(((this.currentQ() + 1) / test.questions.length) * 100);
  });

  readonly currentRange = computed((): ScoreRange | null => {
    const test = this.selectedTest();
    const s = this.scores();
    if (!test || s === null || test.id === 'dass21') return null;
    const total = s as number;
    return (test.ranges as ScoreRange[]).find(r => total >= r.min && total <= r.max) ?? null;
  });

  readonly dass21Results = computed(() => {
    const test = this.selectedTest();
    const s = this.scores();
    if (!test || test.id !== 'dass21' || s === null) return null;
    const [d, a, st] = s as number[];
    const labels = ['Trầm cảm', 'Lo âu', 'Căng thẳng'];
    const maxes = [42, 42, 42];
    return [d, a, st].map((score, i) => {
      const range = (test.ranges as ScoreRange[][])[i].find(r => score >= r.min && score <= r.max)!;
      return { label: labels[i], score, max: maxes[i], range };
    });
  });

  selectTest(id: TestId): void {
    this.selectedTest.set(TESTS[id]);
    this.answers.set(new Array(TESTS[id].questions.length).fill(null));
    this.currentQ.set(0);
    this.step.set('disclaimer');
  }

  startTest(): void { this.step.set('questions'); }

  /** Chọn đáp án — chỉ lưu, chưa chuyển câu */
  selectAnswer(value: number): void {
    const idx = this.currentQ();
    const updated = [...this.answers()];
    updated[idx] = value;
    this.answers.set(updated);
  }

  /** Xác nhận và chuyển sang câu tiếp theo / kết quả */
  next(): void {
    const test = this.selectedTest()!;
    const idx = this.currentQ();
    const ans = this.answers() as number[];
    if (ans[idx] === null) return;
    if (idx < test.questions.length - 1) {
      this.currentQ.set(idx + 1);
    } else {
      this.finish(test, ans);
    }
  }

  goBack(): void {
    const idx = this.currentQ();
    if (idx > 0) this.currentQ.set(idx - 1);
    else this.step.set('disclaimer');
  }

  private finish(test: TestDefinition, ans: number[]): void {
    const s = test.score(ans);
    this.scores.set(s);
    this.step.set('result');

    // Câu khủng hoảng tổng quát (PHQ-9 Q9, EPDS Q10): điểm > 0 → escalation
    const crisisIdx = test.questions.findIndex(q => q.isCrisisQuestion);
    const crisisAnswer = crisisIdx >= 0 ? ans[crisisIdx] : 0;
    const q9 = crisisIdx >= 0 ? crisisAnswer : undefined;

    if (crisisIdx >= 0 && crisisAnswer > 0) {
      this.crisisTriggered.set(true);
      this.crisis.openSos();
    }
    if (test.id === 'dass21' && (s as number[])[0] >= 28) {
      this.crisis.openSos();
    }

    // Crisis logging ẩn danh (aggregate) khi có dấu hiệu — KHÔNG lưu kết quả cá nhân
    const dassSevere = test.id === 'dass21' && (s as number[])[0] >= 28;
    if (this.crisisTriggered() || dassSevere) {
      const scoreObj: Record<string, number> = Array.isArray(s) ? { d: s[0], a: s[1], s: s[2] } : { total: s };
      this.api.save({ testId: test.id, scores: scoreObj, answers: ans, q9Score: q9, consentGiven: false })
        .subscribe({ error: () => {} });
    }
  }

  /** Người dùng chủ động đồng ý lưu kết quả để theo dõi theo thời gian */
  saveResult(): void {
    const test = this.selectedTest();
    const s = this.scores();
    if (!test || s === null || this.saved()) return;
    const ans = this.answers() as number[];
    const scoreObj: Record<string, number> = Array.isArray(s) ? { d: s[0], a: s[1], s: s[2] } : { total: s };
    const crisisIdx = test.questions.findIndex(q => q.isCrisisQuestion);
    this.api.save({
      testId: test.id,
      scores: scoreObj,
      answers: ans,
      q9Score: crisisIdx >= 0 ? ans[crisisIdx] : undefined,
      consentGiven: true,
    }).subscribe({
      next: () => this.saved.set(true),
      error: () => { /* offline: không lưu được, giữ nguyên */ },
    });
  }

  reset(): void {
    this.step.set('select');
    this.selectedTest.set(null);
    this.currentQ.set(0);
    this.answers.set([]);
    this.scores.set(null);
    this.crisisTriggered.set(false);
    this.saveConsent.set(false);
    this.saved.set(false);
  }

  severityColor(sev: string): string {
    return ({ minimal:'bg-sage-400', mild:'bg-sage-500', moderate:'bg-stone-400', 'moderately-severe':'bg-sos-400', severe:'bg-sos-600' } as Record<string,string>)[sev] ?? 'bg-stone-400';
  }

  barWidth(score: number, max: number): string {
    return `${Math.min(Math.round((score / max) * 100), 100)}%`;
  }

  getTest(id: TestId) { return TESTS[id]; }

  /** Điểm tối đa của bài đơn-thang (lấy max của range cuối) */
  maxScore(test: TestDefinition): number {
    const r = test.ranges as ScoreRange[];
    return r[r.length - 1]?.max ?? 27;
  }

  /** Đáp án của câu hiện tại — ưu tiên options riêng của câu, fallback options chung */
  currentOptions() {
    const test = this.selectedTest();
    if (!test) return [];
    const q = test.questions[this.currentQ()];
    return q.options ?? test.options;
  }
}
