import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PopoverModule } from 'primeng/popover';
import { DrawerModule } from 'primeng/drawer';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { Draggable, Droppable } from 'primeng/dragdrop';
import { ToastService } from '../../core/services/toast.service';
import { MockDataService, Ticket, Agent } from '../../core/services/mock-data.service';
import { AuthService } from '../../core/services/auth.service';
import { TicketApiService, TicketDto } from '../../core/services/ticket-api.service';
import { AgentApiService } from '../../core/services/agent-api.service';
import { LoaderService } from '../../core/services/loader.service';
import { CreateTicketDialogComponent } from './create-ticket-dialog/create-ticket-dialog.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    PopoverModule,
    DrawerModule,
    MultiSelectModule,
    DatePickerModule,
    CheckboxModule,
    CreateTicketDialogComponent,
    Draggable,
    Droppable,
  ],
  templateUrl: './tickets.component.html',
})
export class TicketsComponent implements OnInit {
  private toast = inject(ToastService);
  private mockData = inject(MockDataService);
  private authService = inject(AuthService);
  private ticketApi = inject(TicketApiService);
  private agentApi = inject(AgentApiService);
  private loader = inject(LoaderService);

  isAdmin = this.authService.isAdmin;
  
  private route = inject(ActivatedRoute);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadAgents();

