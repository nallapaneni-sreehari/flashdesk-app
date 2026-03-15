import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';

export interface AgentDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'admin' | 'agent' | 'supervisor';
  status: 'active' | 'inactive' | 'away' | 'busy';
  department?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  timezone: string;
  assignedTickets: number;
  resolvedTickets: number;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  jobTitle?: string;
  password?: string;
  sendInvite?: boolean;
}

export interface UpdateAgentPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  timezone?: string;
  password?: string;
}

export interface BulkImportAgentPayload {
  agents: { firstName: string; lastName: string; email: string; phone?: string; role?: string; department?: string; password?: string }[];
}

export interface BulkImportAgentResult {
  created: AgentDto[];
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
export class AgentApiService {
  private api = inject(ApiService);

  getAgents(params?: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PaginatedResponse<AgentDto[]>> {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams['search'] = params.search;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.role) queryParams['role'] = params.role;
    if (params?.page) queryParams['page'] = params.page.toString();
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize.toString();

    return this.api.get<AgentDto[]>('/agents', queryParams) as Observable<PaginatedResponse<AgentDto[]>>;
  }

  getAgentById(id: string): Observable<AgentDto> {
    return this.api.get<AgentDto>(`/agents/${id}`).pipe(map((res) => res.data));
  }

  createAgent(payload: CreateAgentPayload): Observable<AgentDto> {
    return this.api.post<AgentDto>('/agents', payload).pipe(map((res) => res.data));
  }

  updateAgent(id: string, payload: UpdateAgentPayload): Observable<AgentDto> {
    return this.api.patch<AgentDto>(`/agents/${id}`, payload).pipe(map((res) => res.data));
  }

  deleteAgent(id: string): Observable<void> {
    return this.api.delete<void>(`/agents/${id}`).pipe(map((res) => res.data));
  }

  bulkImport(payload: BulkImportAgentPayload): Observable<BulkImportAgentResult> {
    return this.api.post<BulkImportAgentResult>('/agents/bulk', payload).pipe(map((res) => res.data));
  }
}
