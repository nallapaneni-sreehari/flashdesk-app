import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { map, tap, catchError, of } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface NotificationDto {
  id: string;
  type: 'ticket' | 'mention' | 'system' | 'assignment';
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  time: string;
  userId: string;
}

export interface NotificationListResponse {
  notifications: NotificationDto[];
  unreadCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService implements OnDestroy {
  private api = inject(ApiService);
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  private readonly POLL_INTERVAL = 30_000; // 30 seconds

  // Reactive state
  readonly notifications = signal<NotificationDto[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);

  /** Start polling for notifications. Call once after login. */
  startPolling() {
    this.fetchNotifications();
    this.fetchUnreadCount();

    this.stopPolling();
    this.pollTimer = setInterval(() => {
      this.fetchUnreadCount();
    }, this.POLL_INTERVAL);
  }

  /** Stop polling. Call on logout / component destroy. */
  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  /** Fetch paginated notifications and update signal. */
  fetchNotifications(params?: { page?: number; pageSize?: number; unreadOnly?: boolean }) {
    this.loading.set(true);
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams['page'] = params.page.toString();
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize.toString();
    if (params?.unreadOnly) queryParams['unreadOnly'] = 'true';

    this.api.get<NotificationListResponse>('/notifications', queryParams)
      .pipe(
        map(res => res.data),
        catchError(() => of(null)),
      )
      .subscribe(data => {
        if (data) {
          this.notifications.set(data.notifications);
          this.unreadCount.set(data.unreadCount);
        }
        this.loading.set(false);
      });
  }

  /** Fetch only unread count (lightweight poll). */
  fetchUnreadCount() {
    this.api.get<{ unreadCount: number }>('/notifications/unread-count')
      .pipe(
        map(res => res.data.unreadCount),
        catchError(() => of(null)),
      )
      .subscribe(count => {
        if (count !== null) {
          this.unreadCount.set(count);
        }
      });
  }

  /** Mark a single notification as read. */
  markAsRead(id: string) {
    this.api.patch(`/notifications/${id}/read`, {}).subscribe(() => {
      this.notifications.update(list =>
        list.map(n => n.id === id ? { ...n, read: true } : n)
      );
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  /** Mark all notifications as read. */
  markAllAsRead() {
    this.api.patch('/notifications/read-all', {}).subscribe(() => {
      this.notifications.update(list =>
        list.map(n => ({ ...n, read: true }))
      );
      this.unreadCount.set(0);
    });
  }

  /** Reset state (call on logout). */
  reset() {
    this.stopPolling();
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}
