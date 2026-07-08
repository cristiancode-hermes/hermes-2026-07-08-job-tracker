import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../shared/services/company.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Company } from '../../shared/models';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [RouterLink, FormsModule, ModalComponent, LoadingSkeletonComponent, EmptyStateComponent, ErrorBannerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Companies</h1>
        <button (click)="showCreateModal.set(true)" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Company
        </button>
      </div>

      <!-- Search -->
      <div class="relative max-w-xs">
        <svg class="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)" placeholder="Search companies..." class="pl-10" />
      </div>

      <app-error-banner [message]="companyService.error()" (dismiss)="companyService.error.set(null)" />

      @if (companyService.loading()) {
        <app-loading-skeleton [rows]="5" />
      } @else if (companyService.companies().length === 0) {
        <app-empty-state title="No companies yet" description="Add your first company to start tracking">
          <button (click)="showCreateModal.set(true)" class="btn-primary">Add Company</button>
        </app-empty-state>
      } @else {
        <div class="grid gap-4">
          @for (company of companyService.companies(); track company.id) {
            <div class="card cursor-pointer hover:shadow-md transition-shadow" [routerLink]="['/companies', company.id]">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-secondary-900 dark:text-secondary-200">{{ company.name }}</h3>
                  @if (company.location) {
                    <p class="text-sm text-secondary-500 mt-0.5">{{ company.location }}</p>
                  }
                  @if (company.website) {
                    <a [href]="company.website" target="_blank" class="text-sm text-primary-600 hover:underline mt-0.5 inline-block">{{ company.website }}</a>
                  }
                </div>
                <div class="flex items-center gap-3 text-sm text-secondary-500">
                  @if (company.applications) {
                    <span>{{ company.applications.length }} application(s)</span>
                    <span class="text-green-600">{{ getActiveCount(company) }} active</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Modal -->
    <app-modal [isOpen]="showCreateModal()" title="Add Company" (close)="showCreateModal.set(false)">
      <form (ngSubmit)="createCompany()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Company Name *</label>
          <input type="text" [(ngModel)]="newCompany.name" name="name" required placeholder="e.g. Acme Corp" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Website</label>
          <input type="url" [(ngModel)]="newCompany.website" name="website" placeholder="https://..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Location</label>
          <input type="text" [(ngModel)]="newCompany.location" name="location" placeholder="e.g. San Francisco, CA" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Name</label>
          <input type="text" [(ngModel)]="newCompany.contactName" name="contactName" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Email</label>
          <input type="email" [(ngModel)]="newCompany.contactEmail" name="contactEmail" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</label>
          <textarea [(ngModel)]="newCompany.notes" name="notes" rows="2"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" (click)="showCreateModal.set(false)" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Create</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class CompaniesComponent implements OnInit {
  readonly companyService = inject(CompanyService);

  readonly showCreateModal = signal(false);
  readonly searchQuery = signal('');

  newCompany: Partial<Company> = {
    name: '',
    website: '',
    location: '',
    contactName: '',
    contactEmail: '',
    notes: '',
  };

  ngOnInit(): void {
    this.companyService.fetchCompanies();
  }

  onSearch(query: string): void {
    this.companyService.fetchCompanies(query);
  }

  getActiveCount(company: Company): number {
    return company.applications?.filter((a) =>
      ['applied', 'screening', 'interview', 'offer'].includes(a.status)
    ).length || 0;
  }

  createCompany(): void {
    if (!this.newCompany.name) return;
    this.companyService.create(this.newCompany).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.newCompany = { name: '', website: '', location: '', contactName: '', contactEmail: '', notes: '' };
      },
    });
  }
}
