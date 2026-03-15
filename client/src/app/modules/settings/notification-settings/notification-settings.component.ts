import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ToastService } from '../../../core/services/toast.service';

interface NotificationChannel {
  id: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToggleSwitchModule,
    ButtonModule,
    SelectModule,
    DividerModule,
  ],
  templateUrl: './notification-settings.component.html',
})
export class NotificationSettingsComponent {
  private toastService = inject(ToastService);

  isSaving = signal(false);

  // Digest frequency
  digestFrequency = signal('daily');
  digestOptions = [
    { label: 'Real-time', value: 'realtime' },
    { label: 'Hourly digest', value: 'hourly' },
    { label: 'Daily digest', value: 'daily' },
    { label: 'Weekly digest', value: 'weekly' },
    { label: 'Never', value: 'never' },
  ];

  // Quiet hours
  quietHoursEnabled = signal(false);
  quietHoursStart = signal('22:00');
  quietHoursEnd = signal('08:00');

  timeOptions = [
    { label: '6:00 AM', value: '06:00' },
    { label: '7:00 AM', value: '07:00' },
    { label: '8:00 AM', value: '08:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 PM', value: '22:00' },
    { label: '11:00 PM', value: '23:00' },
    { label: '12:00 AM', value: '00:00' },
  ];

  // Channels
  channels: NotificationChannel[] = [
    {
      id: 'email',
      label: 'Email Notifications',
      description: 'Receive updates via email',
      icon: 'pi pi-envelope',
      enabled: true,
    },
    {
      id: 'push',
      label: 'Push Notifications',
      description: 'Browser and mobile notifications',
      icon: 'pi pi-bell',
      enabled: true,
    },
    {
      id: 'sms',
      label: 'SMS Notifications',
      description: 'Critical alerts via text message',
      icon: 'pi pi-mobile',
      enabled: false,
    },
  ];

  // Categories
  categories: NotificationCategory[] = [
    {
      id: 'new_ticket',
      label: 'New Ticket Assigned',
      description: 'When a new ticket is assigned to you',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'ticket_reply',
      label: 'Customer Reply',
      description: 'When a customer responds to a ticket',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'ticket_mention',
      label: 'Mentions',
      description: 'When someone mentions you in a ticket',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'sla_warning',
      label: 'SLA Warnings',
      description: 'When a ticket is approaching SLA breach',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'sla_breach',
      label: 'SLA Breach',
      description: 'When a ticket has breached its SLA',
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: 'ticket_escalated',
      label: 'Ticket Escalated',
      description: 'When a ticket is escalated',
      email: true,
      push: false,
      inApp: true,
    },
    {
      id: 'daily_summary',
      label: 'Daily Summary',
      description: 'Daily digest of your ticket activity',
      email: true,
      push: false,
      inApp: false,
    },
    {
      id: 'team_updates',
      label: 'Team Updates',
      description: 'Updates about your team and colleagues',
      email: false,
      push: false,
      inApp: true,
    },
  ];

  async savePreferences() {
    this.isSaving.set(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.isSaving.set(false);
    this.toastService.success('Preferences Saved', 'Your notification settings have been updated');
  }

  toggleChannel(channel: NotificationChannel) {
    channel.enabled = !channel.enabled;
  }

  toggleAll(type: 'email' | 'push' | 'inApp', value: boolean) {
    this.categories.forEach((cat) => {
      cat[type] = value;
    });
  }
}
