import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

export type UserRole = 'carrier' | 'trucker' | 'admin' | 'operator';

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());
  private readonly _isAuthenticated = computed(() => this._currentUser() !== null);
  private readonly _userRole = computed(() => this._currentUser()?.role ?? null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;
  readonly userRole = this._userRole;

  login(email: string, password: string) {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(
        `${ApiService.BASE_URL}/auth/login`,
        { email, password },
      )
      .pipe(tap(({ data }) => this.saveSession(data)));
  }

  registerTrucker(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    cpf: string;
    birth_date?: string;
  }) {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(
        `${ApiService.BASE_URL}/auth/register/trucker`,
        payload,
      )
      .pipe(tap(({ data }) => this.saveSession(data)));
  }

  registerCarrier(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    return this.http
      .post<{ success: boolean; data: AuthResponse }>(
        `${ApiService.BASE_URL}/auth/register/carrier`,
        payload,
      )
      .pipe(tap(({ data }) => this.saveSession(data)));
  }

  logout() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .post(`${ApiService.BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe({ error: () => {} }); // fire-and-forget
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  forgotPassword(email: string) {
    return this.http.post(
      `${ApiService.BASE_URL}/auth/forgot-password`,
      { email },
    );
  }

  resetPassword(token: string, new_password: string) {
    return this.http.post(
      `${ApiService.BASE_URL}/auth/reset-password`,
      { token, new_password },
    );
  }

  redirectAfterLogin(): void {
    const role = this._userRole();
    if (role === 'trucker') this.router.navigate(['/motorista/dashboard']);
    else if (role === 'carrier') this.router.navigate(['/transportadora/dashboard']);
    else if (role === 'admin' || role === 'operator') this.router.navigate(['/admin/caminhoneiros']);
    else this.router.navigate(['/']);
  }

  private saveSession(data: AuthResponse): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('current_user', JSON.stringify(data.user));
    this._currentUser.set(data.user);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this._currentUser.set(null);
  }

  private loadUserFromStorage(): CurrentUser | null {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? (JSON.parse(raw) as CurrentUser) : null;
    } catch {
      return null;
    }
  }
}
