import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Customer } from '../customers.component';

export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
}

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './customer-dialog.component.html',
})
export class CustomerDialogComponent {
  @Input() visible = false;
  @Input() customer: Customer | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<CustomerFormData>();

  name = '';
  email = '';
  phone = '';

  constructor() {
    effect(() => {
      if (this.customer) {
        this.populateForm(this.customer);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnChanges() {
    if (this.visible) {
      if (this.customer) {
        this.populateForm(this.customer);
      } else {
        this.resetForm();
      }
    }
  }

  populateForm(customer: Customer) {
    this.name = customer.name;
    this.email = customer.email;
    this.phone = customer.phone || '';
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.phone = '';
  }

  get isEditing(): boolean {
    return !!this.customer;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Edit Customer' : 'Add New Customer';
  }

  get isFormValid(): boolean {
    return !!(this.name.trim() && this.email.trim());
  }

  close() {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  submit() {
    if (!this.isFormValid) return;

    const data: CustomerFormData = {
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.phone?.trim() || undefined,
    };

    this.save.emit(data);
  }
}
