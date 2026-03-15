import { Injectable, signal } from '@angular/core';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  id: string;
  ticketId: string;
  ticketNumber: number;
  content: string;
  createdAt: Date;
  author: {
    name: string;
    avatar?: string;
    type: 'customer' | 'agent' | 'system';
  };
  isInternal?: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  ticketPrefix?: string;
  subject: string;
  description: string;
  customer: Customer;
  type: 'incident' | 'issue' | 'request' | 'question' | 'task' | 'bug' | 'feature-request';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: Agent;
  followers?: Agent[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  eta: number; // in hours
  // SLA fields
  firstResponseDue: Date;
  resolutionDue: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  channel: 'email' | 'chat' | 'phone' | 'portal';
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  ticketNumber: number;
  type: 'created' | 'status_changed' | 'priority_changed' | 'assigned' | 'reply' | 'note' | 'updated';
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  details?: {
    from?: string;
    to?: string;
  };
}

// Knowledge Base interfaces
export interface KBCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  articleCount: number;
  color: string;
}

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  category?: KBCategory;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  relatedArticles?: string[];
  status: 'published' | 'draft';
}

// SLA Policy interfaces
export interface SLATarget {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  firstResponseTime: number; // in minutes
  resolutionTime: number; // in minutes
  escalateAfter?: number; // minutes before breach to escalate
}

export interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;
  }[];
  holidays: {
    name: string;
    date: string; // ISO date string
  }[];
}

export interface SLAPolicy {
  id: string;
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
    escalateTo?: string; // agent ID
  };
  createdAt: Date;
  updatedAt: Date;
}

// Canned Response interfaces
export interface CannedResponseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CannedResponse {
  id: string;
  title: string;
  shortcut: string;
  content: string;
  categoryId: string;
  category?: CannedResponseCategory;
  isShared: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  // Current logged-in user (simulated)
  currentUser = signal<Agent>({
    id: '1',
    name: 'Amy Elsner',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
  });

