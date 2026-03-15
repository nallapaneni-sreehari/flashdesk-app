import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface ChangeItem {
  field: string;
  from?: string;
  to: string;
}

export interface ConfirmDialogConfig {
  title?: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  changes?: ChangeItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  visible = signal(false);
  config = signal<ConfirmDialogConfig>({});
  
  private resultSubject = new Subject<boolean>();

  confirm(config: ConfirmDialogConfig = {}): Promise<boolean> {
    // Only use default message if no changes are provided
    const defaultMessage = config.changes?.length ? undefined : 'Are you sure you want to proceed?';
    
    this.config.set({
      title: config.title ?? 'Confirm',
      message: config.message ?? defaultMessage,
      icon: config.icon ?? 'pi pi-exclamation-triangle',
      iconColor: config.iconColor ?? 'text-amber-500',
      confirmLabel: config.confirmLabel ?? 'Confirm',
      cancelLabel: config.cancelLabel ?? 'Cancel',
      confirmSeverity: config.confirmSeverity ?? 'danger',
      changes: config.changes,
    });
    
    this.visible.set(true);
    
    return new Promise<boolean>((resolve) => {
      const subscription = this.resultSubject.subscribe((result) => {
        subscription.unsubscribe();
        resolve(result);
      });
    });
  }

  accept() {
    this.visible.set(false);
    this.resultSubject.next(true);
  }

  reject() {
    this.visible.set(false);
    this.resultSubject.next(false);
  }
}
