import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardSummary {
  totalOpen: number;
  resolvedToday: number;
  unassigned: number;
  overdueTickets: number;
  avgResponseHours: number;
  totalTickets: number;
  sla: {
    firstResponse: number;
    resolution: number;
    overall: number;
  };
}

export interface ActivityEntry {
  id: string;
  type: 'created' | 'status_changed' | 'priority_changed' | 'assigned' | 'reply' | 'note' | 'updated';
  description: string;
  fromValue: string | null;
  toValue: string | null;
  timestamp: string;
  ticketId: string;
  ticketNumber: number;
  ticketPrefix: string | null;
  subject: string;
  user: { id: string; name: string; avatar: string | null } | null;
}

export interface AttentionTicket {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  customer: { id: string; name: string } | null;
  assignedAgent: { id: string; name: string; avatar: string | null } | null;
}

export interface NeedsAttentionResponse {
  unassigned: AttentionTicket[];
  escalated: AttentionTicket[];
  myTickets: AttentionTicket[];
}

export interface TopPerformer {
  agent: { id: string; name: string; avatar: string | null };
  resolvedCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private api = inject(ApiService);

  async getSummary(): Promise<DashboardSummary> {
    const res = await firstValueFrom(
      this.api.get<DashboardSummary>('/dashboard/summary')
    );
    return res.data;
  }

  async getRecentActivity(limit = 15): Promise<ActivityEntry[]> {
    const res = await firstValueFrom(
      this.api.get<ActivityEntry[]>('/dashboard/activity', { limit: limit.toString() })
    );
    return res.data;
  }

  async getNeedsAttention(): Promise<NeedsAttentionResponse> {
    const res = await firstValueFrom(
      this.api.get<NeedsAttentionResponse>('/dashboard/needs-attention')
    );
    return res.data;
  }

  async getTopPerformers(limit = 5, days = 30): Promise<TopPerformer[]> {
    const res = await firstValueFrom(
      this.api.get<TopPerformer[]>('/dashboard/top-performers', { limit: limit.toString(), days: days.toString() })
    );
    return res.data;
  }
}
