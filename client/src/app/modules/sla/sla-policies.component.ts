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
import { MockDataService, SLAPolicy } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { SLAPolicyDialogComponent, SLAPolicyFormData } from './sla-policy-dialog/sla-policy-dialog.component';

@Component({
  selector: 'app-sla-policies',
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
    SLAPolicyDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './sla-policies.component.html',
})
export class SLAPoliciesComponent implements OnInit {
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  isLoading = signal(true);
  policies = signal<SLAPolicy[]>([]);
  showPolicyDialog = signal(false);
  editingPolicy = signal<SLAPolicy | null>(null);

  // Stats
  activePoliciesCount = computed(() => this.policies().filter(p => p.isActive).length);
  totalPoliciesCount = computed(() => this.policies().length);

  ngOnInit() {
    this.loadPolicies();
  }

  async loadPolicies() {
    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    this.policies.set(this.mockData.getSLAPolicies());
    this.isLoading.set(false);
  }

  openNewPolicyDialog() {
    this.editingPolicy.set(null);
    this.showPolicyDialog.set(true);
  }

  openEditPolicyDialog(policy: SLAPolicy) {
    this.editingPolicy.set(policy);
    this.showPolicyDialog.set(true);
  }

  onPolicySave(data: SLAPolicyFormData) {
    const editing = this.editingPolicy();

    if (editing) {
      const updated = this.mockData.updateSLAPolicy(editing.id, data);
      if (updated) {
        this.toast.success('Policy Updated', `"${updated.name}" has been updated successfully.`);
        this.loadPolicies();
      }
    } else {
      const created = this.mockData.createSLAPolicy(data as any);
      this.toast.success('Policy Created', `"${created.name}" has been created successfully.`);
      this.loadPolicies();
    }
  }

  duplicatePolicy(policy: SLAPolicy) {
    const duplicated = this.mockData.duplicateSLAPolicy(policy.id);
    if (duplicated) {
      this.toast.success('Policy Duplicated', `Created "${duplicated.name}".`);
      this.loadPolicies();
    }
  }

  togglePolicyStatus(policy: SLAPolicy) {
    const updated = this.mockData.updateSLAPolicy(policy.id, { isActive: !policy.isActive });
    if (updated) {
      this.toast.info(
        policy.isActive ? 'Policy Deactivated' : 'Policy Activated',
        `"${policy.name}" is now ${updated.isActive ? 'active' : 'inactive'}.`
      );
      this.loadPolicies();
    }
  }

  setAsDefault(policy: SLAPolicy) {
    const updated = this.mockData.updateSLAPolicy(policy.id, { isDefault: true, isActive: true });
    if (updated) {
      this.toast.success('Default Policy Set', `"${policy.name}" is now the default SLA policy.`);
      this.loadPolicies();
    }
  }

  confirmDelete(policy: SLAPolicy) {
    if (policy.isDefault) {
      this.toast.warn('Cannot Delete', 'The default policy cannot be deleted. Set another policy as default first.');
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${policy.name}"? This action cannot be undone.`,
      header: 'Delete SLA Policy',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const deleted = this.mockData.deleteSLAPolicy(policy.id);
        if (deleted) {
          this.toast.success('Policy Deleted', `"${policy.name}" has been deleted.`);
          this.loadPolicies();
        }
      },
    });
  }

  getPolicyMenuItems(policy: SLAPolicy): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditPolicyDialog(policy),
      },
      {
        label: 'Duplicate',
        icon: 'pi pi-copy',
        command: () => this.duplicatePolicy(policy),
      },
      {
        separator: true,
      },
      {
        label: policy.isActive ? 'Deactivate' : 'Activate',
        icon: policy.isActive ? 'pi pi-pause' : 'pi pi-play',
        command: () => this.togglePolicyStatus(policy),
      },
      ...(policy.isDefault
        ? []
        : [
            {
              label: 'Set as Default',
              icon: 'pi pi-star',
              command: () => this.setAsDefault(policy),
            },
          ]),
      {
        separator: true,
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        disabled: policy.isDefault,
        command: () => this.confirmDelete(policy),
      },
    ];
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
  }

  getBusinessHoursSummary(policy: SLAPolicy): string {
    if (!policy.businessHours.enabled) {
      return '24/7';
    }
    const activeDays = policy.businessHours.schedule.filter(d => d.enabled).length;
    if (activeDays === 7) {
      return '7 days/week';
    }
    if (activeDays === 5) {
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const isWeekdays = policy.businessHours.schedule
        .filter(d => d.enabled)
        .every(d => weekdays.includes(d.day));
      if (isWeekdays) {
        return 'Mon-Fri';
      }
    }
    return `${activeDays} days/week`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
