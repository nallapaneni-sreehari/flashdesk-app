import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export interface ToastOptions {
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  key?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Show a success toast
   */
  success(summary: string, detail?: string, options?: ToastOptions) {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: options?.life ?? 3000,
      sticky: options?.sticky,
      closable: options?.closable ?? true,
      key: options?.key,
    });
  }

  /**
   * Show an info toast
   */
  info(summary: string, detail?: string, options?: ToastOptions) {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: options?.life ?? 3000,
      sticky: options?.sticky,
      closable: options?.closable ?? true,
      key: options?.key,
    });
  }

  /**
   * Show a warning toast
   */
  warn(summary: string, detail?: string, options?: ToastOptions) {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: options?.life ?? 4000,
      sticky: options?.sticky,
      closable: options?.closable ?? true,
      key: options?.key,
    });
  }

  /**
   * Show an error toast
   */
  error(summary: string, detail?: string, options?: ToastOptions) {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: options?.life ?? 5000,
      sticky: options?.sticky,
      closable: options?.closable ?? true,
      key: options?.key,
    });
  }

  /**
   * Show a secondary/contrast toast
   */
  secondary(summary: string, detail?: string, options?: ToastOptions) {
    this.messageService.add({
      severity: 'secondary',
      summary,
      detail,
      life: options?.life ?? 3000,
      sticky: options?.sticky,
      closable: options?.closable ?? true,
      key: options?.key,
    });
  }

  /**
   * Clear all toasts or toasts with a specific key
   */
  clear(key?: string) {
    this.messageService.clear(key);
  }
}
