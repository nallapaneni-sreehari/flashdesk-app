import { Component, EventEmitter, Input, Output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { Agent } from '../agents.component';

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'agent' | 'supervisor';
  department?: string;
  status?: 'active' | 'inactive' | 'away' | 'busy';
  password?: string;
  sendInvite?: boolean;
}

@Component({
  selector: 'app-agent-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DividerModule,
    PasswordModule,
    InputMaskModule,
    CheckboxModule,
  ],
  templateUrl: './agent-dialog.component.html',
})
export class AgentDialogComponent {
  @Input() visible = false;
  @Input() agent: Agent | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<AgentFormData>();

  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  mobile = '';
  role: 'admin' | 'agent' | 'supervisor' = 'agent';
  department = '';
  status: 'active' | 'inactive' | 'away' | 'busy' = 'active';
  password = '';
  sendInvite = true;

  roleOptions = [
    { label: 'Agent', value: 'agent' },
    { label: 'Supervisor', value: 'supervisor' },
    { label: 'Admin', value: 'admin' },
  ];

  departmentOptions = [
    { label: 'Support', value: 'Support' },
    { label: 'Technical', value: 'Technical' },
    { label: 'Billing', value: 'Billing' },
    { label: 'Sales', value: 'Sales' },
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Away', value: 'away' },
    { label: 'Busy', value: 'busy' },
    { label: 'Inactive', value: 'inactive' },
  ];

  constructor() {
    effect(() => {
      if (this.agent) {
        this.populateForm(this.agent);
      } else {
        this.resetForm();
      }
    });
  }

  ngOnChanges() {
    if (this.visible) {
      if (this.agent) {
        this.populateForm(this.agent);
      } else {
        this.resetForm();
      }
    }
  }

  populateForm(agent: Agent) {
    this.firstName = agent.firstName;
    this.lastName = agent.lastName;
    this.email = agent.email;
    this.mobile = agent.mobile || '';
    this.role = agent.role;
    this.department = agent.department || '';
    this.status = agent.status;
    this.password = '';
    this.sendInvite = false;
  }

  resetForm() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.mobile = '';
    this.role = 'agent';
    this.department = '';
    this.status = 'active';
    this.password = this.generatePassword();
    this.sendInvite = true;
  }

  generatePassword(): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%&*';
    const all = upper + lower + digits + special;

    // Guarantee at least one of each type
    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];

    // Fill remaining length with random chars
    for (let i = required.length; i < 14; i++) {
      required.push(all[Math.floor(Math.random() * all.length)]);
    }

    // Shuffle
    for (let i = required.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [required[i], required[j]] = [required[j], required[i]];
    }

    return required.join('');
  }

  regeneratePassword() {
    this.password = this.generatePassword();
  }

  get isEditing(): boolean {
    return !!this.agent;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Edit Agent' : 'Add New Agent';
  }

  get isFormValid(): boolean {
    return !!(this.firstName.trim() && this.lastName.trim() && this.email.trim() && this.role);
  }

  close() {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  submit() {
    if (!this.isFormValid) return;

    const data: AgentFormData = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      mobile: this.mobile?.trim() || undefined,
      role: this.role,
      department: this.department?.trim() || undefined,
      status: this.status,
      password: this.password || undefined,
      sendInvite: this.sendInvite,
    };

    this.save.emit(data);
  }
}
