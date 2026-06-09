import { Injectable, inject } from '@angular/core';
import { MoodService } from './mood.service';
import { JournalService } from './journal.service';
import { SafetyPlanService } from './safety-plan.service';

/** Xuất toàn bộ dữ liệu cá nhân (local-first) ra file JSON — quyền data portability (NĐ13). */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private mood = inject(MoodService);
  private journal = inject(JournalService);
  private safety = inject(SafetyPlanService);

  buildExport() {
    return {
      app: 'Lặng',
      exportedAt: new Date().toISOString(),
      version: 1,
      data: {
        moods: this.mood.all(),
        journals: this.journal.all(),
        safetyPlan: this.safety.plan(),
      },
    };
  }

  downloadJson(): void {
    const json = JSON.stringify(this.buildExport(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lang-du-lieu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
