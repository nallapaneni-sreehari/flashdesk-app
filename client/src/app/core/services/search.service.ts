import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  type: 'navigation' | 'ticket' | 'customer' | 'agent' | 'action';
  icon: string;
  title: string;
  subtitle?: string;
  route?: string;
  queryParams?: Record<string, string>;
}

export interface SearchResultGroup {
  label: string;
  type: string;
  results: SearchResult[];
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  isOpen = signal(false);

  private quickActions: SearchResult[] = [
    { id: 'action-1', type: 'action', icon: 'pi pi-plus', title: 'New Ticket', subtitle: 'Create a new support ticket', route: '/tickets', queryParams: { action: 'new' } },
    { id: 'action-2', type: 'action', icon: 'pi pi-user-plus', title: 'Assign Tickets', subtitle: 'View unassigned tickets', route: '/tickets', queryParams: { filter: 'unassigned' } },
    { id: 'action-3', type: 'action', icon: 'pi pi-users', title: 'Manage Team', subtitle: 'Agent management', route: '/agents' },
    { id: 'action-4', type: 'action', icon: 'pi pi-list', title: 'All Tickets', subtitle: 'View all tickets', route: '/tickets' },
  ];

  private mockData: SearchResult[] = [
    // Navigation
    { id: 'nav-1', type: 'navigation', icon: 'pi pi-home', title: 'Dashboard', route: '/dashboard' },
    { id: 'nav-2', type: 'navigation', icon: 'pi pi-ticket', title: 'Tickets', route: '/tickets' },
    { id: 'nav-3', type: 'navigation', icon: 'pi pi-users', title: 'Customers', route: '/customers' },
    { id: 'nav-4', type: 'navigation', icon: 'pi pi-user', title: 'Agents', route: '/agents' },
    { id: 'nav-5', type: 'navigation', icon: 'pi pi-book', title: 'Knowledge Base', route: '/knowledge-base' },
    { id: 'nav-6', type: 'navigation', icon: 'pi pi-cog', title: 'Settings', route: '/settings' },
    // Tickets
    { id: 'ticket-1', type: 'ticket', icon: 'pi pi-ticket', title: 'Unable to login to dashboard', subtitle: '#TKT-001 • Open' },
    { id: 'ticket-2', type: 'ticket', icon: 'pi pi-ticket', title: 'Payment processing error', subtitle: '#TKT-002 • In Progress' },
    { id: 'ticket-3', type: 'ticket', icon: 'pi pi-ticket', title: 'Feature request: Dark mode', subtitle: '#TKT-003 • Pending' },
    // Customers
    { id: 'cust-1', type: 'customer', icon: 'pi pi-user', title: 'John Smith', subtitle: 'john.smith@example.com' },
    { id: 'cust-2', type: 'customer', icon: 'pi pi-user', title: 'Sarah Johnson', subtitle: 'sarah.j@company.com' },
    { id: 'cust-3', type: 'customer', icon: 'pi pi-user', title: 'Mike Wilson', subtitle: 'mike.wilson@startup.io' },
    // Agents
    { id: 'agent-1', type: 'agent', icon: 'pi pi-id-card', title: 'Alice Cooper', subtitle: 'Support Lead' },
    { id: 'agent-2', type: 'agent', icon: 'pi pi-id-card', title: 'Bob Martinez', subtitle: 'Senior Agent' },
    { id: 'agent-3', type: 'agent', icon: 'pi pi-id-card', title: 'Carol Davis', subtitle: 'Agent' },
  ];

  constructor() {
    this.initKeyboardShortcut();
  }

  private initKeyboardShortcut() {
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(filter((e) => (e.metaKey || e.ctrlKey) && e.key === 'k'))
      .subscribe((e) => {
        e.preventDefault();
        this.toggle();
      });
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  search(query: string): SearchResultGroup[] {
    if (!query.trim()) {
      const actionGroup: SearchResultGroup = { label: 'Quick Actions', type: 'action', results: this.quickActions };
      return [actionGroup, ...this.getGroupedResults(this.mockData)];
    }

    const lowerQuery = query.toLowerCase();
    const allItems = [...this.quickActions, ...this.mockData];
    const filtered = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );

    return this.getGroupedResults(filtered);
  }

  private getGroupedResults(results: SearchResult[]): SearchResultGroup[] {
    const groups: SearchResultGroup[] = [];

    const typeLabels: Record<string, string> = {
      action: 'Quick Actions',
      navigation: 'Navigation',
      ticket: 'Tickets',
      customer: 'Customers',
      agent: 'Agents',
    };

    const typeOrder = ['action', 'navigation', 'ticket', 'customer', 'agent'];

    for (const type of typeOrder) {
      const typeResults = results.filter((r) => r.type === type);
      if (typeResults.length > 0) {
        groups.push({
          label: typeLabels[type],
          type,
          results: typeResults,
        });
      }
    }

    return groups;
  }
}
