import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Gắn access token vào header. Nếu nhận 401 → thử refresh token một lần,
 * rồi retry request gốc. Nếu refresh thất bại → xóa token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const http = inject(HttpClient);

  // Không gắn token cho endpoint auth công khai (guest/login/register/refresh)
  const isAuthEndpoint = req.url.includes('/auth/guest')
    || req.url.includes('/auth/login')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/refresh');

  const token = tokenService.accessToken;
  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isAuthEndpoint && tokenService.refreshToken) {
        // Thử refresh token
        return http.post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}/auth/refresh`,
          { refreshToken: tokenService.refreshToken },
        ).pipe(
          switchMap(res => {
            tokenService.setTokens(res.accessToken, res.refreshToken);
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            tokenService.clear();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
