import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SetupService } from '../services/setup.service';

/**
 * Guard that redirects to /setup if workspace is not set up yet.
 * Used on login and protected routes.
 */
export const setupCompleteGuard: CanActivateFn = async () => {
  const setupService = inject(SetupService);
  const router = inject(Router);

  const isComplete = await setupService.checkSetup();

  if (!isComplete) {
    router.navigate(['/setup']);
    return false;
  }

  return true;
};

/**
 * Guard that redirects away from /setup if workspace is already set up.
 * Used on the setup route itself.
 */
export const setupPendingGuard: CanActivateFn = async () => {
  const setupService = inject(SetupService);
  const router = inject(Router);

  const isComplete = await setupService.checkSetup();

  if (isComplete) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
