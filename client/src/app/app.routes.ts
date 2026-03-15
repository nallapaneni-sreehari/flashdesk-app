import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { setupCompleteGuard, setupPendingGuard } from './core/guards/setup.guard';

export const routes: Routes = [
  // Setup route (shown only when no workspace exists)
  {
    path: 'setup',
    component: AuthLayoutComponent,
    // canActivate: [setupPendingGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./modules/auth/setup/setup.component').then((m) => m.SetupComponent),
      },
    ],
  },
  // Auth routes (public)
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./modules/auth/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  // Protected routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', 
        loadComponent: () =>
          import('./modules/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./modules/tickets/tickets.component').then((m) => m.TicketsComponent),
      },
      {
        path: 'tickets/:ticketNumber',
        loadComponent: () =>
          import('./modules/tickets/ticket-detail/ticket-detail.component').then((m) => m.TicketDetailComponent),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./modules/customers/customers.component').then((m) => m.CustomersComponent),
      },
      {
        path: 'agents',
        loadComponent: () =>
          import('./modules/agents/agents.component').then((m) => m.AgentsComponent),
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'knowledge-base',
        loadComponent: () =>
          import('./modules/knowledge-base/knowledge-base.component').then((m) => m.KnowledgeBaseComponent),
      },
      {
        path: 'knowledge-base/article/:slug',
        loadComponent: () =>
          import('./modules/knowledge-base/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./modules/settings/settings.component').then((m) => m.SettingsComponent),
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          {
            path: 'profile',
            loadComponent: () =>
              import('./modules/settings/profile-settings/profile-settings.component').then((m) => m.ProfileSettingsComponent),
          },
          {
            path: 'security',
            loadComponent: () =>
              import('./modules/settings/security-settings/security-settings.component').then((m) => m.SecuritySettingsComponent),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./modules/settings/notification-settings/notification-settings.component').then((m) => m.NotificationSettingsComponent),
          },
          {
            path: 'preferences',
            loadComponent: () =>
              import('./modules/settings/preferences-settings/preferences-settings.component').then((m) => m.PreferencesSettingsComponent),
          },
        ],
      },
      {
        path: 'sla-policies',
        loadComponent: () =>
          import('./modules/sla/sla-policies.component').then((m) => m.SLAPoliciesComponent),
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'canned-responses',
        loadComponent: () =>
          import('./modules/canned-responses/canned-responses.component').then((m) => m.CannedResponsesComponent),
      },
    ],
  },
  // Fallback redirect
  { path: '**', redirectTo: 'login' },
];
