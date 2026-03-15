import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.hasUnsavedChanges && component.hasUnsavedChanges()) {
    const confirmService = inject(ConfirmDialogService);
    return confirmService.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.',
      icon: 'pi pi-exclamation-triangle',
      iconColor: 'text-amber-500',
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
      confirmSeverity: 'danger',
    });
  }
  return true;
};
