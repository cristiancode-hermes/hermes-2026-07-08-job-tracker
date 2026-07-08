import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../shared/services/application.service';
import { CompanyService } from '../../shared/services/company.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { JobApplication, Company, APPLICATION_STATUSES } from '../../shared/models';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe, FormsModule, StatusBadgeComponent, LoadingSkeletonComponent, EmptyStateComponent, ModalComponent, ErrorBannerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Applications</h1>
        <button (click)="showCreateModal.set(true)" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Application
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 max-w-xs">
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="searchQuery.set($event); filterApps()"
            placeholder="Search applications..."
            class="pl-10"
          />
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="statusFilter.set($event); filterApps()" class="w-auto">
          <option value="">All Statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s | titlecase }}</option>
          }
        </select>
        <div class="flex gap-1 ml-auto">
          <button (click)="viewMode.set('kanban')" class="btn-ghost text-sm" [class.bg-secondary-100!]="viewMode() === 'kanban'">
            <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </button>
          <button (click)="viewMode.set('list')" class="btn-ghost text-sm" [class.bg-secondary-100!]="viewMode() === 'list'">
            <svg class="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>
      </div>

      <!-- Error -->
      <app-error-banner [message]="appService.error()" (dismiss)="appService.error.set(null)" />

      @if (appService.loading()) {
        <app-loading-skeleton [rows]="6" />
      } @else if (filteredApps().length === 0) {
        <app-empty-state title="No applications found" description="Create your first job application to get started">
          <button (click)="showCreateModal.set(true)" class="btn-primary">Create Application</button>
        </app-empty-state>
      } @else if (viewMode() === 'kanban') {
        <!-- Kanban View -->
        <div class="flex gap-4 overflow-x-auto pb-4">
          @for (status of statuses; track status) {
            <div class="min-w-[260px] flex-shrink-0">
              <div class="card p-3">
                <h3 class="text-sm font-semibold text-secondary-600 uppercase tracking-wider mb-3">{{ status }}</h3>
                <div class="space-y-2 min-h-[100px]">
                  @for (app of getAppsByStatus(status); track app.id) {
                    <div class="kanban-card" [routerLink]="['/applications', app.id]">
                      <p class="font-medium text-sm text-secondary-900 dark:text-secondary-200">{{ app.title }}</p>
                      @if (app.company) {
                        <p class="text-xs text-secondary-500 mt-0.5">{{ app.company.name }}</p>
                      }
                      @if (app.location) {
                        <p class="text-xs text-secondary-400 mt-0.5">{{ app.location }}</p>
                      }
                    </div>
                  } @empty {
                    <p class="text-xs text-secondary-400 text-center py-4">No applications</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- List View -->
        <div class="card p-0 overflow-hidden">
          <table class="w-full">
            <thead>
              <tr class="border-b border-secondary-200 dark:border-secondary-200 bg-secondary-50 dark:bg-secondary-200">
                <th class="text-left px-4 py-3 text-xs font-medium text-secondary-500 uppercase">Title</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-secondary-500 uppercase">Company</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-secondary-500 uppercase">Status</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-secondary-500 uppercase">Location</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-secondary-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-secondary-100 dark:divide-secondary-200">
              @for (app of filteredApps(); track app.id) {
                <tr class="hover:bg-secondary-50 dark:hover:bg-secondary-200 cursor-pointer" [routerLink]="['/applications', app.id]">
                  <td class="px-4 py-3 text-sm font-medium text-secondary-900 dark:text-secondary-200">{{ app.title }}</td>
                  <td class="px-4 py-3 text-sm text-secondary-600">{{ app.company?.name || '-' }}</td>
                  <td class="px-4 py-3"><app-status-badge [status]="app.status" /></td>
                  <td class="px-4 py-3 text-sm text-secondary-500">{{ app.location || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-secondary-400">{{ app.updatedAt | date:'MMM d' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Create Modal -->
    <app-modal [isOpen]="showCreateModal()" title="New Application" (close)="showCreateModal.set(false)">
      <form (ngSubmit)="createApplication()" class="space-y-4">
        <app-error-banner [message]="createError()" (dismiss)="createError.set(null)" />
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Company</label>
          <select [(ngModel)]="newApp.companyId" name="companyId" required class="w-full">
            <option value="">Select company...</option>
            @for (c of companies(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Job Title</label>
          <input type="text" [(ngModel)]="newApp.title" name="title" required placeholder="e.g. Senior Frontend Engineer" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Salary</label>
            <input type="text" [(ngModel)]="newApp.salary" name="salary" placeholder="e.g. $120k-150k" />
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Location</label>
            <input type="text" [(ngModel)]="newApp.location" name="location" placeholder="e.g. Remote" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">URL</label>
          <input type="url" [(ngModel)]="newApp.url" name="url" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</label>
          <textarea [(ngModel)]="newApp.notes" name="notes" rows="2" placeholder="Any notes..."></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="showCreateModal.set(false)" class="btn-secondary">Cancel</button>
          <button type="submit" [disabled]="creating()" class="btn-primary">
            {{ creating() ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ApplicationsComponent implements OnInit {
  readonly appService = inject(ApplicationService);
  readonly #companyService = inject(CompanyService);
  readonly #router = inject(Router);

  readonly viewMode = signal<'kanban' | 'list'>('kanban');
  readonly searchQuery = signal('');
  readonly statusFilter = signal('');
  readonly showCreateModal = signal(false);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly companies = signal<Company[]>([]);
  readonly filteredApps = signal<JobApplication[]>([]);

  readonly statuses = APPLICATION_STATUSES;

  newApp: Partial<JobApplication> & { companyId: string } = {
    companyId: '',
    title: '',
    salary: '',
    location: '',
    url: '',
    notes: '',
  };

  ngOnInit(): void {
    this.appService.fetchApplications();
    this.#companyService.getAll().subscribe({
      next: (data) => this.companies.set(data),
    });
  }

  filterApps(): void {
    const query = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    const all = this.appService.applications();
    this.filteredApps.set(
      all.filter((app) => {
        const matchSearch =
          !query ||
          app.title.toLowerCase().includes(query) ||
          app.company?.name?.toLowerCase().includes(query);
        const matchStatus = !status || app.status === status;
        return matchSearch && matchStatus;
      })
    );
  }

  getAppsByStatus(status: string): JobApplication[] {
    return this.filteredApps().filter((a) => a.status === status);
  }

  createApplication(): void {
    if (!this.newApp.companyId || !this.newApp.title) return;
    this.creating.set(true);
    this.createError.set(null);

    this.appService.create(this.newApp as any).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.creating.set(false);
        this.newApp = { companyId: '', title: '', salary: '', location: '', url: '', notes: '' };
        this.appService.fetchApplications();
      },
      error: (err) => {
        this.createError.set(err.error?.message || 'Failed to create application');
        this.creating.set(false);
      },
    });
  }
}
