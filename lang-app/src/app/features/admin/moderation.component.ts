import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ShieldCheck, Check, X, TriangleAlert, Clock, Inbox } from 'lucide-angular';
import { CommunityApiService, PendingPost } from '../../core/services/community-api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './moderation.component.html',
})
export class ModerationComponent implements OnInit {
  readonly ShieldCheck = ShieldCheck;
  readonly Check = Check;
  readonly X = X;
  readonly TriangleAlert = TriangleAlert;
  readonly Clock = Clock;
  readonly Inbox = Inbox;

  private api = inject(CommunityApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  posts = signal<PendingPost[]>([]);
  loading = signal(true);
  forbidden = signal(false);
  /** id bài → bật content warning khi duyệt */
  cwState = signal<Record<string, { on: boolean; label: string }>>({});

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user?.isAdmin) {
      this.forbidden.set(true);
      this.loading.set(false);
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api.getPending().subscribe({
      next: list => {
        this.posts.set(list);
        const st: Record<string, { on: boolean; label: string }> = {};
        list.forEach(p => st[p.id] = { on: p.riskDetected, label: '' });
        this.cwState.set(st);
        this.loading.set(false);
      },
      error: () => { this.forbidden.set(true); this.loading.set(false); },
    });
  }

  toggleCW(id: string): void {
    const st = { ...this.cwState() };
    st[id] = { ...st[id], on: !st[id].on };
    this.cwState.set(st);
  }

  setLabel(id: string, label: string): void {
    const st = { ...this.cwState() };
    st[id] = { ...st[id], label };
    this.cwState.set(st);
  }

  approve(p: PendingPost): void {
    const cw = this.cwState()[p.id];
    this.api.approve(p.id, cw.on, cw.label || undefined).subscribe({
      next: () => this.posts.update(list => list.filter(x => x.id !== p.id)),
      error: () => {},
    });
  }

  reject(p: PendingPost): void {
    this.api.reject(p.id).subscribe({
      next: () => this.posts.update(list => list.filter(x => x.id !== p.id)),
      error: () => {},
    });
  }

  goAuth(): void { this.router.navigate(['/auth']); }
}
