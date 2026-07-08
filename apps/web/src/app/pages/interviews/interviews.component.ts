import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../shared/services/interview.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Interview } from '../../shared/models';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, ModalComponent, LoadingSkeletonComponent, EmptyStateComponent, ErrorBannerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Interviews</h1>
        <button (click)="showCreateModal.set(true)" class="btn-primary flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Schedule Interview
        </button>
      </div>

      <!-- Filter -->
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="upcomingOnly" (ngModelChange)="loadInterviews()" class="w-4 h-4 rounded" />
          <span class="text-secondary-600">Show upcoming only</span>
        </label>
      </div>

      <app-error-banner [message]="interviewService.error()" (dismiss)="interviewService.error.set(null)" />

      @if (interviewService.loading()) {
        <app-loading-skeleton [rows]="4" />
      } @else if (interviewService.interviews().length === 0) {
        <app-empty-state title="No interviews" description="Schedule your first interview">
          <button (click)="showCreateModal.set(true)" class="btn-primary">Schedule Interview</button>
        </app-empty-state>
      } @else {
        <div class="space-y-3">
          @for (iv of interviewService.interviews(); track iv.id) {
            <div class="card">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 shrink-0">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-secondary-900 dark:text-secondary-200">{{ iv.type }}</h3>
                    <p class="text-sm text-secondary-500 mt-0.5">{{ iv.dateTime | date:'EEEE, MMM d, y h:mm a' }}</p>
                    <div class="flex gap-3 mt-1 text-xs text-secondary-400">
                      @if (iv.company) {
                        <span>{{ iv.company.name }}</span>
                      }
                      @if (iv.application) {
                        <span>{{ iv.application.title }}</span>
                      }
                      @if (iv.contactName) {
                        <span>Contact: {{ iv.contactName }}</span>
                      }
                    </div>
                    @if (iv.completed) {
                      <span class="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Completed
                      </span>
                    }
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  @if (!iv.completed) {
                    <button (click)="markComplete(iv.id)" class="btn-secondary text-xs">Mark Complete</button>
                  }
                  <a [routerLink]="['/interviews', iv.id, 'prep']" class="btn-secondary text-xs">Prep</a>
                  <button (click)="deleteInterview(iv.id)" class="text-danger-500 hover:text-danger-700 text-xs">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create Modal -->
    <app-modal [isOpen]="showCreateModal()" title="Schedule Interview" (close)="showCreateModal.set(false)">
      <form (ngSubmit)="createInterview()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Application ID</label>
          <input type="text" [(ngModel)]="newInterview.applicationId" name="applicationId" required placeholder="Application ID" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Type</label>
          <select [(ngModel)]="newInterview.type" name="type" required>
            <option value="">Select type...</option>
            <option value="phone">Phone Screen</option>
            <option value="technical">Technical</option>
            <option value="onsite">On-site</option>
            <option value="behavioral">Behavioral</option>
            <option value="final">Final Round</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Date & Time</label>
          <input type="datetime-local" [(ngModel)]="newInterview.dateTime" name="dateTime" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Name</label>
          <input type="text" [(ngModel)]="newInterview.contactName" name="contactName" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</label>
          <textarea [(ngModel)]="newInterview.notes" name="notes" rows="2"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" (click)="showCreateModal.set(false)" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Schedule</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class InterviewsComponent implements OnInit {
  readonly interviewService = inject(InterviewService);

  readonly showCreateModal = signal(false);
  readonly upcomingOnly = signal(false);

  newInterview: Partial<Interview> = {
    applicationId: '',
    type: '',
    dateTime: '',
    contactName: '',
    notes: '',
  };

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.interviewService.fetchInterviews(this.upcomingOnly() || undefined);
  }

  createInterview(): void {
    if (!this.newInterview.applicationId || !this.newInterview.type || !this.newInterview.dateTime) return;
    this.interviewService.create(this.newInterview).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.newInterview = { applicationId: '', type: '', dateTime: '', contactName: '', notes: '' };
        this.loadInterviews();
      },
    });
  }

  markComplete(id: string): void {
    this.interviewService.markComplete(id).subscribe({
      next: () => this.loadInterviews(),
    });
  }

  deleteInterview(id: string): void {
    if (!confirm('Delete this interview?')) return;
    this.interviewService.delete(id).subscribe({
      next: () => this.loadInterviews(),
    });
  }
}
