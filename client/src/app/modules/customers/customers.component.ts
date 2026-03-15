import { Component, computed, inject, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../core/services/toast.service';
import { LoaderService } from '../../core/services/loader.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { CustomerApiService, CustomerDto } from '../../core/services/customer-api.service';
import { CustomerDialogComponent, CustomerFormData } from './customer-dialog/customer-dialog.component';
import { CustomerViewDialogComponent } from './customer-view-dialog/customer-view-dialog.component';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  tier?: string | null;
  totalTickets: number;
  openTickets: number;
  createdAt: string;
  lastContactAt?: string | null;
}

export interface ImportCustomer {
  name: string;
  email: string;
  phone?: string;
  selected: boolean;
  valid: boolean;
  error?: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    DialogModule,
    CheckboxModule,
    CustomerDialogComponent,
    CustomerViewDialogComponent,
  ],
  templateUrl: './customers.component.html',
})
export class CustomersComponent implements OnInit {
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private confirmDialog = inject(ConfirmDialogService);
  private customerApi = inject(CustomerApiService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  searchQuery = signal('');
  showCustomerDialog = signal(false);
  editingCustomer = signal<Customer | null>(null);
  showViewDialog = signal(false);
  viewingCustomer = signal<Customer | null>(null);
  showImportDialog = signal(false);
  importCustomers = signal<ImportCustomer[]>([]);
  selectAll = signal(false);

  customers = signal<Customer[]>([]);

  filteredCustomers = computed(() => {
    let result = this.customers();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
      );
    }

    return result;
  });

  // Stats
  totalCustomers = computed(() => this.customers().length);
  totalOpenTickets = computed(() => this.customers().reduce((sum, c) => sum + c.openTickets, 0));

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerApi.getCustomers({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.customers.set(res.data);
      },
    });
  }

  getInitials(customer: Customer): string {
    const parts = customer.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return customer.name.charAt(0).toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatRelativeTime(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.formatDate(dateStr);
  }

  // --- CRUD ---

  openAddDialog() {
    this.editingCustomer.set(null);
    this.showCustomerDialog.set(true);
  }

  openEditDialog(customer: Customer) {
    this.editingCustomer.set(customer);
    this.showCustomerDialog.set(true);
  }

  openViewDialog(customer: Customer) {
    this.viewingCustomer.set(customer);
    this.showViewDialog.set(true);
  }

  onDialogClose() {
    this.showCustomerDialog.set(false);
    this.editingCustomer.set(null);
  }

  onViewDialogClose() {
    this.showViewDialog.set(false);
    this.viewingCustomer.set(null);
  }

  onCustomerSave(data: CustomerFormData) {
    const editing = this.editingCustomer();

    if (editing) {
      this.loader.show('primary', { text: 'Updating customer...' });
      this.customerApi.updateCustomer(editing.id, { name: data.name, email: data.email, phone: data.phone }).subscribe({
        next: () => {
          this.loader.hide();
          this.onDialogClose();
          this.toast.success('Customer Updated', `${data.name} has been updated`);
          this.loadCustomers();
        },
        error: () => {
          this.loader.hide();
        },
      });
    } else {
      this.loader.show('primary', { text: 'Creating customer...' });
      this.customerApi.createCustomer({ name: data.name, email: data.email, phone: data.phone }).subscribe({
        next: () => {
          this.loader.hide();
          this.onDialogClose();
          this.toast.success('Customer Created', `${data.name} has been added`);
          this.loadCustomers();
        },
        error: () => {
          this.loader.hide();
        },
      });
    }
  }

  async deleteCustomer(customer: Customer) {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete ${customer.name}? This action cannot be undone.`,
      icon: 'pi pi-trash',
      iconColor: 'text-red-500',
      confirmLabel: 'Delete',
      confirmSeverity: 'danger',
    });

    if (!confirmed) return;

    this.customerApi.deleteCustomer(customer.id).subscribe({
        next: () => {
            this.toast.success('Customer Deleted', `${customer.name} has been removed`);
            this.loadCustomers();
        },
    });
  }

  // --- CSV Import ---

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      this.toast.error('Invalid File', 'Please select a CSV file');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.parseCSV(content);
      input.value = '';
    };
    reader.readAsText(file);
  }

  parseCSV(content: string) {
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      this.toast.error('Invalid CSV', 'CSV file must have a header row and at least one data row');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email'];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length) {
      this.toast.error('Missing Columns', `Required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    const existingEmails = new Set(this.customers().map((c) => c.email.toLowerCase()));
    const imported: ImportCustomer[] = [];
    const seenEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      const name = row['name'] || '';
      const email = row['email'] || '';
      const phone = row['phone'] || row['mobile'] || '';

      let valid = true;
      let error = '';

      if (!name || !email) {
        valid = false;
        error = 'Missing required fields';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        valid = false;
        error = 'Invalid email format';
      } else if (existingEmails.has(email.toLowerCase())) {
        valid = false;
        error = 'Email already exists';
      } else if (seenEmails.has(email.toLowerCase())) {
        valid = false;
        error = 'Duplicate email in file';
      }

      if (valid) {
        seenEmails.add(email.toLowerCase());
      }

      imported.push({
        name,
        email,
        phone: phone || undefined,
        selected: valid,
        valid,
        error,
      });
    }

    this.importCustomers.set(imported);
    this.updateSelectAll();
    this.showImportDialog.set(true);
  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  toggleSelectAll() {
    const newValue = !this.selectAll();
    this.selectAll.set(newValue);
    this.importCustomers.update((list) =>
      list.map((c) => ({ ...c, selected: c.valid ? newValue : false }))
    );
  }

  onCustomerSelectChange() {
    this.updateSelectAll();
  }

  updateSelectAll() {
    const valid = this.importCustomers().filter((c) => c.valid);
    const allSelected = valid.length > 0 && valid.every((c) => c.selected);
    this.selectAll.set(allSelected);
  }

  getSelectedCount(): number {
    return this.importCustomers().filter((c) => c.selected).length;
  }

  getValidCount(): number {
    return this.importCustomers().filter((c) => c.valid).length;
  }

  closeImportDialog() {
    this.showImportDialog.set(false);
    this.importCustomers.set([]);
    this.selectAll.set(false);
  }

  confirmImport() {
    const selected = this.importCustomers().filter((c) => c.selected);
    if (!selected.length) {
      this.toast.warn('No Selection', 'Please select at least one customer to import');
      return;
    }

    this.loader.show('primary', { text: `Importing ${selected.length} customers...` });

    const customers = selected.map((c) => ({ name: c.name, email: c.email, phone: c.phone }));
    this.customerApi.bulkImport({ customers }).subscribe({
      next: (res) => {
        this.loader.hide();
        this.closeImportDialog();
        const count = res.created.length;
        this.toast.success('Import Complete', `${count} customer${count > 1 ? 's' : ''} imported successfully`);
        this.loadCustomers();
      },
      error: () => {
        this.loader.hide();
      },
    });
  }

  downloadTemplate() {
    const headers = ['name', 'email', 'phone'];
    const sampleData = [
      ['John Doe', 'john.doe@example.com', '+1 555-0123'],
      ['Jane Smith', 'jane.smith@example.com', ''],
    ];

    const csvContent = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
