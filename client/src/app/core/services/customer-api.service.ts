import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  tier?: string | null;
  totalTickets: number;
  openTickets: number;
  lastContactAt?: string | null;
  createdAt: string;
  updatedAt: string;
  organizationId?: string | null;
  _count?: { tickets: number; messages: number };
  organization?: { id: string; name: string } | null;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tier?: string;
  organizationId?: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  tier?: string;
  lastContactAt?: string;
}

export interface BulkImportPayload {
  customers: { name: string; email: string; phone?: string; tier?: string }[];
  organizationId?: string;
}

export interface BulkImportResult {
  created: CustomerDto[];
  errors: { email: string; message: string }[];
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private api = inject(ApiService);

  getCustomers(params?: {
    search?: string;
    organizationId?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<CustomerDto[]>> {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams['search'] = params.search;
    if (params?.organizationId) queryParams['organizationId'] = params.organizationId;
    if (params?.page) queryParams['page'] = params.page.toString();
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize.toString();

    return this.api.get<CustomerDto[]>('/customers', queryParams) as Observable<PaginatedResponse<CustomerDto[]>>;
  }

  getCustomerById(id: string): Observable<CustomerDto> {
    return this.api.get<CustomerDto>(`/customers/${id}`).pipe(map((res) => res.data));
  }

  createCustomer(payload: CreateCustomerPayload): Observable<CustomerDto> {
    return this.api.post<CustomerDto>('/customers', payload).pipe(map((res) => res.data));
  }

  updateCustomer(id: string, payload: UpdateCustomerPayload): Observable<CustomerDto> {
    return this.api.patch<CustomerDto>(`/customers/${id}`, payload).pipe(map((res) => res.data));
  }

  deleteCustomer(id: string): Observable<void> {
    return this.api.delete<void>(`/customers/${id}`).pipe(map((res) => res.data));
  }

  bulkImport(payload: BulkImportPayload): Observable<BulkImportResult> {
    return this.api.post<BulkImportResult>('/customers/bulk', payload).pipe(map((res) => res.data));
  }
}
