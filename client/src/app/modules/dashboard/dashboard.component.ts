import { Component, inject, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardApiService, DashboardSummary, ActivityEntry, AttentionTicket, TopPerformer } from '../../core/services/dashboard-api.service';
import { MockDataService, Agent, HistoryEntry, Ticket } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    SkeletonModule,
    SelectModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ticketVolumeChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private dashboardApi = inject(DashboardApiService);
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);

  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  isLoading = signal(true);
  currentDate = new Date();
  Math = Math;

  // Chart time range
  chartRange = signal(14);
  chartRangeOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 14 days', value: 14 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Last year', value: 365 },
  ];

  // Greeting based on time of day
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  summary: DashboardSummary = {
    totalOpen: 0,
    resolvedToday: 0,
    unassigned: 0,
    overdueTickets: 0,
    avgResponseHours: 0,
    totalTickets: 0,
    sla: { firstResponse: 0, resolution: 0, overall: 0 },
  };

  // My assigned tickets (agents) / needs attention (admins)
  myTickets: AttentionTicket[] = [];
  unassignedTickets: AttentionTicket[] = [];
  escalatedTickets: AttentionTicket[] = [];

  statusCounts: { status: string; count: number; label: string }[] = [];
  ticketsOverTime: { date: string; count: number }[] = [];
  resolvedOverTime: { date: string; count: number }[] = [];
  slaCompliance = { firstResponse: 0, resolution: 0, overall: 0 };
  topAgents: TopPerformer[] = [];
  recentActivity: ActivityEntry[] = [];

  private maxTicketCount = 0;
  private maxAgentResolved = 0;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.chart?.destroy();
  }

  loadDashboardData() {
    console.log(`lloadinf`, );
    this.isLoading.set(true);

    // Load summary from real API
    this.dashboardApi.getSummary()
      .then(data => {
        this.summary = data;
        this.slaCompliance = data.sla;
      })
      .catch(() => {
        // Fallback to mock data if API fails
        const mock = this.mockData.getDashboardSummary();
        this.summary = { ...mock, sla: this.mockData.getSLACompliance() };
        this.slaCompliance = this.mockData.getSLACompliance();
      })
      .finally(() => {
        // Load remaining data from mock (until those APIs are built)
        this.statusCounts = this.mockData.getTicketCountsByStatus();
        this.ticketsOverTime = this.mockData.getTicketsCreatedOverTime(this.chartRange());
        this.resolvedOverTime = this.mockData.getTicketsResolvedOverTime(this.chartRange());

        // Load top performers from API
        this.dashboardApi.getTopPerformers(5)
          .then(data => {
            this.topAgents = data;
            this.maxAgentResolved = Math.max(...this.topAgents.map(a => a.resolvedCount), 1);
          })
          .catch(() => {});

        // Load recent activity from API
        this.dashboardApi.getRecentActivity(10)
          .then(data => this.recentActivity = data)
          .catch(() => {});

        // Load needs-attention tickets from API
        this.dashboardApi.getNeedsAttention()
          .then(data => {
            this.unassignedTickets = data.unassigned;
            this.escalatedTickets = data.escalated;
            this.myTickets = data.myTickets;
          })
          .catch(() => {});

      // Calculate max values for bar charts
      this.maxTicketCount = Math.max(...this.ticketsOverTime.map(d => d.count), 1);
      
      this.isLoading.set(false);

      // Build chart after data loads
      setTimeout(() => this.buildChart(), 0);
      });
  }

  private buildChart() {
    if (!this.chartCanvas) return;
    this.chart?.destroy();

    const labels = this.ticketsOverTime.map(d => d.date);
    const createdData = this.ticketsOverTime.map(d => d.count);
    const resolvedData = this.resolvedOverTime.map(d => d.count);

    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#4F46E5';
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;

    // Gradient fill for created line
    const createdGradient = ctx.createLinearGradient(0, 0, 0, 220);
    createdGradient.addColorStop(0, primaryColor + '30');
    createdGradient.addColorStop(1, primaryColor + '00');

    // Gradient fill for resolved line
    const resolvedGradient = ctx.createLinearGradient(0, 0, 0, 220);
    resolvedGradient.addColorStop(0, '#22C55E30');
    resolvedGradient.addColorStop(1, '#22C55E00');

    const textMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#9CA3AF';
    const borderDefault = getComputedStyle(document.documentElement).getPropertyValue('--border-default').trim() || '#E5E7EB';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Created',
            data: createdData,
            borderColor: primaryColor,
            backgroundColor: createdGradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: primaryColor,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
          {
            label: 'Resolved',
            data: resolvedData,
            borderColor: '#22C55E',
            backgroundColor: resolvedGradient,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#22C55E',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 12, weight: 'normal' },
            bodyFont: { size: 13, weight: 'bold' },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: textMuted,
              font: { size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7,
            },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: borderDefault + '40',
            },
            ticks: {
              color: textMuted,
              font: { size: 11 },
              stepSize: 1,
              padding: 8,
            },
            border: { display: false },
          },
        },
      },
    });
  }

  refreshData() {
    this.loadDashboardData();
    this.toast.success('Refreshed', 'Dashboard data has been refreshed');
  }

  onChartRangeChange(days: number) {
    this.chartRange.set(days);
    this.ticketsOverTime = this.mockData.getTicketsCreatedOverTime(days);
    this.resolvedOverTime = this.mockData.getTicketsResolvedOverTime(days);
    this.buildChart();
  }

  // Status helpers
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'open': 'pi pi-inbox',
      'in-progress': 'pi pi-cog',
      'waiting': 'pi pi-clock',
      'resolved': 'pi pi-check-circle',
      'closed': 'pi pi-lock',
    };
    return icons[status] || 'pi pi-circle';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'open': 'text-blue-500',
      'in-progress': 'text-amber-500',
      'waiting': 'text-orange-500',
      'resolved': 'text-green-500',
      'closed': 'text-gray-500',
    };
    return colors[status] || 'text-gray-500';
  }

  getStatusBarColor(status: string): string {
    const colors: Record<string, string> = {
      'open': 'bg-blue-500',
      'in-progress': 'bg-amber-500',
      'waiting': 'bg-orange-500',
      'resolved': 'bg-green-500',
      'closed': 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  }

  getStatusPercentage(count: number): number {
    const total = this.summary.totalTickets;
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  // Chart helpers
  getBarHeight(count: number): number {
    if (this.maxTicketCount === 0) return 0;
    const maxHeight = 160;
    return Math.max((count / this.maxTicketCount) * maxHeight, count > 0 ? 8 : 0);
  }

  getAgentBarWidth(count: number): number {
    if (this.maxAgentResolved === 0) return 0;
    return (count / this.maxAgentResolved) * 100;
  }

  // SLA helpers
  getSLAColor(percentage: number): string {
    if (percentage >= 80) return '#22C55E'; // green
    if (percentage >= 60) return '#F59E0B'; // amber
    return '#EF4444'; // red
  }

  // Activity helpers
  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      'created': 'pi pi-plus',
      'status_changed': 'pi pi-sync',
      'priority_changed': 'pi pi-flag',
      'assigned': 'pi pi-user',
      'reply': 'pi pi-comment',
      'note': 'pi pi-file-edit',
      'updated': 'pi pi-pencil',
    };
    return icons[type] || 'pi pi-circle';
  }

  getActivityIconBg(type: string): string {
    const bgs: Record<string, string> = {
      'created': 'bg-blue-100 dark:bg-blue-900/30',
      'status_changed': 'bg-purple-100 dark:bg-purple-900/30',
      'priority_changed': 'bg-orange-100 dark:bg-orange-900/30',
      'assigned': 'bg-green-100 dark:bg-green-900/30',
      'reply': 'bg-cyan-100 dark:bg-cyan-900/30',
      'note': 'bg-amber-100 dark:bg-amber-900/30',
      'updated': 'bg-gray-100 dark:bg-gray-700',
    };
    return bgs[type] || 'bg-gray-100 dark:bg-gray-700';
  }

  getActivityIconColor(type: string): string {
    const colors: Record<string, string> = {
      'created': 'text-blue-600',
      'status_changed': 'text-purple-600',
      'priority_changed': 'text-orange-600',
      'assigned': 'text-green-600',
      'reply': 'text-cyan-600',
      'note': 'text-amber-600',
      'updated': 'text-gray-600',
    };
    return colors[type] || 'text-gray-600';
  }

  formatTimeAgo(dateInput: Date | string): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Shortcut helpers
  getStatusCount(status: string): number {
    const found = this.statusCounts.find(s => s.status === status);
    return found?.count ?? 0;
  }

  getUrgentCount(): number {
    return this.mockData.getTickets().filter(t => 
      t.priority === 'urgent' && 
      t.status !== 'resolved' && 
      t.status !== 'closed'
    ).length;
  }

  // Priority helpers
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      'urgent': 'text-red-600',
      'high': 'text-orange-500',
      'medium': 'text-yellow-500',
      'low': 'text-blue-500',
    };
    return colors[priority] || 'text-gray-500';
  }

  getPriorityBg(priority: string): string {
    const bgs: Record<string, string> = {
      'urgent': 'bg-red-100 dark:bg-red-900/30',
      'high': 'bg-orange-100 dark:bg-orange-900/30',
      'medium': 'bg-yellow-100 dark:bg-yellow-900/30',
      'low': 'bg-blue-100 dark:bg-blue-900/30',
    };
    return bgs[priority] || 'bg-gray-100 dark:bg-gray-700';
  }

  getPriorityLabel(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'waiting': 'Waiting',
      'resolved': 'Resolved',
      'closed': 'Closed',
    };
    return labels[status] || status;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
