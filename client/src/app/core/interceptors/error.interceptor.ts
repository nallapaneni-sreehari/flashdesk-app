import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show toast for auth endpoints — they handle errors in the UI
      const isAuthRequest = req.url.includes('/auth/') || req.url.includes('/setup');
      if (!isAuthRequest) {
        const message = error.error?.error?.message || error.error?.message || error.message || 'Something went wrong';
        toast.error('Error', message);
      }

      return throwError(() => error);
    })
  );
};
