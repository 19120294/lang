import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldCheck, FileText, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './legal.component.html',
})
export class LegalComponent {
  readonly ShieldCheck = ShieldCheck;
  readonly FileText = FileText;
  readonly ArrowLeft = ArrowLeft;

  private route = inject(ActivatedRoute);
  readonly kind = signal<'terms' | 'privacy'>('terms');
  readonly updated = '09/06/2026';

  constructor() {
    this.route.data.subscribe(d => {
      this.kind.set((d['kind'] as 'terms' | 'privacy') ?? 'terms');
      if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo({ top: 0 });
    });
  }
}
