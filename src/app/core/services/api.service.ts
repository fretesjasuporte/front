import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  static readonly BASE_URL = 'https://api-fretesja.onrender.com';

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`, { params: httpParams });
  }

  getPaginated<T>(path: string, params?: Record<string, string | number | boolean>): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<PaginatedResponse<T>>(`${ApiService.BASE_URL}/${path}`, { params: httpParams });
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`, body);
  }

  postFormData<T>(path: string, body: FormData): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`, body);
  }

  put<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`, body);
  }

  patch<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`, body);
  }

  delete<T = null>(path: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${ApiService.BASE_URL}/${path}`);
  }
}
