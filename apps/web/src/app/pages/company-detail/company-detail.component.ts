import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../shared/services/company.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Company } from '../../shared/models';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, StatusBadgeComponent, LoadingSkeletonComponent, ErrorBannerComponent],
  template: `
    @if (loading()) {
      <app-loading-skeleton [rows]="4" />
    } @else if (error()) {
      <app-error-banner [message]="error()" (dismiss)="goBack()" />
    } @else if (company(); as c) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 text-sm text-secondary-500 mb-1">
              <a routerLink="/companies" class="hover:text-primary-600">&larr; Companies</a>
            </div>
            <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">{{ c.name }}</h1>
            @if (c.location) {
              <p class="text-secondary-500 mt-0.5">{{ c.location }}</p>
            }
          </div>
          <div class="flex gap-2">
            <button (click)="editing.set(!editing())" class="btn-secondary text-sm">
              {{ editing() ? 'Cancel' : 'Edit' }}
            </button>
            <button (click)="deleteCompany()" class="btn-danger text-sm">Delete</button>
          </div>
        </div>

        @if (editing()) {
          <!-- Edit Form -->
          <div class="card">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Edit Company</h2>
            <form (ngSubmit)="saveCompany()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Name</label>
                  <input type="text" [(ngModel)]="editForm.name" name="name" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Website</label>
                  <input type="url" [(ngModel)]="editForm.website" name="website" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Location</label>
                  <input type="text" [(ngModel)]="editForm.location" name="location" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Name</label>
                  <input type="text" [(ngModel)]="editForm.contactName" name="contactName" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Email</label>
                  <input type="email" [(ngModel)]="editForm.contactEmail" name="contactEmail" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</label>
                <textarea [(ngModel)]="editForm.notes" name="notes" rows="3"></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" (click)="editing.set(false)" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
              </div>
            </form>
          </div>
        } @else {
          <!-- Info -->
          <div class="card">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Company Info</h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
              @if (c.website) {
                <div><span class="text-secondary-500">Website:</span> <a [href]="c.website" target="_blank" class="text-primary-600 hover:underline ml-1">{{ c.website }}</a></div>
              }
              @if (c.contactName) {
                <div><span class="text-secondary-500">Contact:</span> <span class="text-secondary-800 dark:text-secondary-300 ml-1">{{ c.contactName }}</span></div>
              }
              @if (c.contactEmail) {
                <div><span class="text-secondary-500">Email:</span> <span class="text-secondary-800 dark:text-secondary-300 ml-1">{{ c.contactEmail }}</span></div>
              }
              <div><span class="text-secondary-500">Created:</span> <span class="text-secondary-800 dark:text-secondary-300 ml-1">{{ c.createdAt | date:'MMM d, y' }}</span></div>
            </div>
            @if (c.notes) {
              <div class="mt-4">
                <h4 class="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</h4>
                <p class="text-sm text-secondary-600">{{ c.notes }}</p>
              </div>
            }
          </div>
        }

        <!-- Applications -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Applications</h2>
          @if (c.applications && c.applications.length > 0) {
            <div class="space-y-2">
              @for (app of c.applications; track app.id) {
                <div class="flex items-center justify-between p-3 hover:bg-secondary-50 dark:hover:bg-secondary-200 rounded-lg cursor-pointer" [routerLink]="['/applications', app.id]">
                  <div>
                    <p class="text-sm font-medium text-secondary-900 dark:text-secondary-200">{{ app.title }}</p>
                    <p class="text-xs text-secondary-500">{{ app.createdAt | date:'MMM d, y' }}</p>
                  </div>
                  <app-status-badge [status]="app.status" />
                </div>
              }
            </div>
          } @else {
            <p class="text-sm text-secondary-400">No applications for this company yet.</p>
          }
        </div>
      </div>
    }
  `,
})
export class CompanyDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #companyService = inject(CompanyService);

  readonly company = signal<Company | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editing = signal(false);

  editForm: Partial<Company> = {};

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) this.loadCompany(id);
  }

  loadCompany(id: string): void {
    this.loading.set(true);
    this.#companyService.getById(id).subscribe({
      next: (data) => {
        this.company.set(data);
        this.editForm = { ...data };
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  saveCompany(): void {
    const c = this.company();
    if (!c) return;
    this.#companyService.update(c.id, this.editForm).subscribe({
      next: (updated) => {
        this.company.set(updated);
        this.editing.set(false);
      },
    });
  }

  deleteCompany(): void {
    const c = this.company();
    if (!c || !confirm('Delete this company and all associated data?')) return;
    this.#companyService.delete(c.id).subscribe({
      next: () => this.#router.navigate(['/companies']),
    });
  }

  goBack(): void {
    window.history.back();
  }
}