    this.route.queryParams.subscribe((params) => {
      if (params['action'] === 'new') {
        this.showCreateTicketDialog = true;
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
  }

  loadTickets(): void {
    this.ticketApi.getTickets({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.tickets = res.data.map(t => this.mapTicketDto(t));
      },
      error: () => {
        this.tickets = this.mockData.getTickets();
      }
    });
  }

  loadAgents(): void {
    this.agentApi.getAgents({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.agents = res.data.map(a => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`.trim(),
          avatar: a.avatar || '',
        }));
      },
      error: () => {
        this.agents = this.mockData.getAgents();
      }
    });
  }

  private mapTicketDto(t: TicketDto): Ticket {
    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      ticketPrefix: t.ticketPrefix || undefined,
      subject: t.subject,
      description: t.description,
      customer: t.customer
        ? { id: t.customer.id, name: t.customer.name, email: t.customer.email, avatar: t.customer.avatar || undefined }
        : { id: '', name: 'Unknown', email: '' },
      type: t.type as Ticket['type'],
      status: t.status.replace('_', '-') as Ticket['status'],
      priority: t.priority as Ticket['priority'],
      assignedAgent: t.assignedAgent
        ? { id: t.assignedAgent.id, name: `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}`.trim(), avatar: t.assignedAgent.avatar || '' }
        : undefined,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      tags: t.tags,
      eta: t.eta || 0,
      firstResponseDue: t.firstResponseDue ? new Date(t.firstResponseDue) : new Date(),
      resolutionDue: t.resolutionDue ? new Date(t.resolutionDue) : new Date(),
      firstResponseAt: t.firstResponseAt ? new Date(t.firstResponseAt) : undefined,
      resolvedAt: t.resolvedAt ? new Date(t.resolvedAt) : undefined,
      channel: t.channel as Ticket['channel'],
    };
  }

  searchQuery = '';
  selectedStatus: string | null = null;
  selectedPriority: string | null = null;
  
  // View mode
  viewMode: 'list' | 'card' | 'kanban' = 'list';
  
  viewOptions: { value: 'list' | 'card' | 'kanban'; icon: string; tooltip: string }[] = [
    { value: 'list', icon: 'pi pi-list', tooltip: 'List view' },
    { value: 'card', icon: 'pi pi-th-large', tooltip: 'Card view' },
    { value: 'kanban', icon: 'pi pi-objects-column', tooltip: 'Kanban view' },
  ];
  
  // Kanban statuses in workflow order
  kanbanStatuses = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];
  
  getTicketsByStatus(status: string): Ticket[] {
    return this.filteredTickets.filter(ticket => ticket.status === status);
  }

  // Kanban drag-and-drop
  draggedTicket: Ticket | null = null;
  dragOverColumn: string | null = null;

  onKanbanDragStart(ticket: Ticket) {
    this.draggedTicket = ticket;
  }

  onKanbanDragEnd() {
    this.draggedTicket = null;
    this.dragOverColumn = null;
  }

  onKanbanDragEnter(status: string) {
    this.dragOverColumn = status;
  }

  onKanbanDragLeave() {
    this.dragOverColumn = null;
  }

  onKanbanDrop(targetStatus: string) {
    this.dragOverColumn = null;
    if (!this.draggedTicket || this.draggedTicket.status === targetStatus) {
      this.draggedTicket = null;
      return;
    }

    const ticket = this.draggedTicket;
    const previousStatus = ticket.status;
    this.draggedTicket = null;

    // Optimistic update
    ticket.status = targetStatus as Ticket['status'];
    ticket.updatedAt = new Date();

    // Send to backend (convert hyphens to underscores for API)
    const apiStatus = targetStatus.replace('-', '_');
    this.ticketApi.updateTicket(ticket.ticketNumber, { status: apiStatus }).subscribe({
      next: () => {
        this.toast.success('Status Updated', `${ticket.ticketPrefix || 'TKT'}-${ticket.ticketNumber} moved to ${this.formatStatus(targetStatus)}`);
      },
      error: () => {
        // Rollback on failure
        ticket.status = previousStatus;
        this.toast.error('Update Failed', 'Could not update ticket status. Please try again.');
      }
    });
  }
  
  // Selected tickets for bulk actions
  selectedTickets: Ticket[] = [];
  
  // Create ticket dialog
  showCreateTicketDialog = false;
  
  // Quick filter
  activeQuickFilter: string | null = null;
  
  // Current user from auth service
  get currentUser() {
    const user = this.authService.currentUser();
    return user ? { id: user.id, name: user.name, avatar: user.avatar } : { id: '', name: '', avatar: '' };
  }
  
  quickFilterOptions = [
    { id: 'assigned-to-me', label: 'Assigned to me', icon: 'pi pi-user' },
    { id: 'open-assigned-to-me', label: 'Open & Assigned to me', icon: 'pi pi-inbox' },
    { id: 'last-24h', label: 'Last 24 hours', icon: 'pi pi-clock' },
    { id: 'awaiting-response', label: 'Awaiting first response', icon: 'pi pi-comments' },
    { id: 'unassigned', label: 'Unassigned', icon: 'pi pi-user-minus' },
    { id: 'high-priority', label: 'High & Urgent', icon: 'pi pi-exclamation-triangle' },
  ];
  
  // Advanced filter sidebar
  filterSidebarVisible = false;
  
  // Advanced filter values
  advancedFilters = {
    statuses: [] as string[],
    priorities: [] as string[],
    assignedAgents: [] as string[],
    showUnassigned: false,
    createdDateRange: null as Date[] | null,
    updatedDateRange: null as Date[] | null,
    customerName: '',
  };
  
  // For agent assignment
  editingTicketId: string | null = null;

  // Available agents (loaded from service)
  agents: Agent[] = [];

  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ];

  priorityOptions = [
    { label: 'All Priority', value: null, icon: null, color: null },
    { label: 'Low', value: 'low', icon: 'pi pi-angle-down', color: 'text-blue-500' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus', color: 'text-yellow-500' },
    { label: 'High', value: 'high', icon: 'pi pi-angle-up', color: 'text-orange-500' },
    { label: 'Urgent', value: 'urgent', icon: 'pi pi-angle-double-up', color: 'text-red-600' },
  ];

  // Multi-select options for advanced filters
  statusMultiOptions = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ];

  priorityMultiOptions = [
    { label: 'Low', value: 'low', icon: 'pi pi-angle-down', color: 'text-blue-500' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus', color: 'text-yellow-500' },
    { label: 'High', value: 'high', icon: 'pi pi-angle-up', color: 'text-orange-500' },
    { label: 'Urgent', value: 'urgent', icon: 'pi pi-angle-double-up', color: 'text-red-600' },
  ];

  // Sort order maps for workflow-based sorting
  statusSortOrder: Record<string, number> = {
    'open': 1,
    'in-progress': 2,
    'waiting': 3,
    'resolved': 4,
    'closed': 5,
  };

  prioritySortOrder: Record<string, number> = {
    'urgent': 1,
    'high': 2,
    'medium': 3,
    'low': 4,
  };

  // Custom sort function for workflow-based sorting
  customSort(event: { field: string; data: Ticket[]; order: number }) {
    event.data.sort((a: Ticket, b: Ticket) => {
      let result = 0;
      const field = event.field as keyof Ticket;
      
      if (field === 'status') {
        const orderA = this.statusSortOrder[a.status] ?? 99;
        const orderB = this.statusSortOrder[b.status] ?? 99;
        result = orderA - orderB;
      } else if (field === 'priority') {
        const orderA = this.prioritySortOrder[a.priority] ?? 99;
        const orderB = this.prioritySortOrder[b.priority] ?? 99;
        result = orderA - orderB;
      } else if (field === 'createdAt' || field === 'updatedAt') {
        const dateA = new Date(a[field]).getTime();
        const dateB = new Date(b[field]).getTime();
        result = dateA - dateB;
      } else {
        const valueA = a[field];
        const valueB = b[field];
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          result = valueA.localeCompare(valueB);
        } else if (valueA == null && valueB != null) {
          result = -1;
        } else if (valueA != null && valueB == null) {
          result = 1;
        } else if (valueA != null && valueB != null) {
          result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        }
      }
      
      return event.order * result;
    });
  }

  // Tickets (loaded from service)
  tickets: Ticket[] = [];

  get filteredTickets(): Ticket[] {
    return this.tickets.filter((ticket) => {
      // Quick filter check first
      if (this.activeQuickFilter && !this.matchesQuickFilter(ticket)) {
        return false;
      }

      const matchesSearch =
        !this.searchQuery ||
        ticket.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toString().includes(this.searchQuery) ||
        ticket.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = !this.selectedStatus || ticket.status === this.selectedStatus;
      const matchesPriority = !this.selectedPriority || ticket.priority === this.selectedPriority;

      // Advanced filters
      const af = this.advancedFilters;
      
      const matchesAdvancedStatus = af.statuses.length === 0 || af.statuses.includes(ticket.status);
      const matchesAdvancedPriority = af.priorities.length === 0 || af.priorities.includes(ticket.priority);
      
      const matchesAgent = 
        (af.assignedAgents.length === 0 && !af.showUnassigned) ||
        (af.showUnassigned && !ticket.assignedAgent) ||
        (ticket.assignedAgent && af.assignedAgents.includes(ticket.assignedAgent.name));
      
      const matchesCreatedFrom = !af.createdDateRange?.[0] || ticket.createdAt >= af.createdDateRange[0];
      const matchesCreatedTo = !af.createdDateRange?.[1] || ticket.createdAt <= this.endOfDay(af.createdDateRange[1]);
      const matchesUpdatedFrom = !af.updatedDateRange?.[0] || ticket.updatedAt >= af.updatedDateRange[0];
      const matchesUpdatedTo = !af.updatedDateRange?.[1] || ticket.updatedAt <= this.endOfDay(af.updatedDateRange[1]);
      
      const matchesCustomer = !af.customerName || 
        ticket.customer.name.toLowerCase().includes(af.customerName.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(af.customerName.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && 
        matchesAdvancedStatus && matchesAdvancedPriority && matchesAgent &&
        matchesCreatedFrom && matchesCreatedTo && matchesUpdatedFrom && matchesUpdatedTo &&
        matchesCustomer;
    });
  }

  private endOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  private matchesQuickFilter(ticket: Ticket): boolean {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    switch (this.activeQuickFilter) {
      case 'assigned-to-me':
        return ticket.assignedAgent?.name === this.currentUser.name;
      case 'open-assigned-to-me':
        return ticket.status === 'open' && ticket.assignedAgent?.name === this.currentUser.name;
      case 'last-24h':
        return ticket.createdAt >= twentyFourHoursAgo;
      case 'awaiting-response':
        // Tickets that are open and have no agent response yet (createdAt === updatedAt)
        return (ticket.status === 'open' || ticket.status === 'waiting') && 
               ticket.createdAt.getTime() === ticket.updatedAt.getTime();
      case 'unassigned':
        return !ticket.assignedAgent;
      case 'high-priority':
        return ticket.priority === 'high' || ticket.priority === 'urgent';
      default:
        return true;
    }
  }

  selectQuickFilter(filterId: string) {
    if (this.activeQuickFilter === filterId) {
      this.activeQuickFilter = null;
    } else {
      this.activeQuickFilter = filterId;
    }
  }

  clearQuickFilter() {
    this.activeQuickFilter = null;
  }

  get hasAdvancedFilters(): boolean {
    const af = this.advancedFilters;
    return af.statuses.length > 0 || 
      af.priorities.length > 0 || 
      af.assignedAgents.length > 0 ||
      af.showUnassigned ||
      (af.createdDateRange !== null && af.createdDateRange.length > 0) ||
      (af.updatedDateRange !== null && af.updatedDateRange.length > 0) ||
      af.customerName !== '';
  }

  get activeFilterCount(): number {
    let count = 0;
    const af = this.advancedFilters;
    if (af.statuses.length > 0) count++;
    if (af.priorities.length > 0) count++;
    if (af.assignedAgents.length > 0 || af.showUnassigned) count++;
    if (af.createdDateRange && af.createdDateRange.length > 0) count++;
    if (af.updatedDateRange && af.updatedDateRange.length > 0) count++;
    if (af.customerName) count++;
    return count;
  }

  openFilterSidebar() {
    this.filterSidebarVisible = true;
  }

  applyAdvancedFilters() {
    this.filterSidebarVisible = false;
  }

  clearAdvancedFilters() {
    this.advancedFilters = {
      statuses: [],
      priorities: [],
      assignedAgents: [],
      showUnassigned: false,
      createdDateRange: null,
      updatedDateRange: null,
      customerName: '',
    };
  }

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<string, 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast'> = {
      open: 'info',
      'in-progress': 'warn',
      waiting: 'warn',
      resolved: 'success',
      closed: 'secondary',
    };
    return severityMap[status] || 'info';
  }

  getPrioritySeverity(priority: string): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<string, 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warn',
      urgent: 'danger',
    };
    return severityMap[priority] || 'info';
  }

  formatStatus(status: string): string {
    return status
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = null;
    this.selectedPriority = null;
  }

  // Agent assignment methods
  pendingAgent: Agent | null = null;
  editingTicket: Ticket | null = null;

  startEditingAgent(ticket: Ticket) {
    this.editingTicketId = ticket.id;
    this.editingTicket = ticket;
    // Pre-select current agent if exists
    this.pendingAgent = ticket.assignedAgent 
      ? this.agents.find(a => a.name === ticket.assignedAgent?.name) || null 
      : null;
  }

  cancelEditingAgent() {
    this.editingTicketId = null;
    this.editingTicket = null;
    this.pendingAgent = null;
  }

  selectPendingAgent(agent: Agent | null) {
    this.pendingAgent = agent;
  }

  confirmAgentAssignment() {
    if (this.editingTicket) {
      const ticketId = this.editingTicket.id;
      if (this.pendingAgent) {
        this.editingTicket.assignedAgent = { 
          id: this.pendingAgent.id,
          name: this.pendingAgent.name, 
          avatar: this.pendingAgent.avatar 
        };
        this.toast.success('Agent Assigned', `${this.pendingAgent.name} assigned to ${ticketId}`);
      } else {
        this.editingTicket.assignedAgent = undefined;
        this.toast.info('Agent Removed', `${ticketId} is now unassigned`);
      }
      this.editingTicket.updatedAt = new Date();
    }
    this.cancelEditingAgent();
  }

  isEditingAgent(ticketId: string): boolean {
    return this.editingTicketId === ticketId;
  }

  viewTicket(ticketNumber: number) {
    this.router.navigate(['/tickets', ticketNumber]);
  }

  onTicketCreated(ticket: any) {
    this.loadTickets();
    this.router.navigate(['/tickets', ticket.ticketNumber]);
  }

  // Bulk action methods
  clearSelection() {
    this.selectedTickets = [];
  }

  exportSelectedTickets() {
    const ticketIds = this.selectedTickets.map(t => t.id).join(', ');
    this.toast.success('Export Started', `Exporting ${this.selectedTickets.length} tickets: ${ticketIds}`);
    // In real app, implement CSV/Excel export logic here
    this.clearSelection();
  }

  bulkDeleteTickets() {
    const count = this.selectedTickets.length;
    const ticketIds = this.selectedTickets.map(t => t.id);
    
    // Remove selected tickets from the list
    this.tickets = this.tickets.filter(t => !ticketIds.includes(t.id));
    
    this.toast.success('Tickets Deleted', `${count} ticket(s) have been deleted`);
    this.clearSelection();
  }

  bulkResolveTickets() {
    const count = this.selectedTickets.length;
    
    // Update status of selected tickets to resolved
    this.selectedTickets.forEach(ticket => {
      ticket.status = 'resolved';
      ticket.updatedAt = new Date();
    });
    
    this.toast.success('Tickets Resolved', `${count} ticket(s) have been marked as resolved`);
    this.clearSelection();
  }
}
