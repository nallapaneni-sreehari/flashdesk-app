import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

interface SettingsNavItem {
  label: string;
  icon: string;
  route: string;
  description: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, RippleModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  navItems: SettingsNavItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      route: '/settings/profile',
      description: 'Manage your personal information',
    },
    {
      label: 'Password & Security',
      icon: 'pi pi-shield',
      route: '/settings/security',
      description: 'Update password and security settings',
    },
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      route: '/settings/notifications',
      description: 'Configure how you receive alerts',
    },
    {
      label: 'Preferences',
      icon: 'pi pi-sliders-h',
      route: '/settings/preferences',
      description: 'Customize your experience',
    },
  ];
}
