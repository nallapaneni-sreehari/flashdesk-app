import { Component, input, output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  shortcutKey?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private authService = inject(AuthService);

  collapsed = input(false);
  toggle = output<void>();

  private allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard', shortcutKey: 'G then D' },
    { label: 'Tickets', icon: 'pi pi-ticket', route: '/tickets', shortcutKey: 'G then T' },
    { label: 'Customers', icon: 'pi pi-users', route: '/customers', shortcutKey: 'G then C' },
    { label: 'Agents', icon: 'pi pi-user', route: '/agents', adminOnly: true, shortcutKey: 'G then A' },
    { label: 'Knowledge Base', icon: 'pi pi-book', route: '/knowledge-base', shortcutKey: 'G then K' },
    { label: 'SLA Policies', icon: 'pi pi-clock', route: '/sla-policies', adminOnly: true },
    { label: 'Canned Responses', icon: 'pi pi-file-edit', route: '/canned-responses' },
    { label: 'Settings', icon: 'pi pi-cog', route: '/settings', shortcutKey: 'G then S' },
  ];

  navItems = computed(() => {
    const isAdmin = this.authService.isAdmin();
    return this.allNavItems.filter(item => !item.adminOnly || isAdmin);
  });

  onToggle() {
    this.toggle.emit();
  }
}
