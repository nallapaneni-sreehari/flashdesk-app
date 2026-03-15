import { Component, EventEmitter, Input, Output, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { EditorModule } from 'primeng/editor';
import { MultiSelectModule } from 'primeng/multiselect';
import { AvatarModule } from 'primeng/avatar';
import { MockDataService, Ticket } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { CustomerApiService, CustomerDto } from '../../../core/services/customer-api.service';
import { AgentApiService, AgentDto } from '../../../core/services/agent-api.service';

export interface CreateTicketFormData {
  subject: string;
  description: string;
  customerId: string;
  type: Ticket['type'];
  priority: Ticket['priority'];
  assignedAgentId?: string;
  followerIds?: string[];
  channel: Ticket['channel'];
  tags?: string[];
}

@Component({
  selector: 'app-create-ticket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    EditorModule,
    MultiSelectModule,
    AvatarModule,
  ],
  templateUrl: './create-ticket-dialog.component.html',
})
export class CreateTicketDialogComponent implements OnChanges {
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private ticketApi = inject(TicketApiService);
  private customerApi = inject(CustomerApiService);
  private agentApi = inject(AgentApiService);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ticketCreated = new EventEmitter<any>();

  // Form fields
  subject = '';
  description = '';
  selectedCustomer: CustomerDto | null = null;
  type: Ticket['type'] = 'request';
  priority: Ticket['priority'] = 'medium';
  assignedAgent: AgentDto | null = null;
  followers: AgentDto[] = [];
  channel: Ticket['channel'] = 'portal';
  tags: string[] = [];

  // Options
  customers: CustomerDto[] = [];
  agents: (AgentDto & { name: string })[] = [];

  typeOptions = [
    { label: 'Incident', value: 'incident', icon: 'pi pi-exclamation-circle', color: 'text-red-500' },
    { label: 'Issue', value: 'issue', icon: 'pi pi-exclamation-triangle', color: 'text-orange-500' },
    { label: 'Bug', value: 'bug', icon: 'pi pi-bug', color: 'text-rose-500' },
    { label: 'Request', value: 'request', icon: 'pi pi-inbox', color: 'text-blue-500' },
    { label: 'Question', value: 'question', icon: 'pi pi-question-circle', color: 'text-purple-500' },
    { label: 'Task', value: 'task', icon: 'pi pi-check-square', color: 'text-green-500' },
    { label: 'Feature Request', value: 'feature-request', icon: 'pi pi-star', color: 'text-amber-500' },
  ];

  priorityOptions = [
    { label: 'Low', value: 'low', icon: 'pi pi-angle-down', color: 'text-blue-500' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus', color: 'text-yellow-500' },
    { label: 'High', value: 'high', icon: 'pi pi-angle-up', color: 'text-orange-500' },
    { label: 'Urgent', value: 'urgent', icon: 'pi pi-angle-double-up', color: 'text-red-600' },
  ];

  channelOptions = [
    { label: 'Portal', value: 'portal', icon: 'pi pi-globe' },
    { label: 'Email', value: 'email', icon: 'pi pi-envelope' },
    { label: 'Chat', value: 'chat', icon: 'pi pi-comments' },
    { label: 'Phone', value: 'phone', icon: 'pi pi-phone' },
  ];

  // Validation
  submitted = false;

  get isValid(): boolean {
    return !!(this.subject.trim() && this.description.trim() && this.selectedCustomer);
  }

  ngOnChanges() {
    if (this.visible) {
      this.loadData();
      this.resetForm();
    }
  }

  loadData() {
    this.customerApi.getCustomers({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.customers = res.data;
      }
    });
    this.agentApi.getAgents({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.agents = res.data.map(a => ({ ...a, name: `${a.firstName} ${a.lastName}`.trim() }));
      }
    });
  }

  resetForm() {
    this.subject = '';
    this.description = '';
    this.selectedCustomer = null;
    this.type = 'request';
    this.priority = 'medium';
    this.assignedAgent = null;
    this.followers = [];
    this.channel = 'portal';
    this.tags = [];
    this.submitted = false;
  }

  close() {
    this.visibleChange.emit(false);
  }

  submit() {
    this.submitted = true;

    if (!this.isValid) {
      this.toast.error('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.loader.show('primary', { text: 'Creating ticket...' });

    this.ticketApi.createTicket({
      subject: this.subject.trim(),
      description: this.description,
      customerId: this.selectedCustomer!.id,
      type: this.type,
      priority: this.priority,
      channel: this.channel,
      assignedAgentId: this.assignedAgent?.id,
      followerIds: this.followers.map(f => f.id),
      tags: this.tags,
    }).subscribe({
      next: (ticket) => {
        this.loader.hide();
        this.toast.success('Ticket Created', `Ticket has been created successfully`);
        this.ticketCreated.emit(ticket);
        this.close();
      },
      error: () => {
        this.loader.hide();
      },
    });
  }
}
