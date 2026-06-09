import { Injectable, signal, computed } from '@angular/core';
import { SafetyPlan, EMPTY_PLAN } from '../models/safety-plan.model';

const KEY = 'lang_safety_plan';

/** Lưu kế hoạch an toàn — local-first, không bao giờ gửi server (dữ liệu cực nhạy cảm). */
@Injectable({ providedIn: 'root' })
export class SafetyPlanService {
  private readonly _plan = signal<SafetyPlan>(this.load());
  readonly plan = this._plan.asReadonly();

  /** Kế hoạch đã có nội dung chưa (để quyết định hiển thị link trong SOS) */
  readonly hasPlan = computed(() => {
    const p = this._plan();
    return p.warningSigns.length > 0 || p.copingStrategies.length > 0 ||
      p.distractions.length > 0 || p.supportPeople.length > 0 ||
      p.reasonsToLive.length > 0 || p.safeEnvironment.trim().length > 0;
  });

  save(plan: SafetyPlan): void {
    this._plan.set(plan);
    localStorage.setItem(KEY, JSON.stringify(plan));
  }

  clear(): void {
    this._plan.set({ ...EMPTY_PLAN });
    localStorage.removeItem(KEY);
  }

  private load(): SafetyPlan {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved) return { ...EMPTY_PLAN, ...saved };
    } catch { /* ignore */ }
    return { ...EMPTY_PLAN };
  }
}
