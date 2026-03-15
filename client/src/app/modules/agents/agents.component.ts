import { Component, computed, inject, signal, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastService } from '../../core/services/toast.service';
import { LoaderService } from '../../core/services/loader.service';
import { AgentApiService, AgentDto } from '../../core/services/agent-api.service';
import { AgentDialogComponent, AgentFormData } from './agent-dialog/agent-dialog.component';

export interface ImportAgent {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'agent' | 'supervisor';
  department?: string;
  selected: boolean;
  valid: boolean;
  error?: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  avatar?: string;
  role: 'admin' | 'agent' | 'supervisor';
  status: 'active' | 'inactive' | 'away' | 'busy';
  department?: string;
  assignedTickets: number;
  resolvedTickets: number;
  avgResponseTime?: string;
  createdAt: Date;
  lastActiveAt?: Date;
}

@Component({
  selector: 'app-agents',
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
    MenuModule,
    BadgeModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    AgentDialogComponent,
    DialogModule,
    CheckboxModule,
  ],
  templateUrl: './agents.component.html',
})
export class AgentsComponent implements OnInit {
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private agentApi = inject(AgentApiService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  searchQuery = signal('');
  statusFilter = signal<string | null>(null);
  roleFilter = signal<string | null>(null);
  showAgentDialog = signal(false);
  editingAgent = signal<Agent | null>(null);
  showImportDialog = signal(false);
  importAgents = signal<ImportAgent[]>([]);
  selectAll = signal(false);

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'active' },
    { label: 'Away', value: 'away' },
    { label: 'Busy', value: 'busy' },
    { label: 'Inactive', value: 'inactive' },
  ];

  roleOptions = [
    { label: 'All Roles', value: null },
    { label: 'Admin', value: 'admin' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Agent', value: 'agent' },
  ];

  agents = signal<Agent[]>([]);

  ngOnInit() {
    this.loadAgents();
  }

  loadAgents() {
    this.agentApi.getAgents({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.agents.set(
          res.data.map((a: AgentDto) => ({
            id: a.id,
            firstName: a.firstName,
            lastName: a.lastName,
            email: a.email,
            mobile: a.phone || undefined,
            avatar: a.avatar || undefined,
            role: a.role,
            status: a.status,
            department: a.department || undefined,
            assignedTickets: a.assignedTickets,
            resolvedTickets: a.resolvedTickets,
            createdAt: new Date(a.createdAt),
            lastActiveAt: a.lastActiveAt ? new Date(a.lastActiveAt) : undefined,
          }))
        );
      },
    });
  }

  filteredAgents = computed(() => {
    let result = this.agents();

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(
        (a) =>
          a.firstName.toLowerCase().includes(query) ||
          a.lastName.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          a.department?.toLowerCase().includes(query)
      );
    }

    // Status filter
    const status = this.statusFilter();
    if (status) {
      result = result.filter((a) => a.status === status);
    }

    // Role filter
    const role = this.roleFilter();
    if (role) {
      result = result.filter((a) => a.role === role);
    }

    return result;
  });

  // Stats
  totalAgents = computed(() => this.agents().length);
  activeAgents = computed(() => this.agents().filter((a) => a.status === 'active').length);
  totalAssigned = computed(() => this.agents().reduce((sum, a) => sum + a.assignedTickets, 0));

  getFullName(agent: Agent): string {
    return `${agent.firstName} ${agent.lastName}`;
  }

  getInitials(agent: Agent): string {
    return `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      active: 'success',
      away: 'warn',
      busy: 'info',
      inactive: 'secondary',
    };
    return map[status] || 'secondary';
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      admin: 'danger',
      supervisor: 'warn',
      agent: 'info',
    };
    return map[role] || 'secondary';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatRelativeTime(date: Date | undefined): string {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.formatDate(date);
  }

  openAddDialog() {
    this.editingAgent.set(null);
    this.showAgentDialog.set(true);
  }

  openEditDialog(agent: Agent) {
    this.editingAgent.set(agent);
    this.showAgentDialog.set(true);
  }

  onDialogClose() {
    this.showAgentDialog.set(false);
    this.editingAgent.set(null);
  }

  onAgentSave(data: AgentFormData) {
    this.loader.show('primary', { text: this.editingAgent() ? 'Updating agent...' : 'Creating agent...' });

    if (this.editingAgent()) {
      this.agentApi.updateAgent(this.editingAgent()!.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.mobile,
        role: data.role,
        department: data.department,
        status: data.status,
        password: data.password,
      }).subscribe({
        next: () => {
          this.loader.hide();
          this.toast.success('Agent Updated', `${data.firstName} ${data.lastName} has been updated`);
          this.onDialogClose();
          this.loadAgents();
        },
        error: () => {
          this.loader.hide();
        },
      });
    } else {
      this.agentApi.createAgent({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.mobile,
        role: data.role,
        department: data.department,
        password: data.password,
        sendInvite: data.sendInvite,
      }).subscribe({
        next: () => {
          this.loader.hide();
          this.toast.success('Agent Created', `${data.firstName} ${data.lastName} has been added`);
          this.onDialogClose();
          this.loadAgents();
        },
        error: () => {
          this.loader.hide();
        },
      });
    }
  }

  toggleAgentStatus(agent: Agent) {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    this.agentApi.updateAgent(agent.id, { status: newStatus }).subscribe({
      next: () => {
        this.agents.update((agents) =>
          agents.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a))
        );
        this.toast.success(
          'Status Updated',
          `${this.getFullName(agent)} is now ${newStatus}`
        );
      },
    });
  }

  deleteAgent(agent: Agent) {
    this.agentApi.deleteAgent(agent.id).subscribe({
      next: () => {
        this.agents.update((agents) => agents.filter((a) => a.id !== agent.id));
        this.toast.success('Agent Removed', `${this.getFullName(agent)} has been removed`);
      },
    });
  }

  // CSV Import Methods
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
    const requiredHeaders = ['firstname', 'lastname', 'email'];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length) {
      this.toast.error('Missing Columns', `Required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    const existingEmails = new Set(this.agents().map((a) => a.email.toLowerCase()));
    const importedAgents: ImportAgent[] = [];
    const seenEmails = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || '';
      });

      const firstName = row['firstname'] || '';
      const lastName = row['lastname'] || '';
      const email = row['email'] || '';
      const mobile = row['mobile'] || row['phone'] || '';
      const roleValue = (row['role'] || 'agent').toLowerCase();
      const role = ['admin', 'supervisor', 'agent'].includes(roleValue)
        ? (roleValue as 'admin' | 'supervisor' | 'agent')
        : 'agent';
      const department = row['department'] || '';

      let valid = true;
      let error = '';

      if (!firstName || !lastName || !email) {
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

      importedAgents.push({
        firstName,
        lastName,
        email,
        mobile: mobile || undefined,
        role,
        department: department || undefined,
        selected: valid,
        valid,
        error,
      });
    }

    this.importAgents.set(importedAgents);
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
    this.importAgents.update((agents) =>
      agents.map((a) => ({ ...a, selected: a.valid ? newValue : false }))
    );
  }

  onAgentSelectChange() {
    this.updateSelectAll();
  }

  updateSelectAll() {
    const validAgents = this.importAgents().filter((a) => a.valid);
    const allSelected = validAgents.length > 0 && validAgents.every((a) => a.selected);
    this.selectAll.set(allSelected);
  }

  getSelectedCount(): number {
    return this.importAgents().filter((a) => a.selected).length;
  }

  getValidCount(): number {
    return this.importAgents().filter((a) => a.valid).length;
  }

  closeImportDialog() {
    this.showImportDialog.set(false);
    this.importAgents.set([]);
    this.selectAll.set(false);
  }

  confirmImport() {
    const selectedAgents = this.importAgents().filter((a) => a.selected);
    if (!selectedAgents.length) {
      this.toast.warn('No Selection', 'Please select at least one agent to import');
      return;
    }

    this.loader.show('primary', { text: `Importing ${selectedAgents.length} agents...` });

    this.agentApi.bulkImport({
      agents: selectedAgents.map((a) => ({
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.mobile,
        role: a.role,
        department: a.department,
      })),
    }).subscribe({
      next: (result) => {
        this.loader.hide();
        this.closeImportDialog();
        this.loadAgents();

        if (result.errors.length > 0) {
          this.toast.warn(
            'Import Partial',
            `${result.created.length} imported, ${result.errors.length} failed`
          );
        } else {
          this.toast.success(
            'Import Complete',
            `${result.created.length} agent${result.created.length > 1 ? 's' : ''} imported successfully`
          );
        }
      },
      error: () => {
        this.loader.hide();
      },
    });
  }

  downloadTemplate() {
    const headers = ['firstName', 'lastName', 'email', 'mobile', 'role', 'department'];
    const sampleData = [
      ['John', 'Doe', 'john.doe@example.com', '+1 555-0123', 'agent', 'Support'],
      ['Jane', 'Smith', 'jane.smith@example.com', '', 'supervisor', 'Technical'],
    ];

    const csvContent = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agents_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
