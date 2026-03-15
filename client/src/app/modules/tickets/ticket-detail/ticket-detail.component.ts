import { Component, OnInit, OnDestroy, signal, computed, inject, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextarea } from 'primeng/inputtextarea';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { MenuModule, Menu } from 'primeng/menu';
import { EditorModule } from 'primeng/editor';
import { MenuItem } from 'primeng/api';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderService } from '../../../core/services/loader.service';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { ConfirmDialogService, ChangeItem } from '../../../core/services/confirm-dialog.service';
import { MockDataService, Agent, Message, Ticket, HistoryEntry, CannedResponse, CannedResponseCategory } from '../../../core/services/mock-data.service';
import { AuthService } from '../../../core/services/auth.service';
import { TicketApiService, UpdateTicketPayload } from '../../../core/services/ticket-api.service';
import { AgentApiService } from '../../../core/services/agent-api.service';
import { KeyboardShortcutService } from '../../../core/services/keyboard-shortcut.service';
import { SocketService, SocketMessage } from '../../../core/services/socket.service';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    TooltipModule,
    InputTextarea,
    SelectModule,
    DividerModule,
    TabsModule,
    BadgeModule,
    MenuModule,
    EditorModule,
    MultiSelectModule,
    DialogModule,
    InputTextModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    DrawerModule,
  ],
  templateUrl: './ticket-detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  private toast = inject(ToastService);
  private loader = inject(LoaderService);
  private confirmDialog = inject(ConfirmDialogService);
  private mockData = inject(MockDataService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private ticketApi = inject(TicketApiService);
  private agentApi = inject(AgentApiService);
  private shortcutService = inject(KeyboardShortcutService);
  private socketService = inject(SocketService);
  private contextSub!: Subscription;
  private socketSub!: Subscription;

  isAdmin = this.authService.isAdmin;

  // Sanitize HTML while allowing inline styles from rich text editor
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
  ticketId = signal<string>('');
  activeTab = signal<number>(0);
  replyContent = '';
  isInternalNote = false;
  isEditingDescription = signal(false);

  // Clear reply confirmation
  showClearConfirm = signal(false);

  // Canned responses / Template picker
  showTemplatePickerPanel = false;
  templateSearchQuery = '';
  cannedResponses = signal<CannedResponse[]>([]);
  cannedResponseCategories = signal<CannedResponseCategory[]>([]);
  selectedTemplateCategory = signal<string | null>(null);

  // Shortcut autocomplete
  showShortcutSuggestions = signal(false);
  currentShortcut = signal('');
  selectedSuggestionIndex = signal(0);

  shortcutSuggestions = computed(() => {
    const shortcut = this.currentShortcut().toLowerCase();
    if (!shortcut || !shortcut.startsWith('/')) return [];

    return this.cannedResponses().filter(
      t => t.shortcut.toLowerCase().startsWith(shortcut)
    ).slice(0, 6); // Limit to 6 suggestions
  });

  filteredTemplates = computed(() => {
    let templates = this.cannedResponses();
    const query = this.templateSearchQuery.toLowerCase();
    const category = this.selectedTemplateCategory();

    if (query) {
      templates = templates.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.shortcut.toLowerCase().includes(query)
      );
    }

    if (category) {
      templates = templates.filter(t => t.categoryId === category);
    }

    return templates;
  });

  // Pending changes tracking
  pendingStatus = signal<string | null>(null);
  pendingPriority = signal<string | null>(null);
  pendingType = signal<string | null>(null);
  pendingAgent = signal<Agent | null | undefined>(undefined);
  pendingFollowers = signal<Agent[] | undefined>(undefined);
  pendingDescription = signal<string | null>(null);
  private originalStatus = '';
  private originalPriority = '';
  private originalType = '';
  private originalAgentId: string | undefined = undefined;
  private originalFollowerIds: string[] = [];
  private originalDescription = '';

  // Data (loaded from service)
  ticket = signal<Ticket | null>(null);
  messages = signal<Message[]>([]);
  agents: Agent[] = [];
  allTickets = signal<Ticket[]>([]);
  
  // Ticket navigation drawer
  showTicketDrawer = signal(false);
  ticketSearchQuery = signal('');
  
  // Filtered tickets for drawer
  filteredDrawerTickets = computed(() => {
    const query = this.ticketSearchQuery().toLowerCase();
    let tickets = this.allTickets();
    
    if (query) {
      tickets = tickets.filter(t => 
        t.id.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query) ||
        t.customer.name.toLowerCase().includes(query)
      );
    }
    
    return tickets;
  });
  
  // Previous/Next ticket navigation
  currentTicketIndex = computed(() => {
    const current = this.ticket();
    if (!current) return -1;
    return this.allTickets().findIndex(t => t.id === current.id);
  });
  
  previousTicket = computed(() => {
    const index = this.currentTicketIndex();
    const tickets = this.allTickets();
    if (index <= 0) return null;
    return tickets[index - 1];
  });
  
  nextTicket = computed(() => {
    const index = this.currentTicketIndex();
    const tickets = this.allTickets();
    if (index < 0 || index >= tickets.length - 1) return null;
    return tickets[index + 1];
  });
  
  ticketNavInfo = computed(() => {
    const index = this.currentTicketIndex();
    const total = this.allTickets().length;
    if (index < 0) return '';
    return `${index + 1} of ${total}`;
  });

  statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Waiting', value: 'waiting' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' },
  ];

  workflowSteps = [
    { label: 'Open', value: 'open', icon: 'pi pi-inbox' },
    { label: 'In Progress', value: 'in-progress', icon: 'pi pi-spin pi-cog' },
    { label: 'Waiting', value: 'waiting', icon: 'pi pi-clock' },
    { label: 'Resolved', value: 'resolved', icon: 'pi pi-check-circle' },
    { label: 'Closed', value: 'closed', icon: 'pi pi-lock' },
  ];

  currentStepIndex = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return 0;
    const currentStatus = this.pendingStatus() ?? ticket.status;
    return this.workflowSteps.findIndex(s => s.value === currentStatus);
  });

  priorityOptions = [
    { label: 'Low', value: 'low', icon: 'pi pi-angle-down', color: 'text-blue-500' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus', color: 'text-yellow-500' },
    { label: 'High', value: 'high', icon: 'pi pi-angle-up', color: 'text-orange-500' },
    { label: 'Urgent', value: 'urgent', icon: 'pi pi-angle-double-up', color: 'text-red-600' },
  ];

  typeOptions = [
    { label: 'Incident', value: 'incident', icon: 'pi pi-exclamation-circle', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Issue', value: 'issue', icon: 'pi pi-exclamation-triangle', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Bug', value: 'bug', icon: 'pi pi-bug', color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Request', value: 'request', icon: 'pi pi-inbox', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Question', value: 'question', icon: 'pi pi-question-circle', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Task', value: 'task', icon: 'pi pi-check-square', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Feature Request', value: 'feature-request', icon: 'pi pi-star', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ];

  ticketType = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return this.typeOptions[0];
    const currentType = this.pendingType() ?? ticket.type;
    return this.typeOptions.find(t => t.value === currentType) || this.typeOptions[0];
  });

  updateType(type: string) {
    this.pendingType.set(type);
  }

  // More actions menu
  @ViewChild('moreMenu') moreMenu!: Menu;
  
  moreMenuItems: MenuItem[] = [];

  private buildMoreMenuItems(): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Actions',
        items: [
          {
            label: 'Refresh',
            icon: 'pi pi-refresh',
            command: () => this.refreshTicket()
          },
          {
            label: 'Duplicate',
            icon: 'pi pi-copy',
            command: () => this.duplicateTicket()
          },
          {
            label: 'Print',
            icon: 'pi pi-print',
            command: () => this.printTicket()
          },
          {
            label: 'Export as PDF',
            icon: 'pi pi-file-pdf',
            command: () => this.exportAsPdf()
          }
        ]
      }
    ];

    if (this.authService.isAdmin()) {
      items.push(
        {
          label: 'Moderation',
          items: [
            {
              label: 'Mark as Spam',
              icon: 'pi pi-ban',
              command: () => this.markAsSpam()
            },
            {
              label: 'Merge with Another Ticket',
              icon: 'pi pi-link',
              command: () => this.mergeTicket()
            },
            {
              label: 'Split Conversation',
              icon: 'pi pi-arrows-h',
              command: () => this.splitConversation()
            }
          ]
        },
        {
          label: 'Danger Zone',
          items: [
            {
              label: 'Delete Ticket',
              icon: 'pi pi-trash',
              styleClass: 'menu-item-danger',
              command: () => {
                this.deleteTicket();
              }
            }
          ]
        }
      );
    }

    return items;
  }

  publicMessages = computed(() => this.messages().filter(m => !m.isInternal));
  internalNotes = computed(() => this.messages().filter(m => m.isInternal));
  eta = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return '0 hours';
    const baseEta = ticket.eta;
    // if eta greater than 24 hrs, show in days
    if (baseEta > 24) {
      return `${Math.ceil(baseEta / 24)} days`;
    }
    return `${baseEta} hours`;
  });

  // SLA computed properties
  firstResponseStatus = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return { status: 'pending', label: 'Pending', time: new Date() };
    if (ticket.firstResponseAt) {
      // First response was sent - show how long it took
      const wasOnTime = ticket.firstResponseAt <= ticket.firstResponseDue;
      const timeTaken = ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
      const timeTakenLabel = this.formatDuration(timeTaken);
      return {
        status: wasOnTime ? 'met' : 'breached',
        label: wasOnTime ? `Met (${timeTakenLabel})` : `Breached (${timeTakenLabel})`,
        time: ticket.firstResponseAt,
      };
    }
    // First response not yet sent
    const now = new Date();
    const timeLeft = ticket.firstResponseDue.getTime() - now.getTime();
    if (timeLeft < 0) {
      return { status: 'breached', label: `Overdue ${this.formatDuration(Math.abs(timeLeft))}`, time: ticket.firstResponseDue };
    }
    if (timeLeft < 30 * 60 * 1000) { // Less than 30 minutes
      return { status: 'warning', label: this.formatTimeRemaining(timeLeft), time: ticket.firstResponseDue };
    }
    return { status: 'pending', label: this.formatTimeRemaining(timeLeft), time: ticket.firstResponseDue };
  });

  resolutionStatus = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return { status: 'pending', label: 'Pending', time: new Date() };
    if (ticket.resolvedAt) {
      // Ticket was resolved - show how long it took
      const wasOnTime = ticket.resolvedAt <= ticket.resolutionDue;
      const timeTaken = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      const timeTakenLabel = this.formatDuration(timeTaken);
      return {
        status: wasOnTime ? 'met' : 'breached',
        label: wasOnTime ? `Met (${timeTakenLabel})` : `Breached (${timeTakenLabel})`,
        time: ticket.resolvedAt,
      };
    }
    // Not yet resolved
    const now = new Date();
    const timeLeft = ticket.resolutionDue.getTime() - now.getTime();
    if (timeLeft < 0) {
      return { status: 'breached', label: `Overdue ${this.formatDuration(Math.abs(timeLeft))}`, time: ticket.resolutionDue };
    }
    if (timeLeft < 60 * 60 * 1000) { // Less than 1 hour
      return { status: 'warning', label: this.formatTimeRemaining(timeLeft), time: ticket.resolutionDue };
    }
    return { status: 'pending', label: this.formatTimeRemaining(timeLeft), time: ticket.resolutionDue };
  });

  channelIcon = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return 'pi pi-inbox';
    const channelMap: Record<string, string> = {
      'email': 'pi pi-envelope',
      'chat': 'pi pi-comments',
      'phone': 'pi pi-phone',
      'portal': 'pi pi-globe',
    };
    return channelMap[ticket.channel] || 'pi pi-inbox';
  });

  channelLabel = computed(() => {
    const ticket = this.ticket();
    if (!ticket) return 'Unknown';
    return ticket.channel.charAt(0).toUpperCase() + ticket.channel.slice(1);
  });

  formatTimeRemaining(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      return `${Math.ceil(hours / 24)}d left`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  }

  formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  // Activity history (lazy loaded)
  history = signal<HistoryEntry[]>([]);
  historyLoaded = signal(false);
  historyLoading = signal(false);
  activeHistoryPanel = signal<string[]>([]);

  onHistoryAccordionChange(value: string[] | undefined | null): void {
    const safeValue = value ?? [];
    this.activeHistoryPanel.set(safeValue);
    if (safeValue.length > 0) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (this.historyLoaded()) return;
    
    this.historyLoading.set(true);
    
    // History is already loaded from the ticket detail API call
    // Just mark as loaded
    this.historyLoading.set(false);
    this.historyLoaded.set(true);
  }

  getHistoryIcon(type: string): string {
    const icons: Record<string, string> = {
      created: 'pi pi-plus-circle',
      status_changed: 'pi pi-sync',
      priority_changed: 'pi pi-flag',
      assigned: 'pi pi-user-plus',
      reply: 'pi pi-reply',
      note: 'pi pi-file-edit',
      updated: 'pi pi-pencil',
    };
    return icons[type] || 'pi pi-circle';
  }

  getHistoryColor(type: string): string {
    const colors: Record<string, string> = {
      created: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      status_changed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      priority_changed: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      assigned: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      reply: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      note: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      updated: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  }

  // Check if there are unsaved changes
  hasUnsavedChanges(): boolean {
    const ticket = this.ticket();
    if (!ticket) return false;
    const currentStatus = this.pendingStatus() ?? ticket.status;
    const currentPriority = this.pendingPriority() ?? ticket.priority;
    const currentType = this.pendingType() ?? ticket.type;
    const currentAgentId = this.pendingAgent() !== undefined 
      ? this.pendingAgent()?.id 
      : ticket.assignedAgent?.id;
    const currentFollowerIds = this.pendingFollowers() !== undefined
      ? (this.pendingFollowers() || []).map(f => f.id).sort().join(',')
      : this.originalFollowerIds.sort().join(',');
    const currentDescription = this.pendingDescription() ?? ticket.description;
    
    return currentStatus !== this.originalStatus ||
           currentPriority !== this.originalPriority ||
           currentType !== this.originalType ||
           currentAgentId !== this.originalAgentId ||
           currentFollowerIds !== this.originalFollowerIds.sort().join(',') ||
           currentDescription !== this.originalDescription;
  }

  // Listen for beforeunload to warn about unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      $event.preventDefault();
      $event.returnValue = '';
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Build menu items based on role
    this.moreMenuItems = this.buildMoreMenuItems();

    // Listen for context keyboard shortcuts (B T = browse tickets)
    this.contextSub = this.shortcutService.contextAction$.subscribe((action) => {
      if (action === 'browse-tickets') {
        this.toggleTicketDrawer();
      }
    });

    // Load agents from API
    this.agentApi.getAgents({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.agents = res.data.map(a => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`.trim(),
          avatar: a.avatar || '',
        }));
      },
      error: () => {
        this.toast.error('Error', 'Failed to load agents');
      }
    });
    
    // Load all tickets for navigation
    this.ticketApi.getTickets({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.allTickets.set(res.data.map(t => this.mapApiTicket(t)));
      },
      error: () => {
        this.toast.error('Error', 'Failed to load tickets for navigation');
      }
    });

    // Load canned responses (still mock for now)
    this.cannedResponseCategories.set(this.mockData.getCannedResponseCategories());
    this.cannedResponses.set(this.mockData.getCannedResponses());
    
    // Connect Socket.IO and listen for real-time messages
    this.socketService.connect();
    this.socketSub = this.socketService.message$.subscribe((msg: SocketMessage) => {
      this.messages.update(msgs => [...msgs, this.mapSocketMessage(msg)]);
    });

    this.route.params.subscribe(params => {
      this.ticketId.set(params['ticketNumber']);
      const ticketNum = parseInt(params['ticketNumber'], 10);
      this.socketService.joinTicket(ticketNum);
      this.loadTicketDetail(ticketNum);
    });
  }

  private loadTicketDetail(ticketNumber: number) {
    this.ticketApi.getTicketByNumber(ticketNumber).subscribe({
      next: (data: any) => {
        const ticket = this.mapApiTicketDetail(data);
        this.ticket.set(ticket);
        this.messages.set(this.mapApiMessages(data));
        this.history.set(this.mapApiHistory(data));
        this.historyLoaded.set(data.history?.length > 0);

        // Store original values for change detection
        this.originalStatus = ticket.status;
        this.originalPriority = ticket.priority;
        this.originalType = ticket.type;
        this.originalAgentId = ticket.assignedAgent?.id;
        this.originalFollowerIds = (ticket.followers || []).map((f: Agent) => f.id);
        this.originalDescription = ticket.description;
      },
      error: () => {
        this.toast.error('Error', 'Failed to load ticket details');
      }
    });
  }

  private mapApiTicket(t: any): Ticket {
    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      ticketPrefix: t.ticketPrefix || t.workspace?.ticketPrefix || undefined,
      subject: t.subject,
      description: t.description,
      customer: t.customer
        ? { id: t.customer.id, name: t.customer.name, email: t.customer.email, avatar: t.customer.avatar || undefined }
        : { id: '', name: 'Unknown', email: '' },
      type: (t.type === 'feature_request' ? 'feature-request' : t.type) as Ticket['type'],
      status: t.status.replace('_', '-') as Ticket['status'],
      priority: t.priority as Ticket['priority'],
      assignedAgent: t.assignedAgent
        ? { id: t.assignedAgent.id, name: `${t.assignedAgent.firstName} ${t.assignedAgent.lastName}`.trim(), avatar: t.assignedAgent.avatar || '' }
        : undefined,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      tags: Array.isArray(t.tags) ? t.tags.map((tag: any) => typeof tag === 'string' ? tag : tag.tag?.name || tag.name) : [],
      eta: t.eta || 0,
      firstResponseDue: t.firstResponseDue ? new Date(t.firstResponseDue) : new Date(),
      resolutionDue: t.resolutionDue ? new Date(t.resolutionDue) : new Date(),
      firstResponseAt: t.firstResponseAt ? new Date(t.firstResponseAt) : undefined,
      resolvedAt: t.resolvedAt ? new Date(t.resolvedAt) : undefined,
      channel: t.channel as Ticket['channel'],
    };
  }

  private mapApiTicketDetail(data: any): Ticket {
    const ticket = this.mapApiTicket(data);
    if (data.followers?.length) {
      ticket.followers = data.followers.map((f: any) => ({
        id: f.user.id,
        name: `${f.user.firstName} ${f.user.lastName}`.trim(),
        avatar: f.user.avatar || '',
      }));
    }
    return ticket;
  }

  private mapApiMessages(data: any): Message[] {
    if (!data.messages?.length) return [];
    return data.messages.map((m: any) => {
      let authorName = 'System';
      let authorAvatar: string | undefined;
      let authorType: 'customer' | 'agent' | 'system' = 'system';

      if (m.authorType === 'agent' && m.user) {
        authorName = `${m.user.firstName} ${m.user.lastName}`.trim();
        authorAvatar = m.user.avatar || undefined;
        authorType = 'agent';
      } else if (m.authorType === 'customer' && m.customer) {
        authorName = m.customer.name;
        authorAvatar = m.customer.avatar || undefined;
        authorType = 'customer';
      }

      return {
        id: m.id,
        ticketId: m.ticketId,
        ticketNumber: data.ticketNumber,
        content: m.content,
        createdAt: new Date(m.createdAt),
        author: { name: authorName, avatar: authorAvatar, type: authorType },
        isInternal: m.isInternal || false,
      } as Message;
    });
  }

  private mapApiHistory(data: any): HistoryEntry[] {
    if (!data.history?.length) return [];
    return data.history.map((h: any) => ({
      id: h.id,
      ticketId: h.ticketId,
      ticketNumber: data.ticketNumber,
      type: h.type,
      description: h.description,
      user: h.user
        ? { name: `${h.user.firstName} ${h.user.lastName}`.trim(), avatar: h.user.avatar || undefined }
        : { name: 'System' },
      timestamp: new Date(h.timestamp),
      details: h.fromValue || h.toValue
        ? { from: h.fromValue || undefined, to: h.toValue || undefined }
        : undefined,
    } as HistoryEntry));
  }

  goBack() {
    this.router.navigate(['/tickets']);
  }

  navigateToPreviousTicket() {
    const prev = this.previousTicket();
    if (prev) {
      this.router.navigate(['/tickets', prev.ticketNumber]);
    }
  }

  navigateToNextTicket() {
    const next = this.nextTicket();
    if (next) {
      this.router.navigate(['/tickets', next.ticketNumber]);
    }
  }

  navigateToTicket(ticketNumber: number) {
    this.showTicketDrawer.set(false);
    this.router.navigate(['/tickets', ticketNumber]);
  }

  ngOnDestroy() {
    this.contextSub?.unsubscribe();
    this.socketSub?.unsubscribe();
    const ticketNum = parseInt(this.ticketId(), 10);
    if (!isNaN(ticketNum)) {
      this.socketService.leaveTicket(ticketNum);
    }
  }

  toggleTicketDrawer() {
    this.showTicketDrawer.update(v => !v);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'waiting': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  }

  sendReply() {
    if (!this.replyContent.trim()) return;

    const isInternal = this.isInternalNote;
    this.loader.show('primary', { text: isInternal ? 'Adding note...' : 'Sending reply...' });

    const content = this.replyContent;
    const ticketNumber = parseInt(this.ticketId(), 10);

    this.ticketApi.sendMessage(ticketNumber, {
      content,
      isInternal,
    }).subscribe({
      next: () => {
        // Message will be added via Socket.IO broadcast
        this.replyContent = '';
        this.isInternalNote = false;
        this.loader.hide();
        this.toast.success(
          isInternal ? 'Note Added' : 'Reply Sent',
          isInternal ? 'Internal note added to ticket' : 'Your reply has been sent to the customer'
        );
      },
      error: () => {
        this.loader.hide();
        this.toast.error('Error', 'Failed to send message. Please try again.');
      },
    });
  }

  private mapSocketMessage(msg: any): Message {
    let authorName = 'System';
    let authorAvatar: string | undefined;
    let authorType: 'customer' | 'agent' | 'system' = 'system';

    if (msg.authorType === 'agent' && msg.user) {
      authorName = `${msg.user.firstName} ${msg.user.lastName}`.trim();
      authorAvatar = msg.user.avatar || undefined;
      authorType = 'agent';
    } else if (msg.authorType === 'customer' && msg.customer) {
      authorName = msg.customer.name;
      authorAvatar = msg.customer.avatar || undefined;
      authorType = 'customer';
    }

    return {
      id: msg.id,
      ticketId: msg.ticketId,
      ticketNumber: this.ticket()?.ticketNumber || 0,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
      author: { name: authorName, avatar: authorAvatar, type: authorType },
      isInternal: msg.isInternal || false,
    } as Message;
  }

  confirmClear() {
    this.replyContent = '';
    this.showClearConfirm.set(false);
  }

  insertTemplate(template: CannedResponse) {
    const ticket = this.ticket();
    if (!ticket) return;

    // Replace placeholders with actual values
    let content = template.content;
    content = content.replace(/\{\{customer_name\}\}/g, ticket.customer.name);
    content = content.replace(/\{\{agent_name\}\}/g, ticket.assignedAgent?.name || 'Agent');
    content = content.replace(/\{\{ticket_id\}\}/g, `#${ticket.id}`);
    content = content.replace(/\{\{company_name\}\}/g, 'your company');

    // Strip HTML tags for textarea (simple plain text extraction)
    const div = document.createElement('div');
    div.innerHTML = content;
    const plainText = div.textContent || div.innerText || '';

    // Append to existing content with line break if needed
    if (this.replyContent.trim()) {
      this.replyContent += '\n\n' + plainText;
    } else {
      this.replyContent = plainText;
    }

    this.showTemplatePickerPanel = false;
    this.templateSearchQuery = '';
    this.selectedTemplateCategory.set(null);

    this.toast.info('Template Inserted', `"${template.title}" has been inserted.`);
  }

  getCategoryColor(categoryId: string): string {
    return this.cannedResponseCategories().find(c => c.id === categoryId)?.color || '#6b7280';
  }

  getCategoryIcon(categoryId: string): string {
    return this.cannedResponseCategories().find(c => c.id === categoryId)?.icon || 'pi pi-tag';
  }

  // Shortcut detection methods
  onReplyInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Find the word being typed at cursor position
    const textBeforeCursor = value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('/') && currentWord.length >= 1) {
      this.currentShortcut.set(currentWord);
      this.showShortcutSuggestions.set(true);
      this.selectedSuggestionIndex.set(0);
    } else {
      this.showShortcutSuggestions.set(false);
      this.currentShortcut.set('');
    }
  }

  onReplyKeydown(event: KeyboardEvent) {
    if (!this.showShortcutSuggestions()) return;

    const suggestions = this.shortcutSuggestions();
    if (suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestionIndex.update(i => 
        i < suggestions.length - 1 ? i + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestionIndex.update(i => 
        i > 0 ? i - 1 : suggestions.length - 1
      );
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.selectShortcutSuggestion(suggestions[this.selectedSuggestionIndex()]);
    } else if (event.key === 'Escape') {
      this.showShortcutSuggestions.set(false);
    }
  }

  selectShortcutSuggestion(template: CannedResponse) {
    const ticket = this.ticket();
    if (!ticket) return;

    // Replace the shortcut text with the template content
    const shortcut = this.currentShortcut();
    const cursorPos = this.replyContent.lastIndexOf(shortcut);

    // Replace placeholders
    let content = template.content;
    content = content.replace(/\{\{customer_name\}\}/g, ticket.customer.name);
    content = content.replace(/\{\{agent_name\}\}/g, ticket.assignedAgent?.name || 'Agent');
    content = content.replace(/\{\{ticket_id\}\}/g, `#${ticket.id}`);
    content = content.replace(/\{\{company_name\}\}/g, 'your company');

    // Strip HTML
    const div = document.createElement('div');
    div.innerHTML = content;
    const plainText = div.textContent || div.innerText || '';

    // Replace shortcut with template content
    if (cursorPos !== -1) {
      this.replyContent = 
        this.replyContent.substring(0, cursorPos) + 
        plainText + 
        this.replyContent.substring(cursorPos + shortcut.length);
    }

    this.showShortcutSuggestions.set(false);
    this.currentShortcut.set('');
    this.toast.info('Template Inserted', `"${template.title}" inserted via ${template.shortcut}`);
  }

  updateStatus(status: string) {
    this.pendingStatus.set(status);
  }

  updatePriority(priority: string) {
    this.pendingPriority.set(priority);
  }

  assignAgent(agent: Agent | null) {
    this.pendingAgent.set(agent);
  }

  updateFollowers(followers: Agent[]) {
    this.pendingFollowers.set(followers);
  }

  hasFollowersChanged(): boolean {
    if (this.pendingFollowers() === undefined) return false;
    const currentFollowerIds = (this.pendingFollowers() || []).map(f => f.id).sort().join(',');
    return currentFollowerIds !== this.originalFollowerIds.sort().join(',');
  }

  updateDescription(description: string) {
    this.pendingDescription.set(description);
  }

  startEditingDescription() {
    this.isEditingDescription.set(true);
  }

  cancelDescriptionEdit() {
    this.pendingDescription.set(null);
    this.isEditingDescription.set(false);
  }

  saveDescription() {
    if (this.pendingDescription() === null || this.pendingDescription() === this.originalDescription) {
      this.isEditingDescription.set(false);
      return;
    }

    this.loader.show('primary', { text: 'Saving description...' });

    // Simulate API call
    setTimeout(() => {
      this.ticket.update(t => {
        if (!t) return t;
        return { 
          ...t, 
          description: this.pendingDescription()!,
          updatedAt: new Date()
        };
      });
      this.originalDescription = this.pendingDescription()!;
      this.pendingDescription.set(null);
      this.isEditingDescription.set(false);
      this.loader.hide();
      this.toast.success('Description Saved', 'Ticket description has been updated');
    }, 1000);
  }

  // Collect all pending changes for confirmation
  private collectPendingChanges(): ChangeItem[] {
    const changes: ChangeItem[] = [];
    
    if (this.pendingStatus() !== null && this.pendingStatus() !== this.originalStatus) {
      changes.push({
        field: 'Status',
        from: this.formatStatus(this.originalStatus),
        to: this.formatStatus(this.pendingStatus()!),
      });
    }
    
    if (this.pendingPriority() !== null && this.pendingPriority() !== this.originalPriority) {
      changes.push({
        field: 'Priority',
        from: this.originalPriority.charAt(0).toUpperCase() + this.originalPriority.slice(1),
        to: this.pendingPriority()!.charAt(0).toUpperCase() + this.pendingPriority()!.slice(1),
      });
    }
    
    if (this.pendingType() !== null && this.pendingType() !== this.originalType) {
      const fromType = this.typeOptions.find(t => t.value === this.originalType);
      const toType = this.typeOptions.find(t => t.value === this.pendingType());
      changes.push({
        field: 'Type',
        from: fromType?.label ?? this.originalType,
        to: toType?.label ?? this.pendingType()!,
      });
    }
    
    if (this.pendingAgent() !== undefined) {
      const newAgentId = this.pendingAgent()?.id;
      if (newAgentId !== this.originalAgentId) {
        const currentAgent = this.agents.find(a => a.id === this.originalAgentId);
        changes.push({
          field: 'Assigned To',
          from: currentAgent?.name ?? 'Unassigned',
          to: this.pendingAgent()?.name ?? 'Unassigned',
        });
      }
    }
    
    if (this.pendingFollowers() !== undefined) {
      const currentFollowerIds = (this.pendingFollowers() || []).map(f => f.id).sort().join(',');
      const originalFollowerIdsStr = this.originalFollowerIds.sort().join(',');
      if (currentFollowerIds !== originalFollowerIdsStr) {
        const originalNames = this.originalFollowerIds
          .map(id => this.agents.find(a => a.id === id)?.name)
          .filter(Boolean)
          .join(', ') || 'None';
        const newNames = (this.pendingFollowers() || [])
          .map(f => f.name)
          .join(', ') || 'None';
        changes.push({
          field: 'Followers',
          from: originalNames,
          to: newNames,
        });
      }
    }
    
    if (this.pendingDescription() !== null && this.pendingDescription() !== this.originalDescription) {
      changes.push({
        field: 'Description',
        to: 'Updated',
      });
    }
    
    return changes;
  }

  // Save all pending changes
  async saveAllChanges() {
    if (!this.hasUnsavedChanges()) {
      this.toast.info('No Changes', 'No changes to save');
      return;
    }

    const changes = this.collectPendingChanges();
    
    const confirmed = await this.confirmDialog.confirm({
      title: 'Confirm Changes',
      icon: 'pi pi-pencil',
      iconColor: 'text-blue-500',
      confirmLabel: 'Apply Changes',
      cancelLabel: 'Discard',
      confirmSeverity: 'primary',
      changes,
    });
    
    if (!confirmed) {
      // Reset all pending changes
      this.pendingStatus.set(null);
      this.pendingPriority.set(null);
      this.pendingType.set(null);
      this.pendingAgent.set(undefined);
      this.pendingFollowers.set(undefined);
      this.pendingDescription.set(null);
      this.isEditingDescription.set(false);
      this.toast.info('Changes Discarded', 'Your changes have been discarded');
      return;
    }

    this.loader.show('primary', { text: 'Saving changes...' });

    // Build API payload from pending changes
    const payload: UpdateTicketPayload = {};
    const updateLabels: string[] = [];

    if (this.pendingStatus() !== null && this.pendingStatus() !== this.originalStatus) {
      // Convert frontend status (in-progress) back to backend enum (in_progress)
      payload.status = this.pendingStatus()!.replace('-', '_');
      updateLabels.push(`status to ${this.formatStatus(this.pendingStatus()!)}`);
    }

    if (this.pendingPriority() !== null && this.pendingPriority() !== this.originalPriority) {
      payload.priority = this.pendingPriority()!;
      updateLabels.push(`priority to ${this.pendingPriority()}`);
    }

    if (this.pendingType() !== null && this.pendingType() !== this.originalType) {
      // Convert frontend type (feature-request) back to backend enum (feature_request)
      payload.type = this.pendingType()!.replace('-', '_');
      const typeLabel = this.typeOptions.find(t => t.value === this.pendingType())?.label ?? this.pendingType();
      updateLabels.push(`type to ${typeLabel}`);
    }

    if (this.pendingAgent() !== undefined) {
      const newAgentId = this.pendingAgent()?.id;
      if (newAgentId !== this.originalAgentId) {
        payload.assignedAgentId = newAgentId || null;
        updateLabels.push(this.pendingAgent() ? `assigned to ${this.pendingAgent()!.name}` : 'unassigned');
      }
    }

    if (this.pendingFollowers() !== undefined) {
      const currentFollowerIds = (this.pendingFollowers() || []).map(f => f.id).sort().join(',');
      const originalFollowerIdsStr = this.originalFollowerIds.sort().join(',');
      if (currentFollowerIds !== originalFollowerIdsStr) {
        payload.followerIds = (this.pendingFollowers() || []).map(f => f.id);
        const followerCount = (this.pendingFollowers() || []).length;
        updateLabels.push(followerCount > 0 ? `${followerCount} follower(s)` : 'followers removed');
      }
    }

    if (this.pendingDescription() !== null && this.pendingDescription() !== this.originalDescription) {
      payload.description = this.pendingDescription()!;
      updateLabels.push('description');
    }

    const ticketNumber = parseInt(this.ticketId(), 10);
    this.ticketApi.updateTicket(ticketNumber, payload).subscribe({
      next: (data: any) => {
        // Refresh from server response
        this.ticket.set(this.mapApiTicketDetail(data));
        this.messages.set(this.mapApiMessages(data));
        this.history.set(this.mapApiHistory(data));

        // Update originals from the new ticket state
        const t = this.ticket();
        if (t) {
          this.originalStatus = t.status;
          this.originalPriority = t.priority;
          this.originalType = t.type;
          this.originalAgentId = t.assignedAgent?.id;
          this.originalFollowerIds = (t.followers || []).map(f => f.id);
          this.originalDescription = t.description;
        }

        // Reset pending states
        this.pendingStatus.set(null);
        this.pendingPriority.set(null);
        this.pendingType.set(null);
        this.pendingAgent.set(undefined);
        this.pendingFollowers.set(undefined);
        this.pendingDescription.set(null);
        this.isEditingDescription.set(false);

        this.loader.hide();
        this.toast.success('Ticket Updated', `Updated ${updateLabels.join(', ')}`);
      },
      error: () => {
        this.loader.hide();
        this.toast.error('Error', 'Failed to update ticket. Please try again.');
      },
    });
  }

  // Quick resolve action
  resolveTicket() {
    this.pendingStatus.set('resolved');
    this.saveAllChanges();
  }

  // More menu actions
  toggleMoreMenu(event: Event) {
    this.moreMenu.toggle(event);
  }

  refreshTicket() {
    this.loader.show('primary', { text: 'Refreshing ticket...' });
    const ticketNumber = parseInt(this.ticketId(), 10);
    this.ticketApi.getTicketByNumber(ticketNumber).subscribe({
      next: (data: any) => {
        this.ticket.set(this.mapApiTicketDetail(data));
        this.messages.set(this.mapApiMessages(data));
        this.history.set(this.mapApiHistory(data));
        this.loader.hide();
        this.toast.success('Refreshed', 'Ticket data has been refreshed');
      },
      error: () => {
        this.loader.hide();
        this.toast.error('Error', 'Failed to refresh ticket');
      }
    });
  }

  duplicateTicket() {
    this.toast.info('Duplicate', 'Creating a duplicate ticket...');
    // In real app: navigate to create ticket page with pre-filled data
  }

  printTicket() {
    window.print();
  }

  exportAsPdf() {
    this.loader.show('primary', { text: 'Generating PDF...' });
    setTimeout(() => {
      this.loader.hide();
      this.toast.success('Export Complete', 'Ticket exported as PDF');
    }, 1500);
  }

  async markAsSpam() {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Mark as Spam',
      message: 'Are you sure you want to mark this ticket as spam? This will close the ticket and block the sender.',
      icon: 'pi pi-ban',
      iconColor: 'text-red-500',
      confirmLabel: 'Mark as Spam',
      confirmSeverity: 'danger',
    });
    
    if (confirmed) {
      this.loader.show('primary', { text: 'Marking as spam...' });
      setTimeout(() => {
        this.ticket.update(t => {
          if (!t) return t;
          return { ...t, status: 'closed' as const };
        });
        this.loader.hide();
        this.toast.warn('Marked as Spam', 'Ticket has been marked as spam and closed');
      }, 500);
    }
  }

  mergeTicket() {
    this.toast.info('Merge Ticket', 'Select another ticket to merge with...');
    // In real app: open a dialog to select ticket to merge with
  }

  splitConversation() {
    this.toast.info('Split Conversation', 'Select messages to split into a new ticket...');
    // In real app: open a dialog to select messages
  }

  async deleteTicket() {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Ticket',
      message: `Are you sure you want to delete ticket ${this.ticketId()}? This action cannot be undone.`,
      icon: 'pi pi-trash',
      iconColor: 'text-red-500',
      confirmLabel: 'Delete',
      confirmSeverity: 'danger',
    });
    
    if (confirmed) {
      this.loader.show('primary', { text: 'Deleting ticket...' });
      setTimeout(() => {
        this.loader.hide();
        this.toast.success('Deleted', 'Ticket has been deleted');
        this.router.navigate(['/tickets']);
      }, 500);
    }
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatRelativeDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
