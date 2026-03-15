import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Customer } from '../customers.component';

@Component({
  selector: 'app-customer-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    DividerModule,
  ],
  templateUrl: './customer-view-dialog.component.html',
})
export class CustomerViewDialogComponent {
  @Input() visible = false;
  @Input() customer: Customer | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<Customer>();

  getInitials(): string {
    if (!this.customer) return '';
    const parts = this.customer.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return this.customer.name.charAt(0).toUpperCase();
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  close() {
    this.visibleChange.emit(false);
  }

  onEdit() {
    if (this.customer) {
      this.close();
      this.edit.emit(this.customer);
    }
  }
}