  // Agents
  private _agents: Agent[] = [
    { id: '1', name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
    { id: '2', name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
    { id: '3', name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
    { id: '4', name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
    { id: '5', name: 'Elwin Sharvill', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/elwinsharvill.png' },
  ];

  // Customers
  private _customers: Customer[] = [
    { id: 'c1', name: 'John Smith', email: 'john.smith@example.com' },
    { id: 'c2', name: 'Sarah Johnson', email: 'sarah.j@example.com' },
    { id: 'c3', name: 'Mike Wilson', email: 'mike.w@example.com' },
    { id: 'c4', name: 'Emily Brown', email: 'emily.b@example.com' },
    { id: 'c5', name: 'David Lee', email: 'david.lee@example.com' },
    { id: 'c6', name: 'Lisa Anderson', email: 'lisa.a@example.com' },
    { id: 'c7', name: 'Chris Taylor', email: 'chris.t@example.com' },
    { id: 'c8', name: 'Jennifer Martinez', email: 'jennifer.m@example.com' },
    { id: 'c9', name: 'Robert Garcia', email: 'robert.g@example.com' },
    { id: 'c10', name: 'Michelle Davis', email: 'michelle.d@example.com' },
    { id: 'c11', name: 'James Williams', email: 'james.w@example.com' },
    { id: 'c12', name: 'Amanda Rodriguez', email: 'amanda.r@example.com' },
    { id: 'c13', name: 'Daniel Miller', email: 'daniel.m@example.com' },
    { id: 'c14', name: 'Jessica Thompson', email: 'jessica.t@example.com' },
    { id: 'c15', name: 'Kevin White', email: 'kevin.w@example.com' },
    { id: 'c16', name: 'Stephanie Harris', email: 'stephanie.h@example.com' },
    { id: 'c17', name: 'Brian Clark', email: 'brian.c@example.com' },
    { id: 'c18', name: 'Nicole Lewis', email: 'nicole.l@example.com' },
    { id: 'c19', name: 'Matthew Walker', email: 'matthew.w@example.com' },
    { id: 'c20', name: 'Ashley Hall', email: 'ashley.h@example.com' },
  ];

  // Tickets
  private _tickets: Ticket[] = [
    {
      id: 'TKT-001',
      ticketNumber: 1,
      subject: 'Unable to access my account after password reset',
      type: 'incident',
      description: '<p>I tried to reset my password yesterday but now I cannot log in. The system says my credentials are invalid even though I just set a new password.</p><p><strong>Steps I\'ve tried:</strong></p><ul><li>Cleared browser cache</li><li>Used incognito mode</li><li>Tried different browsers</li></ul><p>Nothing seems to work. Please help!</p>',
      customer: this._customers[0],
      status: 'in-progress',
      priority: 'high',
      assignedAgent: this._agents[0],
      followers: [this._agents[1], this._agents[3]],
      createdAt: new Date('2026-03-07T10:30:00'),
      updatedAt: new Date('2026-03-08T09:15:00'),
      tags: ['account', 'login', 'password'],
      eta: 2,
      firstResponseDue: new Date('2026-03-07T12:30:00'),
      resolutionDue: new Date('2026-03-08T18:30:00'),
      firstResponseAt: new Date('2026-03-07T11:15:00'),
      channel: 'email',
    },
    {
      id: 'TKT-002',
      ticketNumber: 2,
      subject: 'Payment failed but amount deducted',
      type: 'incident',
      description: '<p>I tried to make a payment of $299 for my subscription renewal. The payment failed with an error message but the amount was deducted from my bank account.</p><p>Transaction ID: TXN-2026030812345</p><p>Please refund the amount or activate my subscription.</p>',
      customer: this._customers[1],
      status: 'in-progress',
      priority: 'urgent',
      assignedAgent: this._agents[1],
      followers: [this._agents[2]],
      createdAt: new Date('2026-03-07T15:45:00'),
      updatedAt: new Date('2026-03-08T09:15:00'),
      tags: ['payment', 'billing', 'refund'],
      eta: 4,
      firstResponseDue: new Date('2026-03-07T16:45:00'),
      resolutionDue: new Date('2026-03-08T15:45:00'),
      firstResponseAt: new Date('2026-03-07T16:00:00'),
      channel: 'chat',
    },
    {
      id: 'TKT-003',
      ticketNumber: 3,
      subject: 'How to export my data?',
      type: 'question',
      description: '<p>I need to export all my project data for compliance purposes. Can you guide me on how to do this?</p><p>I need the data in CSV format if possible.</p>',
      customer: this._customers[2],
      status: 'waiting',
      priority: 'medium',
      assignedAgent: this._agents[2],
      createdAt: new Date('2026-03-06T11:20:00'),
      updatedAt: new Date('2026-03-07T14:30:00'),
      tags: ['data-export', 'compliance'],
      eta: 8,
      firstResponseDue: new Date('2026-03-06T15:20:00'),
      resolutionDue: new Date('2026-03-08T11:20:00'),
      firstResponseAt: new Date('2026-03-06T12:00:00'),
      channel: 'portal',
    },
    {
      id: 'TKT-004',
      ticketNumber: 4,
      subject: 'Feature request: Dark mode',
      type: 'feature-request',
      description: '<p>It would be great if the application had a dark mode option. Working late at night with a bright screen is straining my eyes.</p><p>Many modern apps support this feature now.</p>',
      customer: this._customers[3],
      status: 'resolved',
      priority: 'low',
      assignedAgent: this._agents[0],
      createdAt: new Date('2026-03-05T09:00:00'),
      updatedAt: new Date('2026-03-06T16:45:00'),
      tags: ['feature-request', 'ui'],
      eta: 24,
      firstResponseDue: new Date('2026-03-05T17:00:00'),
      resolutionDue: new Date('2026-03-07T09:00:00'),
      firstResponseAt: new Date('2026-03-05T10:30:00'),
      resolvedAt: new Date('2026-03-06T16:45:00'),
      channel: 'email',
    },
    {
      id: 'TKT-005',
      ticketNumber: 5,
      subject: 'API rate limiting issues',
      type: 'bug',
      description: '<p>Our integration is hitting rate limits even though we\'re well under the documented limits.</p><p>We\'re seeing 429 errors after about 50 requests per minute, but the docs say 100/min is allowed.</p><p>API Key: ak_prod_xxxxx</p>',
      customer: this._customers[4],
      status: 'open',
      priority: 'high',
      createdAt: new Date('2026-03-08T08:15:00'),
      updatedAt: new Date('2026-03-08T08:15:00'),
      tags: ['api', 'integration', 'rate-limit'],
      eta: 4,
      firstResponseDue: new Date('2026-03-08T10:15:00'),
      resolutionDue: new Date('2026-03-08T16:15:00'),
      channel: 'email',
    },
    {
      id: 'TKT-006',
      ticketNumber: 6,
      subject: 'Billing invoice not received',
      type: 'request',
      description: '<p>I have not received my invoice for the month of February. I need this for my expense reports.</p><p>Please resend it to my email address on file.</p>',
      customer: this._customers[5],
      status: 'closed',
      priority: 'medium',
      assignedAgent: this._agents[1],
      createdAt: new Date('2026-03-01T13:30:00'),
      updatedAt: new Date('2026-03-03T10:00:00'),
      tags: ['billing', 'invoice'],
      eta: 8,
      firstResponseDue: new Date('2026-03-01T17:30:00'),
      resolutionDue: new Date('2026-03-02T13:30:00'),
      firstResponseAt: new Date('2026-03-01T14:00:00'),
      resolvedAt: new Date('2026-03-02T09:00:00'),
      channel: 'phone',
    },
    {
      id: 'TKT-007',
      ticketNumber: 7,
      subject: 'Integration with Slack not working',
      type: 'issue',
      description: '<p>The Slack integration stopped working yesterday. Notifications are not being sent to our channel anymore.</p><p>Slack Channel: #support-alerts</p><p>We\'ve tried reconnecting but it gives an OAuth error.</p>',
      customer: this._customers[6],
      status: 'in-progress',
      priority: 'medium',
      assignedAgent: this._agents[2],
      createdAt: new Date('2026-03-07T16:00:00'),
      updatedAt: new Date('2026-03-08T11:30:00'),
      tags: ['integration', 'slack', 'oauth'],
      eta: 6,
      firstResponseDue: new Date('2026-03-07T20:00:00'),
      resolutionDue: new Date('2026-03-08T16:00:00'),
      firstResponseAt: new Date('2026-03-07T17:00:00'),
      channel: 'chat',
    },
    {
      id: 'TKT-008',
      ticketNumber: 8,
      subject: 'Account suspended without notice',
      type: 'incident',
      description: '<p>I woke up this morning to find my account suspended. I didn\'t receive any warning or explanation.</p><p>This is affecting my business operations. Please restore access immediately!</p>',
      customer: this._customers[7],
      status: 'open',
      priority: 'urgent',
      createdAt: new Date('2026-03-08T12:00:00'),
      updatedAt: new Date('2026-03-08T12:00:00'),
      tags: ['account', 'suspension', 'urgent'],
      eta: 1,
      firstResponseDue: new Date('2026-03-08T13:00:00'),
      resolutionDue: new Date('2026-03-08T14:00:00'),
      channel: 'phone',
    },
    // Generated tickets will be added here
    ...this.generateMockTickets(75),
  ];

  // Generate additional mock tickets
  private generateMockTickets(count: number): Ticket[] {
    const subjects = [
      'Cannot upload files larger than 10MB',
      'Dashboard loading very slowly',
      'Need help setting up SSO',
      'Export to PDF not working',
      'Mobile app crashes on startup',
      'Two-factor authentication issues',
      'Invoice shows wrong amount',
      'Webhook integration failing',
      'Search function not returning results',
      'User permissions not saving',
      'Email notifications delayed',
      'Calendar sync not working',
      'Custom fields disappeared',
      'Report generation timeout',
      'API documentation unclear',
      'Bulk import failing',
      'Password requirements too strict',
      'Session timeout too short',
      'Unable to delete old projects',
      'Duplicate records appearing',
      'Chart data not updating',
      'Print layout issues',
      'Language settings reset',
      'Automation rules not triggering',
      'Contact merge request',
      'Database backup needed',
      'SSL certificate error',
      'CORS policy blocking requests',
      'Memory leak in application',
      'Slow query performance',
      'Need audit log access',
      'Data migration assistance',
      'Custom branding setup',
      'API key rotation help',
      'Compliance report generation',
      'Training session request',
      'Downgrade subscription',
      'Account closure request',
      'Bulk data deletion',
      'GDPR data request',
    ];

    const descriptions = [
      '<p>I\'m experiencing this issue consistently. Please help resolve it as soon as possible.</p>',
      '<p>This started happening after the recent update. Rolling back would help temporarily.</p>',
      '<p>I\'ve tried the documentation but couldn\'t figure it out. Need step-by-step guidance.</p>',
      '<p>Multiple users in our organization are affected by this. Priority assistance needed.</p>',
      '<p>This is blocking our workflow. We need a quick resolution or workaround.</p>',
    ];

    const tagSets = [
      ['api', 'integration'],
      ['billing', 'payment'],
      ['account', 'security'],
      ['performance', 'optimization'],
      ['ui', 'ux'],
      ['mobile', 'app'],
      ['export', 'data'],
      ['authentication', 'sso'],
      ['automation', 'workflow'],
      ['compliance', 'gdpr'],
    ];

    const types: Ticket['type'][] = ['incident', 'issue', 'request', 'question', 'task', 'bug', 'feature-request'];
    const statuses: Ticket['status'][] = ['open', 'in-progress', 'waiting', 'resolved', 'closed'];
    const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const channels: Ticket['channel'][] = ['email', 'chat', 'phone', 'portal'];

    const tickets: Ticket[] = [];
    const baseDate = new Date('2026-03-08T12:00:00');

    for (let i = 9; i <= 8 + count; i++) {
      const ticketNum = i.toString().padStart(3, '0');
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(baseDate.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
      const updatedAt = new Date(createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const customer = this._customers[Math.floor(Math.random() * this._customers.length)];
      const assignedAgent = Math.random() > 0.2 ? this._agents[Math.floor(Math.random() * this._agents.length)] : undefined;
      
      // Generate random followers (0-3 agents, excluding the assigned agent)
      const followerCount = Math.floor(Math.random() * 4);
      const availableFollowers = this._agents.filter(a => a.id !== assignedAgent?.id);
      const followers: Agent[] = [];
      for (let j = 0; j < Math.min(followerCount, availableFollowers.length); j++) {
        const randomIndex = Math.floor(Math.random() * availableFollowers.length);
        const follower = availableFollowers.splice(randomIndex, 1)[0];
        followers.push(follower);
      }
      
      const etaHours = priority === 'urgent' ? 2 : priority === 'high' ? 4 : priority === 'medium' ? 8 : 24;
      const firstResponseDue = new Date(createdAt.getTime() + (etaHours / 2) * 60 * 60 * 1000);
      const resolutionDue = new Date(createdAt.getTime() + etaHours * 60 * 60 * 1000);
      
      const isResponded = status !== 'open' || Math.random() > 0.3;
      const isResolved = status === 'resolved' || status === 'closed';

      tickets.push({
        id: `TKT-${ticketNum}`,
        ticketNumber: i,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        customer,
        type,
        status,
        priority,
        assignedAgent,
        followers: followers.length > 0 ? followers : undefined,
        createdAt,
        updatedAt,
        tags: tagSets[Math.floor(Math.random() * tagSets.length)],
        eta: etaHours,
        firstResponseDue,
        resolutionDue,
        firstResponseAt: isResponded ? new Date(createdAt.getTime() + Math.random() * (etaHours / 2) * 60 * 60 * 1000) : undefined,
        resolvedAt: isResolved ? new Date(updatedAt.getTime() - Math.random() * 2 * 60 * 60 * 1000) : undefined,
        channel,
      });
    }

    return tickets;
  }

  // Messages per ticket
  private _messages: Message[] = [
    // TKT-001 messages
    {
      id: 'm1-1',
      ticketId: 'TKT-001',
      ticketNumber: 1,
      content: 'I tried to reset my password yesterday but now I cannot log in. The system says my credentials are invalid even though I just set a new password. I\'ve already tried clearing my browser cache and using incognito mode but nothing works.',
      createdAt: new Date('2026-03-07T10:30:00'),
      author: { name: 'John Smith', type: 'customer' },
    },
    {
      id: 'm1-2',
      ticketId: 'TKT-001',
      ticketNumber: 1,
      content: 'Thank you for reaching out. I understand how frustrating this must be. Let me look into your account and see what\'s happening.',
      createdAt: new Date('2026-03-07T11:15:00'),
      author: { name: 'Amy Elsner', avatar: this._agents[0].avatar, type: 'agent' },
    },
    {
      id: 'm1-3',
      ticketId: 'TKT-001',
      ticketNumber: 1,
      content: 'Checked the auth logs - password reset completed but session token wasn\'t invalidated. Need to clear from admin panel.',
      createdAt: new Date('2026-03-07T11:20:00'),
      author: { name: 'Amy Elsner', avatar: this._agents[0].avatar, type: 'agent' },
      isInternal: true,
    },
    {
      id: 'm1-4',
      ticketId: 'TKT-001',
      ticketNumber: 1,
      content: 'I\'ve identified the issue. There was a caching problem with your session. I\'ve cleared it from our end. Could you please try logging in again with your new password?',
      createdAt: new Date('2026-03-07T11:25:00'),
      author: { name: 'Amy Elsner', avatar: this._agents[0].avatar, type: 'agent' },
    },
    {
      id: 'm1-5',
      ticketId: 'TKT-001',
      ticketNumber: 1,
      content: 'It worked! Thank you so much for the quick help. I really appreciate it.',
      createdAt: new Date('2026-03-08T09:15:00'),
      author: { name: 'John Smith', type: 'customer' },
    },
    // TKT-002 messages
    {
      id: 'm2-1',
      ticketId: 'TKT-002',
      ticketNumber: 2,
      content: 'Hi, I tried to make a payment but it failed. However, the money was deducted from my account. Please help!',
      createdAt: new Date('2026-03-07T15:45:00'),
      author: { name: 'Sarah Johnson', type: 'customer' },
    },
    {
      id: 'm2-2',
      ticketId: 'TKT-002',
      ticketNumber: 2,
      content: 'I\'m so sorry for the inconvenience! Let me check the payment gateway logs for your transaction.',
      createdAt: new Date('2026-03-07T16:00:00'),
      author: { name: 'Anna Fali', avatar: this._agents[1].avatar, type: 'agent' },
    },
    {
      id: 'm2-3',
      ticketId: 'TKT-002',
      ticketNumber: 2,
      content: 'Payment gateway timeout issue. Transaction stuck in pending. Need to contact payment processor.',
      createdAt: new Date('2026-03-07T16:15:00'),
      author: { name: 'Anna Fali', avatar: this._agents[1].avatar, type: 'agent' },
      isInternal: true,
    },
    // TKT-005 messages (no responses yet - awaiting first response)
    {
      id: 'm5-1',
      ticketId: 'TKT-005',
      ticketNumber: 5,
      content: 'Our integration is hitting rate limits. We\'re getting 429 errors after about 50 requests when the limit should be 100.',
      createdAt: new Date('2026-03-08T08:15:00'),
      author: { name: 'David Lee', type: 'customer' },
    },
    // TKT-008 messages (no responses yet - awaiting first response)
    {
      id: 'm8-1',
      ticketId: 'TKT-008',
      ticketNumber: 8,
      content: 'My account has been suspended without any warning! This is unacceptable and affecting my business.',
      createdAt: new Date('2026-03-08T12:00:00'),
      author: { name: 'Jennifer Martinez', type: 'customer' },
    },
  ];

  // History entries
  private _history: HistoryEntry[] = [
    // TKT-001 history
    {
      id: 'h1-1',
      ticketId: 'TKT-001',ticketNumber: 1,
      type: 'created',
      description: 'Ticket created',
      user: { name: 'John Smith' },
      timestamp: new Date('2026-03-07T10:30:00'),
    },
    {
      id: 'h1-2',
      ticketId: 'TKT-001',ticketNumber: 1,
      type: 'assigned',
      description: 'Assigned to Amy Elsner',
      user: { name: 'System' },
      timestamp: new Date('2026-03-07T10:31:00'),
      details: { to: 'Amy Elsner' },
    },
    {
      id: 'h1-3',
      ticketId: 'TKT-001',ticketNumber: 1,
      type: 'status_changed',
      description: 'Status changed',
      user: { name: 'Amy Elsner', avatar: this._agents[0].avatar },
      timestamp: new Date('2026-03-07T11:15:00'),
      details: { from: 'Open', to: 'In Progress' },
    },
    {
      id: 'h1-4',
      ticketId: 'TKT-001',ticketNumber: 1,
      type: 'reply',
      description: 'Sent a reply to customer',
      user: { name: 'Amy Elsner', avatar: this._agents[0].avatar },
      timestamp: new Date('2026-03-07T11:25:00'),
    },
    {
      id: 'h1-5',
      ticketId: 'TKT-001',ticketNumber: 1,
      type: 'note',
      description: 'Added internal note',
      user: { name: 'Amy Elsner', avatar: this._agents[0].avatar },
      timestamp: new Date('2026-03-07T11:20:00'),
    },
  ];

  // Knowledge Base Categories
  private _kbCategories: KBCategory[] = [
    {
      id: 'cat-1',
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Learn the basics and get up and running quickly',
      icon: 'pi pi-play-circle',
      articleCount: 8,
      color: '#4F46E5',
    },
    {
      id: 'cat-2',
      name: 'Account & Billing',
      slug: 'account-billing',
      description: 'Manage your account, subscriptions, and payments',
      icon: 'pi pi-credit-card',
      articleCount: 12,
      color: '#059669',
    },
    {
      id: 'cat-3',
      name: 'Features & Tools',
      slug: 'features-tools',
      description: 'Deep dive into all product features and capabilities',
      icon: 'pi pi-cog',
      articleCount: 15,
      color: '#7C3AED',
    },
    {
      id: 'cat-4',
      name: 'Integrations',
      slug: 'integrations',
      description: 'Connect with your favorite tools and services',
      icon: 'pi pi-link',
      articleCount: 10,
      color: '#0891B2',
    },
    {
      id: 'cat-5',
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      description: 'Fix common issues and find solutions',
      icon: 'pi pi-wrench',
      articleCount: 18,
      color: '#DC2626',
    },
    {
      id: 'cat-6',
      name: 'API & Developers',
      slug: 'api-developers',
      description: 'Technical documentation for developers',
      icon: 'pi pi-code',
      articleCount: 9,
      color: '#F59E0B',
    },
  ];

  // Knowledge Base Articles
  private _kbArticles: KBArticle[] = [
    {
      id: 'art-1',
      title: 'Quick Start Guide: Your First 5 Minutes',
      slug: 'quick-start-guide',
      excerpt: 'Get up and running with Flashdesk in just 5 minutes. This guide covers the essential setup steps.',
      content: `
        <h2>Welcome to Flashdesk!</h2>
        <p>This guide will help you set up your helpdesk and start managing customer tickets in just a few minutes.</p>
        
        <h3>Step 1: Complete Your Profile</h3>
        <p>Start by setting up your profile with your name, photo, and contact information. This helps your customers identify who they're communicating with.</p>
        <ol>
          <li>Click on your avatar in the top-right corner</li>
          <li>Select "Settings" from the dropdown</li>
          <li>Fill in your profile information</li>
          <li>Click "Save Changes"</li>
        </ol>
        
        <h3>Step 2: Configure Your Email</h3>
        <p>Connect your support email address to start receiving tickets automatically.</p>
        <div class="info-box">
          <strong>Pro Tip:</strong> Use a dedicated support email like support@yourcompany.com for best results.
        </div>
        
        <h3>Step 3: Invite Your Team</h3>
        <p>Add team members to share the workload and collaborate on tickets.</p>
        <ul>
          <li>Go to Settings → Team Members</li>
          <li>Click "Invite Member"</li>
          <li>Enter their email and select their role</li>
        </ul>
        
        <h3>Step 4: Create Your First Ticket</h3>
        <p>Try creating a test ticket to familiarize yourself with the interface:</p>
        <ol>
          <li>Click the "New Ticket" button</li>
          <li>Fill in the subject and description</li>
          <li>Select priority and assign to yourself</li>
          <li>Click "Create"</li>
        </ol>
        
        <h3>Next Steps</h3>
        <p>Congratulations! You're now ready to start using Flashdesk. Check out our other guides to learn about:</p>
        <ul>
          <li>Setting up automated responses</li>
          <li>Creating canned responses for common questions</li>
          <li>Configuring SLA policies</li>
        </ul>
      `,
      categoryId: 'cat-1',
      author: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
      createdAt: new Date('2026-01-15T10:00:00'),
      updatedAt: new Date('2026-02-20T14:30:00'),
      views: 2847,
      helpful: 234,
      notHelpful: 12,
      tags: ['getting-started', 'setup', 'quick-start'],
      relatedArticles: ['art-2', 'art-3'],
      status: 'published',
    },
    {
      id: 'art-2',
      title: 'Understanding Ticket Statuses and Workflows',
      slug: 'ticket-statuses-workflows',
      excerpt: 'Learn about the different ticket statuses and how to create efficient workflows for your team.',
      content: `
        <h2>Ticket Status Overview</h2>
        <p>Flashdesk uses a flexible status system to track the progress of each ticket through your support workflow.</p>
        
        <h3>Default Statuses</h3>
        <table>
          <tr>
            <th>Status</th>
            <th>Description</th>
          </tr>
          <tr>
            <td><span class="status open">Open</span></td>
            <td>New tickets that need attention</td>
          </tr>
          <tr>
            <td><span class="status in-progress">In Progress</span></td>
            <td>Tickets actively being worked on</td>
          </tr>
          <tr>
            <td><span class="status waiting">Waiting</span></td>
            <td>Waiting for customer response or external action</td>
          </tr>
          <tr>
            <td><span class="status resolved">Resolved</span></td>
            <td>Issue has been addressed, awaiting confirmation</td>
          </tr>
          <tr>
            <td><span class="status closed">Closed</span></td>
            <td>Ticket is complete and archived</td>
          </tr>
        </table>
        
        <h3>Changing Ticket Status</h3>
        <p>You can change a ticket's status in several ways:</p>
        <ul>
          <li>Click on the status pills at the top of the ticket detail page</li>
          <li>Use the status dropdown in the ticket sidebar</li>
          <li>Apply bulk actions from the ticket list</li>
        </ul>
        
        <h3>Automating Status Changes</h3>
        <p>Set up automation rules to automatically change status based on events:</p>
        <ul>
          <li>Auto-resolve tickets after customer confirms</li>
          <li>Auto-close resolved tickets after 7 days</li>
          <li>Reopen tickets when customer replies</li>
        </ul>
      `,
      categoryId: 'cat-1',
      author: { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
      createdAt: new Date('2026-01-18T11:00:00'),
      updatedAt: new Date('2026-03-01T09:15:00'),
      views: 1923,
      helpful: 187,
      notHelpful: 8,
      tags: ['tickets', 'workflow', 'status'],
      relatedArticles: ['art-1', 'art-5'],
      status: 'published',
    },
    {
      id: 'art-3',
      title: 'How to Manage Your Subscription and Billing',
      slug: 'manage-subscription-billing',
      excerpt: 'Everything you need to know about upgrading, downgrading, and managing your Flashdesk subscription.',
      content: `
        <h2>Subscription Management</h2>
        <p>Manage your Flashdesk subscription from the Billing section in Settings.</p>
        
        <h3>Viewing Your Current Plan</h3>
        <p>Go to Settings → Billing to see your current plan, usage, and renewal date.</p>
        
        <h3>Upgrading Your Plan</h3>
        <ol>
          <li>Navigate to Settings → Billing</li>
          <li>Click "Change Plan"</li>
          <li>Select your new plan</li>
          <li>Confirm the upgrade</li>
        </ol>
        <p>Upgrades take effect immediately. You'll be charged a prorated amount for the remainder of your billing cycle.</p>
        
        <h3>Updating Payment Method</h3>
        <p>Keep your payment method up to date to avoid service interruptions:</p>
        <ol>
          <li>Go to Settings → Billing → Payment Method</li>
          <li>Click "Update Card"</li>
          <li>Enter your new card details</li>
          <li>Click "Save"</li>
        </ol>
        
        <h3>Downloading Invoices</h3>
        <p>Access all your invoices from the Billing History section. Click on any invoice to download a PDF.</p>
      `,
      categoryId: 'cat-2',
      author: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
      createdAt: new Date('2026-01-20T13:00:00'),
      updatedAt: new Date('2026-02-15T16:00:00'),
      views: 1456,
      helpful: 142,
      notHelpful: 15,
      tags: ['billing', 'subscription', 'payment'],
      status: 'published',
    },
    {
      id: 'art-4',
      title: 'Setting Up SLA Policies for Your Team',
      slug: 'setup-sla-policies',
      excerpt: 'Configure Service Level Agreements to ensure timely responses and resolutions for your customers.',
      content: `
        <h2>Understanding SLA Policies</h2>
        <p>SLA (Service Level Agreement) policies help you set and track response and resolution time goals.</p>
        
        <h3>Default SLA Targets</h3>
        <p>Flashdesk comes with default SLA targets based on ticket priority:</p>
        <table>
          <tr>
            <th>Priority</th>
            <th>First Response</th>
            <th>Resolution</th>
          </tr>
          <tr>
            <td>Urgent</td>
            <td>1 hour</td>
            <td>4 hours</td>
          </tr>
          <tr>
            <td>High</td>
            <td>4 hours</td>
            <td>8 hours</td>
          </tr>
          <tr>
            <td>Medium</td>
            <td>8 hours</td>
            <td>24 hours</td>
          </tr>
          <tr>
            <td>Low</td>
            <td>24 hours</td>
            <td>48 hours</td>
          </tr>
        </table>
        
        <h3>Creating Custom SLA Policies</h3>
        <ol>
          <li>Go to Settings → SLA Policies</li>
          <li>Click "Create Policy"</li>
          <li>Set your response and resolution targets</li>
          <li>Define business hours if applicable</li>
          <li>Save your policy</li>
        </ol>
        
        <h3>SLA Breach Notifications</h3>
        <p>Configure notifications to alert your team when SLAs are at risk or breached.</p>
      `,
      categoryId: 'cat-3',
      author: { name: 'Asiya Javayant', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png' },
      createdAt: new Date('2026-01-25T09:00:00'),
      updatedAt: new Date('2026-03-05T11:30:00'),
      views: 1234,
      helpful: 98,
      notHelpful: 5,
      tags: ['sla', 'policy', 'response-time'],
      relatedArticles: ['art-2'],
      status: 'published',
    },
    {
      id: 'art-5',
      title: 'Connecting Slack Integration',
      slug: 'slack-integration',
      excerpt: 'Receive ticket notifications and respond to customers directly from Slack.',
      content: `
        <h2>Slack Integration Setup</h2>
        <p>Connect Flashdesk to Slack to get real-time notifications and manage tickets without leaving Slack.</p>
        
        <h3>Installation</h3>
        <ol>
          <li>Go to Settings → Integrations</li>
          <li>Find Slack and click "Connect"</li>
          <li>Authorize Flashdesk in your Slack workspace</li>
          <li>Select the channel for notifications</li>
        </ol>
        
        <h3>Features</h3>
        <ul>
          <li>New ticket notifications</li>
          <li>Assignment notifications</li>
          <li>SLA warning alerts</li>
          <li>Reply to tickets from Slack</li>
        </ul>
        
        <h3>Slash Commands</h3>
        <p>Use these commands in Slack:</p>
        <ul>
          <li><code>/flashdesk open</code> - View open tickets</li>
          <li><code>/flashdesk search [query]</code> - Search tickets</li>
          <li><code>/flashdesk assign [ticket-id] [user]</code> - Assign a ticket</li>
        </ul>
      `,
      categoryId: 'cat-4',
      author: { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
      createdAt: new Date('2026-02-01T14:00:00'),
      updatedAt: new Date('2026-02-28T10:00:00'),
      views: 892,
      helpful: 76,
      notHelpful: 3,
      tags: ['integration', 'slack', 'notifications'],
      status: 'published',
    },
    {
      id: 'art-6',
      title: 'Fixing Login and Authentication Issues',
      slug: 'login-authentication-issues',
      excerpt: 'Troubleshoot common login problems including password reset, 2FA issues, and session timeouts.',
      content: `
        <h2>Common Login Issues</h2>
        <p>If you're having trouble logging in, try these solutions:</p>
        
        <h3>Forgot Password</h3>
        <ol>
          <li>Click "Forgot Password" on the login page</li>
          <li>Enter your email address</li>
          <li>Check your inbox for the reset link</li>
          <li>Create a new password</li>
        </ol>
        
        <div class="warning-box">
          <strong>Note:</strong> Reset links expire after 24 hours. Request a new one if expired.
        </div>
        
        <h3>Two-Factor Authentication Issues</h3>
        <p>If your 2FA isn't working:</p>
        <ul>
          <li>Ensure your device time is correct</li>
          <li>Use backup codes if available</li>
          <li>Contact support to reset 2FA</li>
        </ul>
        
        <h3>Session Timeout</h3>
        <p>Sessions expire after 24 hours of inactivity, or 30 days if "Remember Me" is enabled.</p>
        
        <h3>Still Having Issues?</h3>
        <p>If none of these solutions work, please contact support with:</p>
        <ul>
          <li>Your email address</li>
          <li>Screenshot of any error messages</li>
          <li>Browser and device information</li>
        </ul>
      `,
      categoryId: 'cat-5',
      author: { name: 'Amy Elsner', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png' },
      createdAt: new Date('2026-02-05T10:00:00'),
      updatedAt: new Date('2026-03-02T15:00:00'),
      views: 3456,
      helpful: 312,
      notHelpful: 18,
      tags: ['login', 'authentication', 'password', '2fa'],
      status: 'published',
    },
    {
      id: 'art-7',
      title: 'REST API Authentication Guide',
      slug: 'api-authentication-guide',
      excerpt: 'Learn how to authenticate with the Flashdesk API using API keys and OAuth 2.0.',
      content: `
        <h2>API Authentication</h2>
        <p>Flashdesk supports two authentication methods: API Keys and OAuth 2.0.</p>
        
        <h3>API Key Authentication</h3>
        <p>Best for server-to-server integrations:</p>
        <pre><code>curl -X GET "https://api.flashdesk.io/v1/tickets" \\
  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
        
        <h3>Generating API Keys</h3>
        <ol>
          <li>Go to Settings → API & Integrations</li>
          <li>Click "Generate API Key"</li>
          <li>Set permissions and expiration</li>
          <li>Copy and securely store your key</li>
        </ol>
        
        <div class="warning-box">
          <strong>Security:</strong> Never expose API keys in client-side code or public repositories.
        </div>
        
        <h3>OAuth 2.0</h3>
        <p>For user-authorized applications, use OAuth 2.0:</p>
        <ol>
          <li>Register your application</li>
          <li>Redirect users to authorize</li>
          <li>Exchange code for access token</li>
          <li>Use token for API requests</li>
        </ol>
        
        <h3>Rate Limits</h3>
        <p>API rate limits depend on your plan:</p>
        <ul>
          <li>Starter: 100 requests/minute</li>
          <li>Professional: 500 requests/minute</li>
          <li>Enterprise: 2000 requests/minute</li>
        </ul>
      `,
      categoryId: 'cat-6',
      author: { name: 'Bernardo Dominic', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/bernardodominic.png' },
      createdAt: new Date('2026-02-10T11:00:00'),
      updatedAt: new Date('2026-03-01T14:00:00'),
      views: 1567,
      helpful: 134,
      notHelpful: 7,
      tags: ['api', 'authentication', 'oauth', 'developer'],
      relatedArticles: ['art-5'],
      status: 'published',
    },
    {
      id: 'art-8',
      title: 'Creating and Using Canned Responses',
      slug: 'canned-responses',
      excerpt: 'Speed up your replies with pre-written response templates for common questions.',
      content: `
        <h2>Canned Responses</h2>
        <p>Save time by creating reusable response templates for frequently asked questions.</p>
        
        <h3>Creating a Canned Response</h3>
        <ol>
          <li>Go to Settings → Canned Responses</li>
          <li>Click "Create Response"</li>
          <li>Enter a name and category</li>
          <li>Write your response content</li>
          <li>Use variables like {{customer_name}} for personalization</li>
          <li>Save your response</li>
        </ol>
        
        <h3>Using Canned Responses</h3>
        <p>Insert a canned response while replying to a ticket:</p>
        <ol>
          <li>Click the "Templates" button in the reply editor</li>
          <li>Search or browse categories</li>
          <li>Click on a response to insert it</li>
          <li>Edit as needed before sending</li>
        </ol>
        
        <h3>Available Variables</h3>
        <ul>
          <li><code>{{customer_name}}</code> - Customer's full name</li>
          <li><code>{{ticket_id}}</code> - Ticket reference number</li>
          <li><code>{{agent_name}}</code> - Your name</li>
          <li><code>{{company_name}}</code> - Your company name</li>
        </ul>
      `,
      categoryId: 'cat-3',
      author: { name: 'Anna Fali', avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png' },
      createdAt: new Date('2026-02-12T15:00:00'),
      updatedAt: new Date('2026-02-25T09:00:00'),
      views: 2134,
      helpful: 189,
      notHelpful: 11,
      tags: ['canned-responses', 'templates', 'productivity'],
      relatedArticles: ['art-2'],
      status: 'published',
    },
  ];

  // SLA Policies
  private _slaPolicies: SLAPolicy[] = [
    {
      id: 'sla-1',
      name: 'Standard Support',
      description: 'Default SLA policy for all standard support tickets',
      isDefault: true,
      isActive: true,
      targets: [
        { priority: 'urgent', firstResponseTime: 30, resolutionTime: 240, escalateAfter: 15 },
        { priority: 'high', firstResponseTime: 60, resolutionTime: 480, escalateAfter: 30 },
        { priority: 'medium', firstResponseTime: 240, resolutionTime: 1440, escalateAfter: 120 },
        { priority: 'low', firstResponseTime: 480, resolutionTime: 2880, escalateAfter: 240 },
      ],
      businessHours: {
        enabled: true,
        timezone: 'America/New_York',
        schedule: [
          { day: 'monday', enabled: true, startTime: '09:00', endTime: '17:00' },
          { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
          { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
          { day: 'thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
          { day: 'friday', enabled: true, startTime: '09:00', endTime: '17:00' },
          { day: 'saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
          { day: 'sunday', enabled: false, startTime: '09:00', endTime: '17:00' },
        ],
        holidays: [
          { name: 'New Year\'s Day', date: '2026-01-01' },
          { name: 'Independence Day', date: '2026-07-04' },
          { name: 'Thanksgiving', date: '2026-11-26' },
          { name: 'Christmas Day', date: '2026-12-25' },
        ],
      },
      appliesTo: {},
      breachActions: {
        notifyAgents: true,
        notifySupervisors: true,
        autoEscalate: false,
      },
      createdAt: new Date('2025-01-15T10:00:00'),
      updatedAt: new Date('2026-02-20T14:30:00'),
    },
    {
      id: 'sla-2',
      name: 'Premium Support',
      description: 'Enhanced SLA for premium tier customers with faster response times',
      isDefault: false,
      isActive: true,
      targets: [
        { priority: 'urgent', firstResponseTime: 15, resolutionTime: 120, escalateAfter: 10 },
        { priority: 'high', firstResponseTime: 30, resolutionTime: 240, escalateAfter: 20 },
        { priority: 'medium', firstResponseTime: 60, resolutionTime: 480, escalateAfter: 45 },
        { priority: 'low', firstResponseTime: 120, resolutionTime: 1440, escalateAfter: 90 },
      ],
      businessHours: {
        enabled: true,
        timezone: 'America/New_York',
        schedule: [
          { day: 'monday', enabled: true, startTime: '08:00', endTime: '20:00' },
          { day: 'tuesday', enabled: true, startTime: '08:00', endTime: '20:00' },
          { day: 'wednesday', enabled: true, startTime: '08:00', endTime: '20:00' },
          { day: 'thursday', enabled: true, startTime: '08:00', endTime: '20:00' },
          { day: 'friday', enabled: true, startTime: '08:00', endTime: '20:00' },
          { day: 'saturday', enabled: true, startTime: '10:00', endTime: '16:00' },
          { day: 'sunday', enabled: false, startTime: '10:00', endTime: '16:00' },
        ],
        holidays: [],
      },
      appliesTo: {
        customerTiers: ['premium', 'enterprise'],
      },
      breachActions: {
        notifyAgents: true,
        notifySupervisors: true,
        autoEscalate: true,
        escalateTo: '1',
      },
      createdAt: new Date('2025-03-01T09:00:00'),
      updatedAt: new Date('2026-03-01T11:00:00'),
    },
    {
      id: 'sla-3',
      name: '24/7 Critical Support',
      description: 'Round-the-clock support for critical infrastructure issues',
      isDefault: false,
      isActive: true,
      targets: [
        { priority: 'urgent', firstResponseTime: 10, resolutionTime: 60, escalateAfter: 5 },
        { priority: 'high', firstResponseTime: 15, resolutionTime: 120, escalateAfter: 10 },
        { priority: 'medium', firstResponseTime: 30, resolutionTime: 240, escalateAfter: 20 },
        { priority: 'low', firstResponseTime: 60, resolutionTime: 480, escalateAfter: 45 },
      ],
      businessHours: {
        enabled: false,
        timezone: 'UTC',
        schedule: [
          { day: 'monday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'tuesday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'wednesday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'thursday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'friday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'saturday', enabled: true, startTime: '00:00', endTime: '23:59' },
          { day: 'sunday', enabled: true, startTime: '00:00', endTime: '23:59' },
        ],
        holidays: [],
      },
      appliesTo: {
        ticketTypes: ['incident'],
        channels: ['phone', 'chat'],
      },
      breachActions: {
        notifyAgents: true,
        notifySupervisors: true,
        autoEscalate: true,
        escalateTo: '1',
      },
      createdAt: new Date('2025-06-01T08:00:00'),
      updatedAt: new Date('2026-01-15T16:00:00'),
    },
  ];

  // Canned Response Categories
  private _cannedResponseCategories: CannedResponseCategory[] = [
    { id: 'cat-greetings', name: 'Greetings', color: '#3b82f6', icon: 'pi pi-comment' },
    { id: 'cat-closings', name: 'Closings', color: '#22c55e', icon: 'pi pi-check-circle' },
    { id: 'cat-troubleshooting', name: 'Troubleshooting', color: '#f59e0b', icon: 'pi pi-wrench' },
    { id: 'cat-billing', name: 'Billing', color: '#8b5cf6', icon: 'pi pi-credit-card' },
    { id: 'cat-technical', name: 'Technical', color: '#ef4444', icon: 'pi pi-cog' },
    { id: 'cat-general', name: 'General', color: '#6b7280', icon: 'pi pi-inbox' },
  ];

  // Canned Responses
  private _cannedResponses: CannedResponse[] = [
    {
      id: 'cr-1',
      title: 'Welcome Greeting',
      shortcut: '/hello',
      content: `<p>Hi {{customer_name}},</p>
<p>Thank you for reaching out to Flashdesk Support! My name is {{agent_name}}, and I'll be happy to assist you today.</p>
<p>I've reviewed your request and will do my best to help resolve this quickly.</p>`,
      categoryId: 'cat-greetings',
      isShared: true,
      createdBy: { id: '1', name: 'Amy Elsner' },
      createdAt: new Date('2025-06-15T10:00:00'),
      updatedAt: new Date('2026-01-20T14:30:00'),
    },
    {
      id: 'cr-2',
      title: 'Professional Greeting',
      shortcut: '/greet',
      content: `<p>Dear {{customer_name}},</p>
<p>Thank you for contacting Flashdesk Support regarding your inquiry.</p>
<p>I understand the importance of this matter and will work diligently to provide you with a resolution.</p>`,
      categoryId: 'cat-greetings',
      isShared: true,
      createdBy: { id: '2', name: 'Anna Fali' },
      createdAt: new Date('2025-07-10T09:00:00'),
      updatedAt: new Date('2026-02-05T11:00:00'),
    },
    {
      id: 'cr-3',
      title: 'Ticket Resolved',
      shortcut: '/resolved',
      content: `<p>Hi {{customer_name}},</p>
<p>Great news! I'm pleased to inform you that your issue has been resolved.</p>
<p>If you have any further questions or if the issue reoccurs, please don't hesitate to reach out. We're always here to help!</p>
<p>Thank you for your patience.</p>
<p>Best regards,<br>{{agent_name}}</p>`,
      categoryId: 'cat-closings',
      isShared: true,
      createdBy: { id: '1', name: 'Amy Elsner' },
      createdAt: new Date('2025-06-20T14:00:00'),
      updatedAt: new Date('2026-01-25T16:00:00'),
    },
    {
      id: 'cr-4',
      title: 'Request More Information',
      shortcut: '/moreinfo',
      content: `<p>Hi {{customer_name}},</p>
<p>Thank you for providing the details so far. To better assist you, could you please provide the following additional information?</p>
<ul>
<li>Steps to reproduce the issue</li>
<li>Any error messages you're seeing</li>
<li>Screenshot of the problem (if applicable)</li>
</ul>
<p>This will help us investigate and resolve your issue more quickly.</p>
<p>Thank you!</p>`,
      categoryId: 'cat-troubleshooting',
      isShared: true,
      createdBy: { id: '3', name: 'Asiya Javayant' },
      createdAt: new Date('2025-08-05T11:00:00'),
      updatedAt: new Date('2026-02-10T09:30:00'),
    },
    {
      id: 'cr-5',
      title: 'Clear Browser Cache',
      shortcut: '/cache',
      content: `<p>Hi {{customer_name}},</p>
<p>Many issues can be resolved by clearing your browser cache and cookies. Here's how:</p>
<p><strong>Chrome:</strong></p>
<ol>
<li>Click the three dots menu in the top right</li>
<li>Go to Settings → Privacy and security → Delete browsing data</li>
<li>Select "All time" and check "Cookies" and "Cached images"</li>
<li>Click "Delete data"</li>
</ol>
<p>After clearing, please restart your browser and try again.</p>
<p>Let me know if this helps!</p>`,
      categoryId: 'cat-troubleshooting',
      isShared: true,
      createdBy: { id: '4', name: 'Bernardo Dominic' },
      createdAt: new Date('2025-09-01T10:00:00'),
      updatedAt: new Date('2026-01-30T13:00:00'),
    },
    {
      id: 'cr-6',
      title: 'Invoice Request',
      shortcut: '/invoice',
      content: `<p>Hi {{customer_name}},</p>
<p>Thank you for your inquiry regarding your invoice.</p>
<p>You can access all your invoices directly from your account dashboard:</p>
<ol>
<li>Log in to your account</li>
<li>Navigate to Settings → Billing</li>
<li>Click on "Invoice History"</li>
</ol>
<p>If you need a specific invoice or have questions about a charge, please let me know the billing period and I'll be happy to assist.</p>`,
      categoryId: 'cat-billing',
      isShared: true,
      createdBy: { id: '2', name: 'Anna Fali' },
      createdAt: new Date('2025-08-15T14:00:00'),
      updatedAt: new Date('2026-02-01T10:00:00'),
    },
    {
      id: 'cr-7',
      title: 'Refund Policy',
      shortcut: '/refund',
      content: `<p>Hi {{customer_name}},</p>
<p>Thank you for reaching out about a refund.</p>
<p>Our refund policy allows for full refunds within 30 days of purchase. For refund requests:</p>
<ul>
<li>Within 30 days: Full refund, no questions asked</li>
<li>31-60 days: Prorated refund based on usage</li>
<li>After 60 days: Account credit for future billing</li>
</ul>
<p>Please confirm if you'd like to proceed with the refund request and I'll process it for you.</p>`,
      categoryId: 'cat-billing',
      isShared: true,
      createdBy: { id: '1', name: 'Amy Elsner' },
      createdAt: new Date('2025-09-20T09:00:00'),
      updatedAt: new Date('2026-02-15T11:30:00'),
    },
    {
      id: 'cr-8',
      title: 'API Rate Limits',
      shortcut: '/ratelimit',
      content: `<p>Hi {{customer_name}},</p>
<p>Thank you for your question about API rate limits.</p>
<p>Our current rate limits are:</p>
<ul>
<li><strong>Free tier:</strong> 100 requests/minute</li>
<li><strong>Professional:</strong> 1,000 requests/minute</li>
<li><strong>Enterprise:</strong> 10,000 requests/minute</li>
</ul>
<p>If you're hitting rate limits, consider implementing exponential backoff or upgrading your plan.</p>
<p>You can monitor your API usage in the Developer Dashboard.</p>`,
      categoryId: 'cat-technical',
      isShared: true,
      createdBy: { id: '5', name: 'Elwin Sharvill' },
      createdAt: new Date('2025-10-01T15:00:00'),
      updatedAt: new Date('2026-02-20T14:00:00'),
    },
    {
      id: 'cr-9',
      title: 'Password Reset Steps',
      shortcut: '/password',
      content: `<p>Hi {{customer_name}},</p>
<p>To reset your password, please follow these steps:</p>
<ol>
<li>Go to the login page</li>
<li>Click "Forgot Password?"</li>
<li>Enter your email address</li>
<li>Check your email for the reset link (check spam folder too)</li>
<li>Click the link and create a new password</li>
</ol>
<p>The reset link expires in 24 hours. If you don't receive the email within a few minutes, let me know and I can send it manually.</p>`,
      categoryId: 'cat-general',
      isShared: true,
      createdBy: { id: '3', name: 'Asiya Javayant' },
      createdAt: new Date('2025-10-15T11:00:00'),
      updatedAt: new Date('2026-03-01T09:00:00'),
    },
    {
      id: 'cr-10',
      title: 'Thank You & Closing',
      shortcut: '/thanks',
      content: `<p>Thank you for contacting Flashdesk Support!</p>
<p>If you have any other questions in the future, please don't hesitate to reach out. We're always happy to help.</p>
<p>Have a great day!</p>
<p>Best regards,<br>{{agent_name}}<br>Flashdesk Support Team</p>`,
      categoryId: 'cat-closings',
      isShared: true,
      createdBy: { id: '1', name: 'Amy Elsner' },
      createdAt: new Date('2025-06-15T10:30:00'),
      updatedAt: new Date('2026-01-10T08:00:00'),
    },
  ];

  // Getters
  getAgents(): Agent[] {
    return [...this._agents];
  }

  getCustomers(): Customer[] {
    return [...this._customers];
  }

  getTickets(): Ticket[] {
    return [...this._tickets];
  }

  getTicketById(id: string): Ticket | undefined {
    return this._tickets.find(t => t.ticketNumber.toString() === id);
  }

  getMessagesByTicketId(ticketId: string): Message[] {
    return this._messages.filter(m => m.ticketId === ticketId);
  }

  getHistoryByTicketId(ticketId: string): HistoryEntry[] {
    return this._history.filter(h => h.ticketId === ticketId);
  }

  // Knowledge Base Getters
  getKBCategories(): KBCategory[] {
    return [...this._kbCategories];
  }

  getKBCategoryBySlug(slug: string): KBCategory | undefined {
    return this._kbCategories.find(c => c.slug === slug);
  }

  getKBArticles(): KBArticle[] {
    return this._kbArticles
      .filter(a => a.status === 'published')
      .map(a => ({
        ...a,
        category: this._kbCategories.find(c => c.id === a.categoryId),
      }));
  }

  getKBArticleBySlug(slug: string): KBArticle | undefined {
    const article = this._kbArticles.find(a => a.slug === slug && a.status === 'published');
    if (article) {
      return {
        ...article,
        category: this._kbCategories.find(c => c.id === article.categoryId),
      };
    }
    return undefined;
  }

  getKBArticlesByCategory(categorySlug: string): KBArticle[] {
    const category = this._kbCategories.find(c => c.slug === categorySlug);
    if (!category) return [];
    return this._kbArticles
      .filter(a => a.categoryId === category.id && a.status === 'published')
      .map(a => ({ ...a, category }));
  }

  searchKBArticles(query: string): KBArticle[] {
    const lowerQuery = query.toLowerCase();
    return this._kbArticles
      .filter(a => 
        a.status === 'published' &&
        (a.title.toLowerCase().includes(lowerQuery) ||
         a.excerpt.toLowerCase().includes(lowerQuery) ||
         a.tags.some(t => t.toLowerCase().includes(lowerQuery)))
      )
      .map(a => ({
        ...a,
        category: this._kbCategories.find(c => c.id === a.categoryId),
      }));
  }

  getPopularKBArticles(limit: number = 5): KBArticle[] {
    return this._kbArticles
      .filter(a => a.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map(a => ({
        ...a,
        category: this._kbCategories.find(c => c.id === a.categoryId),
      }));
  }

  getRelatedKBArticles(articleSlug: string): KBArticle[] {
    const article = this._kbArticles.find(a => a.slug === articleSlug);
    if (!article || !article.relatedArticles) return [];
    return article.relatedArticles
      .map(id => this._kbArticles.find(a => a.id === id))
      .filter((a): a is KBArticle => !!a && a.status === 'published')
      .map(a => ({
        ...a,
        category: this._kbCategories.find(c => c.id === a.categoryId),
      }));
  }

  recordKBArticleView(slug: string): void {
    const article = this._kbArticles.find(a => a.slug === slug);
    if (article) {
      article.views++;
    }
  }

  recordKBArticleFeedback(slug: string, helpful: boolean): void {
    const article = this._kbArticles.find(a => a.slug === slug);
    if (article) {
      if (helpful) {
        article.helpful++;
      } else {
        article.notHelpful++;
      }
    }
  }

  createKBArticle(data: {
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tags: string[];
    status: 'published' | 'draft';
  }): KBArticle {
    const now = new Date();
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const article: KBArticle = {
      id: `kb-${Date.now()}`,
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId,
      author: {
        name: this.currentUser()?.name || 'Unknown',
        avatar: this.currentUser()?.avatar,
      },
      createdAt: now,
      updatedAt: now,
      views: 0,
      helpful: 0,
      notHelpful: 0,
      tags: data.tags,
      status: data.status,
    };

    this._kbArticles.unshift(article);

    // Update category article count
    const category = this._kbCategories.find(c => c.id === data.categoryId);
    if (category) {
      category.articleCount++;
    }

    return article;
  }

  updateKBArticle(slug: string, data: Partial<{
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    tags: string[];
    status: 'published' | 'draft';
  }>): KBArticle | null {
    const article = this._kbArticles.find(a => a.slug === slug);
    if (!article) return null;

    const oldCategoryId = article.categoryId;

    if (data.title !== undefined) article.title = data.title;
    if (data.excerpt !== undefined) article.excerpt = data.excerpt;
    if (data.content !== undefined) article.content = data.content;
    if (data.tags !== undefined) article.tags = data.tags;
    if (data.status !== undefined) article.status = data.status;
    if (data.categoryId !== undefined && data.categoryId !== oldCategoryId) {
      // Update category counts
      const oldCategory = this._kbCategories.find(c => c.id === oldCategoryId);
      const newCategory = this._kbCategories.find(c => c.id === data.categoryId);
      if (oldCategory) oldCategory.articleCount--;
      if (newCategory) newCategory.articleCount++;
      article.categoryId = data.categoryId;
    }

    article.updatedAt = new Date();
    return article;
  }

  deleteKBArticle(slug: string): boolean {
    const index = this._kbArticles.findIndex(a => a.slug === slug);
    if (index === -1) return false;

    const article = this._kbArticles[index];
    const category = this._kbCategories.find(c => c.id === article.categoryId);
    if (category) {
      category.articleCount--;
    }

    this._kbArticles.splice(index, 1);
    return true;
  }

  // SLA Policy Methods
  getSLAPolicies(): SLAPolicy[] {
    return [...this._slaPolicies];
  }

  getSLAPolicyById(id: string): SLAPolicy | undefined {
    return this._slaPolicies.find(p => p.id === id);
  }

  getDefaultSLAPolicy(): SLAPolicy | undefined {
    return this._slaPolicies.find(p => p.isDefault && p.isActive);
  }

  getActiveSLAPolicies(): SLAPolicy[] {
    return this._slaPolicies.filter(p => p.isActive);
  }

  createSLAPolicy(data: Omit<SLAPolicy, 'id' | 'createdAt' | 'updatedAt'>): SLAPolicy {
    const now = new Date();
    
    // If setting as default, unset other defaults
    if (data.isDefault) {
      this._slaPolicies.forEach(p => p.isDefault = false);
    }

    const policy: SLAPolicy = {
      ...data,
      id: `sla-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this._slaPolicies.push(policy);
    return policy;
  }

  updateSLAPolicy(id: string, data: Partial<Omit<SLAPolicy, 'id' | 'createdAt'>>): SLAPolicy | null {
    const policy = this._slaPolicies.find(p => p.id === id);
    if (!policy) return null;

    // If setting as default, unset other defaults
    if (data.isDefault) {
      this._slaPolicies.forEach(p => p.isDefault = false);
    }

    Object.assign(policy, data, { updatedAt: new Date() });
    return policy;
  }

  deleteSLAPolicy(id: string): boolean {
    const index = this._slaPolicies.findIndex(p => p.id === id);
    if (index === -1) return false;

    const policy = this._slaPolicies[index];
    if (policy.isDefault) return false; // Can't delete default policy

    this._slaPolicies.splice(index, 1);
    return true;
  }

  duplicateSLAPolicy(id: string): SLAPolicy | null {
    const original = this._slaPolicies.find(p => p.id === id);
    if (!original) return null;

    const now = new Date();
    const copy: SLAPolicy = {
      ...JSON.parse(JSON.stringify(original)),
      id: `sla-${Date.now()}`,
      name: `${original.name} (Copy)`,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };

    this._slaPolicies.push(copy);
    return copy;
  }

  // Canned Response Methods
  getCannedResponseCategories(): CannedResponseCategory[] {
    return this._cannedResponseCategories;
  }

  getCannedResponses(): CannedResponse[] {
    return this._cannedResponses.map(cr => ({
      ...cr,
      category: this._cannedResponseCategories.find(cat => cat.id === cr.categoryId),
    }));
  }

  searchCannedResponses(query: string): CannedResponse[] {
    const lowerQuery = query.toLowerCase();
    return this.getCannedResponses().filter(
      cr =>
        cr.title.toLowerCase().includes(lowerQuery) ||
        cr.shortcut.toLowerCase().includes(lowerQuery) ||
        cr.content.toLowerCase().includes(lowerQuery)
    );
  }

  getCannedResponsesByCategory(categoryId: string): CannedResponse[] {
    return this.getCannedResponses().filter(cr => cr.categoryId === categoryId);
  }

  getCannedResponseByShortcut(shortcut: string): CannedResponse | undefined {
    return this.getCannedResponses().find(cr => cr.shortcut === shortcut);
  }

  createCannedResponse(data: Omit<CannedResponse, 'id' | 'createdAt' | 'updatedAt' | 'category'>): CannedResponse {
    const now = new Date();
    const newResponse: CannedResponse = {
      ...data,
      id: `cr-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this._cannedResponses.push(newResponse);
    return {
      ...newResponse,
      category: this._cannedResponseCategories.find(cat => cat.id === newResponse.categoryId),
    };
  }

  updateCannedResponse(id: string, data: Partial<CannedResponse>): CannedResponse | null {
    const index = this._cannedResponses.findIndex(cr => cr.id === id);
    if (index === -1) return null;

    this._cannedResponses[index] = {
      ...this._cannedResponses[index],
      ...data,
      id,
      updatedAt: new Date(),
    };

    return {
      ...this._cannedResponses[index],
      category: this._cannedResponseCategories.find(cat => cat.id === this._cannedResponses[index].categoryId),
    };
  }

  deleteCannedResponse(id: string): boolean {
    const index = this._cannedResponses.findIndex(cr => cr.id === id);
    if (index === -1) return false;
    this._cannedResponses.splice(index, 1);
    return true;
  }

  duplicateCannedResponse(id: string): CannedResponse | null {
    const original = this._cannedResponses.find(cr => cr.id === id);
    if (!original) return null;

    const now = new Date();
    const copy: CannedResponse = {
      ...JSON.parse(JSON.stringify(original)),
      id: `cr-${Date.now()}`,
      title: `${original.title} (Copy)`,
      shortcut: `${original.shortcut}-copy`,
      createdAt: now,
      updatedAt: now,
    };

    this._cannedResponses.push(copy);
    return {
      ...copy,
      category: this._cannedResponseCategories.find(cat => cat.id === copy.categoryId),
    };
  }

  // Mutations
  createTicket(data: {
    subject: string;
    description: string;
    customer: Customer;
    type: Ticket['type'];
    priority: Ticket['priority'];
    assignedAgent?: Agent;
    followers?: Agent[];
    channel: Ticket['channel'];
    tags?: string[];
  }): Ticket {
    const now = new Date();
    const ticketNumber = this._tickets.length + 1;
    
    // Calculate SLA dates based on priority
    const slaHours = {
      urgent: 4,
      high: 8,
      medium: 24,
      low: 48,
    };
    const firstResponseDue = new Date(now.getTime() + slaHours[data.priority] * 60 * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + slaHours[data.priority] * 3 * 60 * 60 * 1000);

    const newTicket: Ticket = {
      id: `TKT-${String(ticketNumber).padStart(5, '0')}`,
      ticketNumber,
      subject: data.subject,
      description: data.description,
      customer: data.customer,
      type: data.type,
      status: 'open',
      priority: data.priority,
      assignedAgent: data.assignedAgent,
      followers: data.followers,
      createdAt: now,
      updatedAt: now,
      tags: data.tags || [],
      eta: slaHours[data.priority] * 3, // ETA in hours
      firstResponseDue,
      resolutionDue,
      channel: data.channel,
    };

    this._tickets.unshift(newTicket);
    
    // Add creation history entry
    this.addHistoryEntry(newTicket.id, {
      type: 'created',
      description: `Ticket created via ${data.channel}`,
      user: data.assignedAgent 
        ? { name: data.assignedAgent.name, avatar: data.assignedAgent.avatar }
        : { name: 'System' },
      ticketNumber: newTicket.ticketNumber,
      timestamp: now,
    });

    return newTicket;
  }

  updateTicket(ticketId: string, updates: Partial<Ticket>): Ticket | undefined {
    const index = this._tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      this._tickets[index] = { ...this._tickets[index], ...updates, updatedAt: new Date() };
      return this._tickets[index];
    }
    return undefined;
  }

  addMessage(ticketId: string, message: Omit<Message, 'id' | 'ticketId'>): Message {
    const newMessage: Message = {
      ...message,
      id: `m-${Date.now()}`,
      ticketId,
    };
    this._messages.push(newMessage);
    
    // Update ticket's updatedAt
    this.updateTicket(ticketId, { updatedAt: new Date() });
    
    return newMessage;
  }

  addHistoryEntry(ticketId: string, entry: Omit<HistoryEntry, 'id' | 'ticketId'>): HistoryEntry {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `h-${Date.now()}`,
      ticketId,
    };
    this._history.push(newEntry);
    return newEntry;
  }

  deleteTickets(ticketIds: string[]): void {
    this._tickets = this._tickets.filter(t => !ticketIds.includes(t.id));
  }

  bulkUpdateTickets(ticketIds: string[], updates: Partial<Ticket>): void {
    ticketIds.forEach(id => this.updateTicket(id, updates));
  }

  // Dashboard Stats
  getTicketCountsByStatus(): { status: string; count: number; label: string }[] {
    const statusLabels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'waiting': 'Waiting',
      'resolved': 'Resolved',
      'closed': 'Closed',
    };
    
    const counts: Record<string, number> = {
      'open': 0,
      'in-progress': 0,
      'waiting': 0,
      'resolved': 0,
      'closed': 0,
    };
    
    this._tickets.forEach(t => {
      const status = t.status.replace('_', '-');
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      label: statusLabels[status] || status,
    }));
  }

  getTicketsCreatedOverTime(days: number = 14): { date: string; count: number }[] {
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = this._tickets.filter(t => {
        const ticketDate = t.createdAt.toISOString().split('T')[0];
        return ticketDate === dateStr;
      }).length;
      
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }
    
    return result;
  }

  getTicketsResolvedOverTime(days: number = 14): { date: string; count: number }[] {
    const result: { date: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const count = this._tickets.filter(t => {
        if (!t.resolvedAt) return false;
        return t.resolvedAt.toISOString().split('T')[0] === dateStr;
      }).length;

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    return result;
  }

  getSLACompliance(): { firstResponse: number; resolution: number; overall: number } {
    const ticketsWithSLA = this._tickets.filter(t => t.firstResponseDue && t.resolutionDue);
    if (ticketsWithSLA.length === 0) {
      return { firstResponse: 100, resolution: 100, overall: 100 };
    }
    
    let firstResponseMet = 0;
    let resolutionMet = 0;
    
    ticketsWithSLA.forEach(t => {
      // First response SLA
      if (t.firstResponseAt) {
        if (t.firstResponseAt <= t.firstResponseDue) {
          firstResponseMet++;
        }
      } else if (new Date() <= t.firstResponseDue) {
        firstResponseMet++; // Still within SLA
      }
      
      // Resolution SLA
      if (t.resolvedAt) {
        if (t.resolvedAt <= t.resolutionDue) {
          resolutionMet++;
        }
      } else if (t.status !== 'resolved' && t.status !== 'closed' && new Date() <= t.resolutionDue) {
        resolutionMet++; // Still within SLA
      }
    });
    
    const firstResponse = Math.round((firstResponseMet / ticketsWithSLA.length) * 100);
    const resolution = Math.round((resolutionMet / ticketsWithSLA.length) * 100);
    const overall = Math.round((firstResponse + resolution) / 2);
    
    return { firstResponse, resolution, overall };
  }

  getTopAgentsByResolvedTickets(limit: number = 5): { agent: Agent; resolvedCount: number }[] {
    const agentCounts: Map<string, number> = new Map();
    
    this._tickets
      .filter(t => (t.status === 'resolved' || t.status === 'closed') && t.assignedAgent)
      .forEach(t => {
        const agentId = t.assignedAgent!.id;
        agentCounts.set(agentId, (agentCounts.get(agentId) || 0) + 1);
      });
    
    return Array.from(agentCounts.entries())
      .map(([agentId, count]) => ({
        agent: this._agents.find(a => a.id === agentId)!,
        resolvedCount: count,
      }))
      .filter(item => item.agent)
      .sort((a, b) => b.resolvedCount - a.resolvedCount)
      .slice(0, limit);
  }

  getRecentActivity(limit: number = 10): HistoryEntry[] {
    // Combine tickets and history for recent activity
    const activities: HistoryEntry[] = [];
    
    // Add recent ticket creations
    this._tickets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .forEach(t => {
        activities.push({
          id: `created-${t.id}`,
          ticketId: t.id,
          ticketNumber: t.ticketNumber,
          type: 'created',
          description: `Ticket ${t.id} created: ${t.subject.substring(0, 50)}${t.subject.length > 50 ? '...' : ''}`,
          user: { name: t.customer.name },
          timestamp: t.createdAt,
        });
      });
    
    // Add history entries
    this._history.forEach(h => {
      activities.push(h);
    });
    
    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getDashboardSummary() {
    const tickets = this._tickets;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const totalOpen = tickets.filter(t => t.status === 'open' || t.status === 'in-progress' || t.status === 'waiting').length;
    const resolvedToday = tickets.filter(t => 
      (t.status === 'resolved' || t.status === 'closed') && 
      t.resolvedAt && 
      t.resolvedAt >= todayStart
    ).length;
    const unassigned = tickets.filter(t => !t.assignedAgent && t.status !== 'closed' && t.status !== 'resolved').length;
    const overdueTickets = tickets.filter(t => 
      t.status !== 'resolved' && 
      t.status !== 'closed' && 
      new Date() > t.resolutionDue
    ).length;
    
    // Calculate average response time from responded tickets
    const respondedTickets = tickets.filter(t => t.firstResponseAt);
    let avgResponseHours = 0;
    if (respondedTickets.length > 0) {
      const totalResponseMs = respondedTickets.reduce((sum, t) => {
        return sum + (t.firstResponseAt!.getTime() - t.createdAt.getTime());
      }, 0);
      avgResponseHours = Math.round((totalResponseMs / respondedTickets.length) / (1000 * 60 * 60) * 10) / 10;
    }
    
    return {
      totalOpen,
      resolvedToday,
      unassigned,
      overdueTickets,
      avgResponseHours,
      totalTickets: tickets.length,
    };
  }
}
