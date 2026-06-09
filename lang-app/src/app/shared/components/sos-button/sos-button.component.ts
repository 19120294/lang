import { Component, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, LifeBuoy, Phone, HeartHandshake, X, ShieldCheck } from 'lucide-angular';
import { CrisisService } from '../../../core/services/crisis.service';
import { SafetyPlanService } from '../../../core/services/safety-plan.service';
import { HOTLINES } from '../../../core/models/hotline.config';

@Component({
  selector: 'app-sos-button',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './sos-button.component.html',
})
export class SosButtonComponent {
  readonly LifeBuoy = LifeBuoy;
  readonly Phone = Phone;
  readonly HeartHandshake = HeartHandshake;
  readonly X = X;
  readonly ShieldCheck = ShieldCheck;

  readonly crisis = inject(CrisisService);
  readonly safetyPlan = inject(SafetyPlanService);
  readonly hotlines = HOTLINES;

  /** User chủ động bấm nút SOS → mở modal + log ẩn danh */
  open(): void {
    this.crisis.openSos();
    this.crisis.logEvent('sos_button');
  }

  /** Đóng modal SOS bằng phím Esc (accessibility) */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.crisis.sosVisible()) this.crisis.closeSos();
  }
}
