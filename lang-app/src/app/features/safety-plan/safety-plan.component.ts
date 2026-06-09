import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShieldCheck, Plus, X, Lock, Check, LifeBuoy, Trash2 } from 'lucide-angular';
import { SafetyPlanService } from '../../core/services/safety-plan.service';
import { SAFETY_SECTIONS, SafetyPlan, EMPTY_PLAN } from '../../core/models/safety-plan.model';
import { CrisisService } from '../../core/services/crisis.service';

@Component({
  selector: 'app-safety-plan',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './safety-plan.component.html',
})
export class SafetyPlanComponent {
  readonly ShieldCheck = ShieldCheck;
  readonly Plus = Plus;
  readonly X = X;
  readonly Lock = Lock;
  readonly Check = Check;
  readonly LifeBuoy = LifeBuoy;
  readonly Trash2 = Trash2;
  readonly sections = SAFETY_SECTIONS;

  private service = inject(SafetyPlanService);
  readonly crisis = inject(CrisisService);

  // Bản nháp đang chỉnh (copy sâu từ plan đã lưu)
  draft = signal<SafetyPlan>(structuredClone(this.service.plan()));
  newItem = signal<Record<string, string>>({});
  saved = signal(false);

  addItem(key: keyof SafetyPlan): void {
    const val = (this.newItem()[key] ?? '').trim();
    if (!val) return;
    const d = structuredClone(this.draft());
    (d[key] as string[]).push(val);
    this.draft.set(d);
    this.newItem.update(m => ({ ...m, [key]: '' }));
    this.persist();
  }

  removeItem(key: keyof SafetyPlan, idx: number): void {
    const d = structuredClone(this.draft());
    (d[key] as string[]).splice(idx, 1);
    this.draft.set(d);
    this.persist();
  }

  setText(key: keyof SafetyPlan, value: string): void {
    const d = structuredClone(this.draft());
    (d[key] as string) = value;
    this.draft.set(d);
    this.persist();
  }

  setNew(key: string, value: string): void {
    this.newItem.update(m => ({ ...m, [key]: value }));
  }

  asList(key: keyof SafetyPlan): string[] { return this.draft()[key] as string[]; }
  asText(key: keyof SafetyPlan): string { return this.draft()[key] as string; }

  clearAll(): void {
    if (confirm('Xóa toàn bộ kế hoạch an toàn? Hành động này không thể hoàn tác.')) {
      this.service.clear();
      this.draft.set(structuredClone(EMPTY_PLAN));
    }
  }

  /** Tự lưu sau mỗi thay đổi + báo "đã lưu" thoáng qua */
  private persist(): void {
    this.service.save(this.draft());
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 1500);
  }
}
