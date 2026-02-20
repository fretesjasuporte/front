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

export interface LoadAddress {
  city: string;
  state: string;
  zip_code?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
}

export interface Load {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  origin: LoadAddress;
  destination: LoadAddress;
  cargo_type: string;
  weight_kg: number;
  freight_value: number;
  featured: boolean;
  featured_until: string | null;
  truck_type?: { id: string; name: string };
  body_type?: { id: string; name: string };
  pickup_date?: string;
  estimated_delivery_date?: string;
  notes?: string;
  carrier: { id: string; legal_name: string; trade_name?: string };
  created_at: string;
}

export interface FreightRequest {
  id: string;
  status: 'requested' | 'approved' | 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  trucker_message?: string;
  agreed_value?: number;
  cancellation_reason?: string | null;
  load?: Load;
  trucker?: {
    id: string;
    cpf: string;
    driver_license_category: string;
    profile: { name: string; phone: string };
    truck?: {
      license_plate: string;
      brand?: string;
      model?: string;
      truck_type?: { name: string };
      body_type?: { name: string };
    };
  };
  created_at: string;
}

export interface TruckerDocument {
  id: string;
  trucker_id: string;
  type: 'driver_license' | 'vehicle_registration' | 'proof_of_address' | 'profile_photo' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiry_date?: string;
  notes?: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  signed_url: string;
  created_at: string;
}

export interface TruckerProfile {
  id: string;
  cpf: string;
  birth_date?: string;
  driver_license_number: string;
  driver_license_category: string;
  driver_license_expiry: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
}

export interface CarrierAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface CarrierProfile {
  id: string;
  cnpj: string;
  legal_name: string;
  trade_name?: string;
  business_email?: string;
  address?: CarrierAddress;
  profile: {
    name: string;
    phone: string;
    active: boolean;
  };
  created_at: string;
}

export interface TruckData {
  id: string;
  license_plate: string;
  manufacture_year?: number;
  brand?: string;
  model?: string;
  capacity_kg?: number;
  renavam?: string;
  truck_type?: { id: string; name: string };
  body_type?: { id: string; name: string };
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  active: boolean;
  role: 'admin' | 'operator';
  created_at: string;
}

export interface TruckType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface BodyType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  reply: string | null;
  status: 'open' | 'in_progress' | 'closed';
  replied_at: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
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
