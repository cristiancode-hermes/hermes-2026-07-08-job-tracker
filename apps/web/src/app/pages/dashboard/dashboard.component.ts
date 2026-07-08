import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { DashboardService } from '../../shared/services/dashboard.service';
import { SseService } from '../../shared/services/sse.service';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DashboardKPI, StatusCount, Interview, ActivityItem } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe, LoadingSkeletonComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Dashboard</h1>
      </div>

      @if (loading()) {
        <app-loading-skeleton [rows]="6" />
      } @else if (error()) {
        <div class="bg-danger-50 dark:bg-danger-50/10 border border-danger-200 rounded-lg p-4 text-danger-700 dark:text-danger-400">
          {{ error() }}
        </div>
      } @else {
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="card">
            <p class="text-sm text-secondary-500">Total Applications</p>
            <p class="text-3xl font-bold text-secondary-900 dark:text-secondary-200 mt-1">{{ kpis().totalApps }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-secondary-500">In Progress</p>
            <p class="text-3xl font-bold text-amber-600 mt-1">{{ kpis().inProgress }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-secondary-500">Interviews</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ kpis().interviews }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-secondary-500">Response Rate</p>
            <p class="text-3xl font-bold text-primary-600 mt-1">{{ kpis().responseRate }}%</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Status Distribution -->
          <div class="card lg:col-span-2">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Status Distribution</h2>
            @if (statusDistribution().length === 0) {
              <app-empty-state title="No data yet" description="Start by adding your first application" />
            } @else {
              <div class="space-y-3">
                @for (item of statusDistribution(); track item.status) {
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-secondary-600">{{ item.status | titlecase }}</span>
                      <span class="font-medium text-secondary-800 dark:text-secondary-300">{{ item.count }}</span>
                    </div>
                    <div class="w-full bg-secondary-200 dark:bg-secondary-300 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-500"
                        [class]="getStatusBarColor(item.status)"
                        [style.width.%]="getBarPercent(item.count)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right column -->
          <div class="space-y-6">
            <!-- Upcoming Interviews -->
            <div class="card">
              <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Upcoming Interviews</h2>
              @if (upcomingInterviews().length === 0) {
                <app-empty-state title="No upcoming interviews" description="Schedule your first interview" />
              } @else {
                <div class="space-y-3">
                  @for (interview of upcomingInterviews(); track interview.id) {
                    <div class="flex items-start gap-3 p-3 rounded-lg bg-secondary-50 dark:bg-secondary-200">
                      <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-secondary-900 dark:text-secondary-200 truncate">{{ interview.type }}</p>
                        <p class="text-xs text-secondary-500">{{ interview.dateTime | date:'MMM d, h:mm a' }}</p>
                        @if (interview.company) {
                          <p class="text-xs text-secondary-400">{{ interview.company.name }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Recent Activity -->
            <div class="card">
              <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Recent Activity</h2>
              @if (recentActivity().length === 0) {
                <app-empty-state title="No recent activity" />
              } @else {
                <div class="space-y-2">
                  @for (activity of recentActivity(); track activity.id) {
                    <div class="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-200 last:border-0">
                      <div class="min-w-0">
                        <p class="text-sm text-secondary-800 dark:text-secondary-300 truncate">{{ activity.title }}</p>
                        <p class="text-xs text-secondary-400">{{ activity.companyName }}</p>
                      </div>
                      <app-status-badge [status]="activity.status" />
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly #dashboard = inject(DashboardService);
  readonly #sse = inject(SseService);

  readonly kpis = signal<DashboardKPI>({ totalApps: 0, inProgress: 0, interviews: 0, responseRate: 0 });
  readonly statusDistribution = signal<StatusCount[]>([]);
  readonly upcomingInterviews = signal<Interview[]>([]);
  readonly recentActivity = signal<ActivityItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  maxCount = 1;

  ngOnInit(): void {
    this.loadData();
    this.#sse.connect();
  }

  ngOnDestroy(): void {
    this.#sse.disconnect();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.#dashboard.getKpis().subscribe({
      next: (data) => this.kpis.set(data),
      error: () => {},
    });

    this.#dashboard.getStatusDistribution().subscribe({
      next: (data) => {
        this.statusDistribution.set(data);
        this.maxCount = Math.max(...data.map((s) => s.count), 1);
      },
      error: () => {},
    });

    this.#dashboard.getUpcomingInterviews().subscribe({
      next: (data) => this.upcomingInterviews.set(data),
      error: () => {},
    });

    this.#dashboard.getRecentActivity().subscribe({
      next: (data) => this.recentActivity.set(data),
      error: () => {},
      complete: () => this.loading.set(false),
    });
  }

  getBarPercent(count: number): number {
    return (count / this.maxCount) * 100;
  }

  getStatusBarColor(status: string): string {
    const colors: Record<string, string> = {
      saved: 'bg-secondary-400',
      applied: 'bg-blue-500',
      screening: 'bg-purple-500',
      interview: 'bg-amber-500',
      offer: 'bg-green-500',
      accepted: 'bg-emerald-500',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-500',
    };
    return colors[status] || 'bg-primary-500';
  }
}
