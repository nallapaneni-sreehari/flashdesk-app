import { Component, computed, inject, output, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { DividerModule } from 'primeng/divider';
import { MenuItem } from 'primeng/api';
import { SearchService } from '../../../core/services/search.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationApiService, NotificationDto } from '../../../core/services/notification-api.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { ThemeConfiguratorComponent } from '../../../shared/components/theme-configurator/theme-configurator.component';

export type NotificationTab = 'all' | 'latest' | 'read';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PopoverModule,
    DividerModule,
    ThemeConfiguratorComponent,
  ],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private router = inject(Router);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  notificationApi = inject(NotificationApiService);
  private socketService = inject(SocketService);
  private toastService = inject(ToastService);
  private notificationSub: Subscription | null = null;
  toggleSidebar = output<void>();

  // Current user from auth service
  currentUser = this.authService.currentUser;

  userMenuItems: MenuItem[] = [];

  ngOnInit() {
    this.userMenuItems = [
      { label: 'Profile', icon: 'pi pi-user' },
      { label: 'Settings', icon: 'pi pi-cog' },
      { separator: true },
      { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
    ];

    // Start polling for notifications
    this.notificationApi.startPolling();

    // Connect Socket.IO for real-time notifications (idempotent — won't reconnect if already connected)
    this.socketService.connect();

    // Real-time notifications via Socket.IO
    this.notificationSub = this.socketService.notification$.subscribe(notification => {
      console.log('[Topbar] notification:new received', notification);
      // Signal updates work outside zone
      this.notificationApi.unreadCount.update(c => c + 1);
      this.notificationApi.notifications.update(list => [{
        ...notification,
        read: false,
        time: new Date().toISOString(),
      } as any, ...list]);
      // Toast needs zone — setTimeout is auto-patched by zone.js
      setTimeout(() => {
        this.toastService.info(notification.title, notification.message, { life: 5000 });
      });
    });
  }

  ngOnDestroy() {
    this.notificationApi.stopPolling();
    this.notificationSub?.unsubscribe();
  }

  tabs: NotificationTab[] = ['all', 'latest', 'read'];
  selectedTab = signal<NotificationTab>('latest');

  filteredNotifications = computed(() => {
    const tab = this.selectedTab();
    const all = this.notificationApi.notifications();
    
    switch (tab) {
      case 'latest':
        return all.filter(n => !n.read);
      case 'read':
        return all.filter(n => n.read);
      default:
        return all;
    }
  });

  get unreadCount(): number {
    return this.notificationApi.unreadCount();
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  openSearch() {
    this.searchService.open();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  onNotificationClick(notification: NotificationDto) {
    if (!notification.read) {
      this.notificationApi.markAsRead(notification.id);
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllAsRead() {
    this.notificationApi.markAllAsRead();
  }

  /** Refresh the full list when the panel opens */
  onPanelShow() {
    this.notificationApi.fetchNotifications();
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      ticket: 'pi pi-ticket',
      mention: 'pi pi-at',
      system: 'pi pi-info-circle',
      assignment: 'pi pi-users',
    };
    return icons[type] || 'pi pi-bell';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      ticket: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      mention: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      system: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      assignment: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  formatTime(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
