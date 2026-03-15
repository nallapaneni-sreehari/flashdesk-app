import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MockDataService, CannedResponse, CannedResponseCategory } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CannedResponseDialogComponent, CannedResponseFormData } from './canned-response-dialog/canned-response-dialog.component';

@Component({
  selector: 'app-canned-responses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    SkeletonModule,
    InputTextModule,
    SelectModule,
    CannedResponseDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './canned-responses.component.html',
})
export class CannedResponsesComponent implements OnInit {
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  isAdmin = this.authService.isAdmin;
  isLoading = signal(true);
  responses = signal<CannedResponse[]>([]);
  categories = signal<CannedResponseCategory[]>([]);
  showDialog = signal(false);
  editingResponse = signal<CannedResponse | null>(null);

  // Filters
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);

  // Stats
  totalCount = computed(() => this.responses().length);
  sharedCount = computed(() => this.responses().filter(r => r.isShared).length);
  categoriesCount = computed(() => this.categories().length);

  // Filtered responses
  filteredResponses = computed(() => {
    let result = this.responses();
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();

    if (query) {
      result = result.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.shortcut.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query)
      );
    }

    if (category) {
      result = result.filter(r => r.categoryId === category);
    }

    return result;
  });

  // Category options for filter dropdown
  categoryOptions = computed(() => [
    { label: 'All Categories', value: null },
    ...this.categories().map(c => ({ label: c.name, value: c.id })),
  ]);

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    this.categories.set(this.mockData.getCannedResponseCategories());
    this.responses.set(this.mockData.getCannedResponses());
    this.isLoading.set(false);
  }

  openNewDialog() {
    this.editingResponse.set(null);
    this.showDialog.set(true);
  }

  openEditDialog(response: CannedResponse) {
    this.editingResponse.set(response);
    this.showDialog.set(true);
  }

  onSave(data: CannedResponseFormData) {
    const editing = this.editingResponse();

    if (editing) {
      const updated = this.mockData.updateCannedResponse(editing.id, data);
      if (updated) {
        this.toast.success('Template Updated', `"${updated.title}" has been updated.`);
        this.loadData();
      }
    } else {
      const created = this.mockData.createCannedResponse({
        ...data,
        createdBy: { id: '1', name: 'Current User' },
      });
      this.toast.success('Template Created', `"${created.title}" has been created.`);
      this.loadData();
    }
  }

  duplicateResponse(response: CannedResponse) {
    const duplicated = this.mockData.duplicateCannedResponse(response.id);
    if (duplicated) {
      this.toast.success('Template Duplicated', `Created "${duplicated.title}".`);
      this.loadData();
    }
  }

  deleteResponse(response: CannedResponse, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${response.title}"?`,
      header: 'Delete Template',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const success = this.mockData.deleteCannedResponse(response.id);
        if (success) {
          this.toast.success('Template Deleted', `"${response.title}" has been deleted.`);
          this.loadData();
        }
      },
    });
  }

  getMenuItems(response: CannedResponse): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog(response),
      },
      {
        label: 'Duplicate',
        icon: 'pi pi-copy',
        command: () => this.duplicateResponse(response),
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: (e) => this.deleteResponse(response, e.originalEvent!),
      },
    ];
  }

  getCategoryColor(categoryId: string): string {
    return this.categories().find(c => c.id === categoryId)?.color || '#6b7280';
  }

  getCategoryIcon(categoryId: string): string {
    return this.categories().find(c => c.id === categoryId)?.icon || 'pi pi-tag';
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
}
