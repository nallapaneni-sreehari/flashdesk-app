import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MockDataService, SLAPolicy, SLATarget, BusinessHours } from '../../../core/services/mock-data.service';

export interface SLAPolicyFormData {
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  targets: SLATarget[];
  businessHours: BusinessHours;
  appliesTo: {
    channels?: ('email' | 'chat' | 'phone' | 'portal')[];
    ticketTypes?: ('incident' | 'issue' | 'request' | 'question' | 'task' | 'bug' | 'feature-request')[];
    customerTiers?: string[];
  };
  breachActions: {
    notifyAgents: boolean;
    notifySupervisors: boolean;
    autoEscalate: boolean;
    escalateTo?: string;
  };
}

@Component({
  selector: 'app-sla-policy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    ToggleSwitchModule,
    MultiSelectModule,
    TabsModule,
    DividerModule,
    TooltipModule,
  ],
  templateUrl: './sla-policy-dialog.component.html',
})
export class SLAPolicyDialogComponent implements OnChanges {
  private mockData = inject(MockDataService);

  @Input() visible = false;
  @Input() policy: SLAPolicy | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<SLAPolicyFormData>();

  activeTab = signal('general');

  // Form fields
  name = '';
  description = '';
  isDefault = false;
  isActive = true;

  // Targets
  targets: SLATarget[] = [
    { priority: 'urgent', firstResponseTime: 30, resolutionTime: 240, escalateAfter: 15 },
    { priority: 'high', firstResponseTime: 60, resolutionTime: 480, escalateAfter: 30 },
    { priority: 'medium', firstResponseTime: 240, resolutionTime: 1440, escalateAfter: 120 },
    { priority: 'low', firstResponseTime: 480, resolutionTime: 2880, escalateAfter: 240 },
  ];

  // Business Hours
  businessHoursEnabled = true;
  timezone = 'America/New_York';
  schedule: BusinessHours['schedule'] = [
    { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
    { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
  ];
  holidays: BusinessHours['holidays'] = [];
  newHolidayName = '';
  newHolidayDate = '';

  // Applies To
  selectedChannels: string[] = [];
  selectedTicketTypes: string[] = [];
  selectedCustomerTiers: string[] = [];

  // Breach Actions
  notifyAgents = true;
  notifySupervisors = true;
  autoEscalate = false;
  escalateTo = '';

  // Options
  channelOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Chat', value: 'chat' },
    { label: 'Phone', value: 'phone' },
    { label: 'Portal', value: 'portal' },
  ];

  ticketTypeOptions = [
    { label: 'Incident', value: 'incident' },
    { label: 'Issue', value: 'issue' },
    { label: 'Request', value: 'request' },
    { label: 'Question', value: 'question' },
    { label: 'Task', value: 'task' },
    { label: 'Bug', value: 'bug' },
    { label: 'Feature Request', value: 'feature-request' },
  ];

  customerTierOptions = [
    { label: 'Free', value: 'free' },
    { label: 'Starter', value: 'starter' },
    { label: 'Professional', value: 'professional' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' },
  ];

  timezoneOptions = [
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' },
    { label: 'London (GMT)', value: 'Europe/London' },
    { label: 'Paris (CET)', value: 'Europe/Paris' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  ];

  agentOptions: { label: string; value: string }[] = [];

  get isEditing(): boolean {
    return !!this.policy;
  }

  get dialogTitle(): string {
    return this.isEditing ? 'Edit SLA Policy' : 'Create SLA Policy';
  }

  get isValid(): boolean {
    return !!(this.name.trim() && this.description.trim());
  }

  ngOnInit() {
    const agents = this.mockData.getAgents();
    this.agentOptions = agents.map(a => ({ label: a.name, value: a.id }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && this.visible) {
      this.activeTab.set('general');
      if (this.policy) {
        this.populateForm(this.policy);
      } else {
        this.resetForm();
      }
    }
  }

  populateForm(policy: SLAPolicy) {
    this.name = policy.name;
    this.description = policy.description;
    this.isDefault = policy.isDefault;
    this.isActive = policy.isActive;
    this.targets = JSON.parse(JSON.stringify(policy.targets));
    this.businessHoursEnabled = policy.businessHours.enabled;
    this.timezone = policy.businessHours.timezone;
    this.schedule = JSON.parse(JSON.stringify(policy.businessHours.schedule));
    this.holidays = JSON.parse(JSON.stringify(policy.businessHours.holidays));
    this.selectedChannels = policy.appliesTo.channels || [];
    this.selectedTicketTypes = policy.appliesTo.ticketTypes || [];
    this.selectedCustomerTiers = policy.appliesTo.customerTiers || [];
    this.notifyAgents = policy.breachActions.notifyAgents;
    this.notifySupervisors = policy.breachActions.notifySupervisors;
    this.autoEscalate = policy.breachActions.autoEscalate;
    this.escalateTo = policy.breachActions.escalateTo || '';
  }

  resetForm() {
    this.name = '';
    this.description = '';
    this.isDefault = false;
    this.isActive = true;
    this.targets = [
      { priority: 'urgent', firstResponseTime: 30, resolutionTime: 240, escalateAfter: 15 },
      { priority: 'high', firstResponseTime: 60, resolutionTime: 480, escalateAfter: 30 },
      { priority: 'medium', firstResponseTime: 240, resolutionTime: 1440, escalateAfter: 120 },
      { priority: 'low', firstResponseTime: 480, resolutionTime: 2880, escalateAfter: 240 },
    ];
    this.businessHoursEnabled = true;
    this.timezone = 'America/New_York';
    this.schedule = [
      { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00' },
      { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
      { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
    ];
    this.holidays = [];
    this.selectedChannels = [];
    this.selectedTicketTypes = [];
    this.selectedCustomerTiers = [];
    this.notifyAgents = true;
    this.notifySupervisors = true;
    this.autoEscalate = false;
    this.escalateTo = '';
  }

  addHoliday() {
    if (this.newHolidayName.trim() && this.newHolidayDate) {
      this.holidays.push({
        name: this.newHolidayName.trim(),
        date: this.newHolidayDate,
      });
      this.newHolidayName = '';
      this.newHolidayDate = '';
    }
  }

  removeHoliday(index: number) {
    this.holidays.splice(index, 1);
  }

  applyToAllDays(field: 'startTime' | 'endTime', value: string) {
    this.schedule.forEach(day => {
      if (day.enabled) {
        day[field] = value;
      }
    });
  }

  close() {
    this.visibleChange.emit(false);
  }

  onSave() {
    if (!this.isValid) return;

    this.save.emit({
      name: this.name.trim(),
      description: this.description.trim(),
      isDefault: this.isDefault,
      isActive: this.isActive,
      targets: this.targets,
      businessHours: {
        enabled: this.businessHoursEnabled,
        timezone: this.timezone,
        schedule: this.schedule,
        holidays: this.holidays,
      },
      appliesTo: {
        channels: this.selectedChannels.length ? this.selectedChannels as any : undefined,
        ticketTypes: this.selectedTicketTypes.length ? this.selectedTicketTypes as any : undefined,
        customerTiers: this.selectedCustomerTiers.length ? this.selectedCustomerTiers : undefined,
      },
      breachActions: {
        notifyAgents: this.notifyAgents,
        notifySupervisors: this.notifySupervisors,
        autoEscalate: this.autoEscalate,
        escalateTo: this.autoEscalate ? this.escalateTo : undefined,
      },
    });

    this.close();
  }

  formatDayName(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
}
