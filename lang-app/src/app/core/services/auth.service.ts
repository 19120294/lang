import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

interface AuthResponse { accessToken: string; refreshToken: string; }
export interface CurrentUser { id: string; email: string | null; isGuest: boolean; isAdmin?: boolean; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokens = inject(TokenService);
  private base = `${environment.apiUrl}/auth`;

  /** Trạng thái user hiện tại (signal cho component dùng) */
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isLoggedIn  = signal(false);

  /** Gọi khi app khởi động — nếu chưa có token thì tạo guest session */
  init(): Observable<CurrentUser | null> {
    if (this.tokens.hasToken) {
      return this.fetchMe();
    }
    return this.guestLogin().pipe(switchMap(() => this.fetchMe()));
  }

  guestLogin(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/guest`, {}).pipe(
      tap(res => this.tokens.setTokens(res.accessToken, res.refreshToken)),
    );
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password }).pipe(
      tap(res => this.tokens.setTokens(res.accessToken, res.refreshToken)),
      switchMap(res => this.fetchMe().pipe(switchMap(() => of(res)))),
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password }).pipe(
      tap(res => this.tokens.setTokens(res.accessToken, res.refreshToken)),
      switchMap(res => this.fetchMe().pipe(switchMap(() => of(res)))),
    );
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(`${this.base}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, { token, newPassword });
  }

  fetchMe(): Observable<CurrentUser | null> {
    return this.http.get<CurrentUser>(`${this.base}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isLoggedIn.set(!user.isGuest);
      }),
    );
  }

  /** Đăng xuất — quay về guest session mới */
  logout(): Observable<CurrentUser | null> {
    this.tokens.clear();
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    return this.init();
  }

  /** Xóa toàn bộ dữ liệu (quyền theo NĐ13) */
  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/me`).pipe(
      tap(() => {
        this.tokens.clear();
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
      }),
    );
  }
}
