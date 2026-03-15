import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';

export interface TicketDto {
  id: string;
  ticketNumber: number;
  ticketPrefix: string | null;
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  channel: string;
  eta: number | null;
  firstResponseDue: string | null;
  resolutionDue: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customerId: string | null;
  customer: { id: string; name: string; email: string; avatar: string | null } | null;
  assignedAgentId: string | null;
  assignedAgent: { id: string; firstName: string; lastName: string; avatar: string | null } | null;
  tags: string[];
  messageCount: number;
}

export interface PaginatedTicketResponse extends ApiResponse<TicketDto[]> {
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  customerId: string;
  type: string;
  priority: string;
  channel: string;
  assignedAgentId?: string;
  followerIds?: string[];
  tags?: string[];
}

export interface UpdateTicketPayload {
  status?: string;
  priority?: string;
  type?: string;
  assignedAgentId?: string | null;
  description?: string;
  subject?: string;
  eta?: number | null;
  followerIds?: string[];
  tags?: string[];
}

export interface SendMessagePayload {
  content: string;
  contentHtml?: string;
  isInternal?: boolean;
}

export interface MessageDto {
  id: string;
  content: string;
  contentHtml: string | null;
  isInternal: boolean;
  authorType: 'agent' | 'customer' | 'system';
  createdAt: string;
  ticketId: string;
  userId: string | null;
  customerId: string | null;
  user: { id: string; firstName: string; lastName: string; avatar: string | null } | null;
  customer: { id: string; name: string; avatar: string | null } | null;
}

@Injectable({ providedIn: 'root' })
export class TicketApiService {
  private api = inject(ApiService);

  getTickets(params?: {
    search?: string;
    status?: string;
    priority?: string;
    type?: string;
    channel?: string;
    assignedAgentId?: string;
    customerId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Observable<PaginatedTicketResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams['search'] = params.search;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.priority) queryParams['priority'] = params.priority;
    if (params?.type) queryParams['type'] = params.type;
    if (params?.channel) queryParams['channel'] = params.channel;
    if (params?.assignedAgentId) queryParams['assignedAgentId'] = params.assignedAgentId;
    if (params?.customerId) queryParams['customerId'] = params.customerId;
    if (params?.page) queryParams['page'] = params.page.toString();
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize.toString();
    if (params?.sortBy) queryParams['sortBy'] = params.sortBy;
    if (params?.sortOrder) queryParams['sortOrder'] = params.sortOrder;

    return this.api.get<TicketDto[]>('/tickets', queryParams) as Observable<PaginatedTicketResponse>;
  }

  createTicket(payload: CreateTicketPayload): Observable<any> {
    return this.api.post('/tickets', payload).pipe(map((res) => res.data));
  }

  getTicketByNumber(ticketNumber: number): Observable<any> {
    return this.api.get(`/tickets/${ticketNumber}`).pipe(map((res) => res.data));
  }

  updateTicket(ticketNumber: number, payload: UpdateTicketPayload): Observable<any> {
    return this.api.patch(`/tickets/${ticketNumber}`, payload).pipe(map((res) => res.data));
  }

  sendMessage(ticketNumber: number, payload: SendMessagePayload): Observable<MessageDto> {
    return this.api.post<MessageDto>(`/tickets/${ticketNumber}/messages`, payload).pipe(map((res) => res.data));
  }

  getMessages(ticketNumber: number, params?: { page?: number; pageSize?: number }): Observable<ApiResponse<MessageDto[]>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams['page'] = params.page.toString();
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize.toString();
    return this.api.get<MessageDto[]>(`/tickets/${ticketNumber}/messages`, queryParams);
  }
}
