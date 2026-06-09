import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, UserRound, LogOut, Trash2, ShieldCheck, ArrowRight, TriangleAlert, Download } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  readonly UserRound = UserRound;
  readonly LogOut = LogOut;
  readonly Trash2 = Trash2;
  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
  readonly TriangleAlert = TriangleAlert;
  readonly Download = Download;

  private auth = inject(AuthService);
  private router = inject(Router);
  private exporter = inject(ExportService);

  exportData(): void { this.exporter.downloadJson(); }

  readonly user = this.auth.currentUser;
  readonly isLoggedIn = this.auth.isLoggedIn;
  confirmingDelete = signal(false);
  deleting = signal(false);

  ngOnInit(): void {
    // Nếu chưa đăng nhập (guest) → chuyển sang trang auth
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth']);
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']),
    });
  }

  deleteAccount(): void {
    this.deleting.set(true);
    this.auth.deleteAccount().subscribe({
      next: () => {
        this.deleting.set(false);
        // Tạo guest session mới rồi về trang chủ
        this.auth.init().subscribe(() => this.router.navigate(['/']));
      },
      error: () => {
        this.deleting.set(false);
        this.confirmingDelete.set(false);
      },
    });
  }
}
