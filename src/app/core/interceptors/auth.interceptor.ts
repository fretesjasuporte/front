import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../services/api.service';

let isRefreshing = false;
const refreshComplete$ = new BehaviorSubject<string | null>(null);

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const token = localStorage.getItem('access_token');
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Se a própria requisição de refresh falhou, desloga
      if (req.url.includes('/auth/refresh-token')) {
        clearSession(router);
        return throwError(() => error);
      }

      if (isRefreshing) {
        // Aguarda o refresh terminar e reenvia a requisição com o novo token
        return refreshComplete$.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((newToken) => next(addToken(req, newToken!))),
        );
      }

      return handleRefresh(req, next, http, router);
    }),
  );
};

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  http: HttpClient,
  router: Router,
) {
  isRefreshing = true;
  refreshComplete$.next(null);

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    isRefreshing = false;
    clearSession(router);
    return throwError(() => new Error('Sem refresh token'));
  }

  return http
    .post<{ success: boolean; data: { access_token: string; refresh_token: string } }>(
      `${ApiService.BASE_URL}/auth/refresh-token`,
      { refresh_token: refreshToken },
    )
    .pipe(
      switchMap(({ data }) => {
        isRefreshing = false;
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        refreshComplete$.next(data.access_token);
        return next(addToken(req, data.access_token));
      }),
      catchError((err) => {
        isRefreshing = false;
        clearSession(router);
        return throwError(() => err);
      }),
    );
}

function clearSession(router: Router): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
  router.navigate(['/login']);
}
