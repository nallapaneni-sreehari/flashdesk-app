import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  router.navigate(['/login'], { queryParams: { returnUrl } });
  return false;
};

/**
 * Guard to prevent authenticated users from accessing login page
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect to default route based on role
  router.navigate([authService.getDefaultRoute()]);
  return false;
};

/**
 * Guard to check if user has required role
 * Usage: canActivate: [roleGuard(['admin', 'agent'])]
 */
export const roleGuard = (allowedRoles: ('admin' | 'agent' | 'customer')[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Redirect to default route or show unauthorized
    router.navigate(['/unauthorized']);
    return false;
  };
};

/**
 * CanMatch guard for lazy-loaded routes
 */
export const authMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
