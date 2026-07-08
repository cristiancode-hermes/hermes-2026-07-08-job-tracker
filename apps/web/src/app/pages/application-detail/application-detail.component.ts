import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../shared/services/application.service';
import { AnalysisService } from '../../shared/services/analysis.service';
import { CoverLetterService } from '../../shared/services/cover-letter.service';
import { InterviewService } from '../../shared/services/interview.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { JobApplication, AIAnalysis, CoverLetter, Interview, APPLICATION_STATUSES } from '../../shared/models';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe, FormsModule, StatusBadgeComponent, LoadingSkeletonComponent, ErrorBannerComponent, EmptyStateComponent, ModalComponent],
  template: `
    @if (loading()) {
      <app-loading-skeleton [rows]="5" />
    } @else if (error()) {
      <app-error-banner [message]="error()" (dismiss)="goBack()" />
    } @else if (app(); as app) {
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 text-sm text-secondary-500 mb-1">
            <a routerLink="/applications" class="hover:text-primary-600">&larr; Applications</a>
          </div>
          <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">{{ app.title }}</h1>
          @if (app.company) {
            <p class="text-secondary-500 mt-0.5">{{ app.company.name }}</p>
          }
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <app-status-badge [status]="app.status" />
          <select [(ngModel)]="newStatus" (ngModelChange)="changeStatus($event)" class="w-auto text-sm">
            @for (s of statuses; track s) {
              <option [value]="s" [selected]="s === app.status">{{ s | titlecase }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button (click)="analyzeMatch()" class="btn-secondary text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Analyze Match
        </button>
        <a [routerLink]="['/applications', app.id, 'cover-letter']" class="btn-secondary text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          Generate Cover Letter
        </a>
        <button (click)="showInterviewModal.set(true)" class="btn-secondary text-sm flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Schedule Interview
        </button>
      </div>

      <!-- Job Details -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Job Details</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><span class="text-secondary-500">Location:</span> <span class="text-secondary-800 dark:text-secondary-300">{{ app.location || 'Not specified' }}</span></div>
          <div><span class="text-secondary-500">Salary:</span> <span class="text-secondary-800 dark:text-secondary-300">{{ app.salary || 'Not specified' }}</span></div>
          <div><span class="text-secondary-500">Applied:</span> <span class="text-secondary-800 dark:text-secondary-300">{{ app.appliedAt ? (app.appliedAt | date:'MMM d, y') : 'Not yet' }}</span></div>
          <div><span class="text-secondary-500">Updated:</span> <span class="text-secondary-800 dark:text-secondary-300">{{ app.updatedAt | date:'MMM d, y' }}</span></div>
        </div>
        @if (app.url) {
          <a [href]="app.url" target="_blank" class="text-primary-600 text-sm mt-2 inline-block hover:underline">View Job Posting &rarr;</a>
        }
      </div>

      <!-- AI Analysis -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">AI Match Analysis</h2>
        @if (analyses().length > 0) {
          @for (analysis of analyses(); track analysis.id) {
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="text-sm text-secondary-500">Match Score</span>
                <div class="flex-1 bg-secondary-200 dark:bg-secondary-300 rounded-full h-3">
                  <div class="h-3 rounded-full bg-primary-500 transition-all" [style.width.%]="analysis.matchScore"></div>
                </div>
                <span class="text-lg font-bold text-primary-600">{{ analysis.matchScore }}%</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-green-600 mb-2">Strengths</h4>
                  <ul class="text-sm text-secondary-600 space-y-1">
                    @for (s of analysis.strengths; track $index) { <li>&bull; {{ s }}</li> }
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-amber-600 mb-2">Gaps</h4>
                  <ul class="text-sm text-secondary-600 space-y-1">
                    @for (g of analysis.gaps; track $index) { <li>&bull; {{ g }}</li> }
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-primary-600 mb-2">Suggestions</h4>
                  <ul class="text-sm text-secondary-600 space-y-1">
                    @for (s of analysis.suggestions; track $index) { <li>&bull; {{ s }}</li> }
                  </ul>
                </div>
              </div>
              <p class="text-xs text-secondary-400 mt-2">Model: {{ analysis.modelUsed }} &middot; {{ analysis.createdAt | date:'MMM d, y' }}</p>
            </div>
          }
        } @else {
          <app-empty-state title="No analysis yet" description="Analyze your resume against this job description">
            <button (click)="analyzeMatch()" class="btn-primary text-sm">Analyze Now</button>
          </app-empty-state>
        }
      </div>

      <!-- Cover Letters -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200">Cover Letters</h2>
          <a [routerLink]="['/applications', app.id, 'cover-letter']" class="btn-primary text-sm">Generate New</a>
        </div>
        @if (coverLetters().length > 0) {
          <div class="space-y-3">
            @for (cl of coverLetters(); track cl.id) {
              <div class="p-4 bg-secondary-50 dark:bg-secondary-200 rounded-lg">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-medium text-secondary-800 dark:text-secondary-300">Version {{ cl.version }} &middot; {{ cl.tone }} &middot; {{ cl.length }}</p>
                    <p class="text-xs text-secondary-400 mt-0.5">{{ cl.createdAt | date:'MMM d, y' }}</p>
                  </div>
                  <button (click)="deleteCoverLetter(cl.id)" class="text-danger-500 hover:text-danger-700 text-sm">Delete</button>
                </div>
                <p class="text-sm text-secondary-600 mt-2 line-clamp-3">{{ cl.content }}</p>
              </div>
            }
          </div>
        } @else {
          <app-empty-state title="No cover letters yet" />
        }
      </div>

      <!-- Interviews -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200">Interviews</h2>
          <button (click)="showInterviewModal.set(true)" class="btn-primary text-sm">Schedule</button>
        </div>
        @if (interviews().length > 0) {
          <div class="space-y-3">
            @for (iv of interviews(); track iv.id) {
              <div class="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-200 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-secondary-800 dark:text-secondary-300">{{ iv.type }}</p>
                  <p class="text-xs text-secondary-500">{{ iv.dateTime | date:'MMM d, y h:mm a' }}</p>
                  @if (iv.contactName) {
                    <p class="text-xs text-secondary-400">Contact: {{ iv.contactName }}</p>
                  }
                </div>
                <div class="flex items-center gap-2">
                  @if (!iv.completed) {
                    <button (click)="markInterviewComplete(iv.id)" class="text-xs text-green-600 hover:text-green-700 font-medium">Mark Complete</button>
                  } @else {
                    <span class="text-xs text-green-600 font-medium">Completed</span>
                  }
                  <a [routerLink]="['/interviews', iv.id, 'prep']" class="text-xs text-primary-600 hover:text-primary-700 font-medium">Prep</a>
                </div>
              </div>
            }
          </div>
        } @else {
          <app-empty-state title="No interviews scheduled" />
        }
      </div>

      <!-- Notes -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Notes</h2>
        <textarea
          [(ngModel)]="editingNotes"
          (blur)="saveNotes()"
          rows="4"
          placeholder="Add your notes about this application..."
          class="w-full"
        ></textarea>
      </div>
    }

    <!-- Schedule Interview Modal -->
    <app-modal [isOpen]="showInterviewModal()" title="Schedule Interview" (close)="showInterviewModal.set(false)">
      <form (ngSubmit)="createInterview()" class="space-y-4">
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
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Contact Email</label>
          <input type="email" [(ngModel)]="newInterview.contactEmail" name="contactEmail" />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Notes</label>
          <textarea [(ngModel)]="newInterview.notes" name="notes" rows="2"></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" (click)="showInterviewModal.set(false)" class="btn-secondary">Cancel</button>
          <button type="submit" class="btn-primary">Schedule</button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ApplicationDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #appService = inject(ApplicationService);
  readonly #analysisService = inject(AnalysisService);
  readonly #coverLetterService = inject(CoverLetterService);
  readonly #interviewService = inject(InterviewService);

  readonly app = signal<JobApplication | null>(null);
  readonly analyses = signal<AIAnalysis[]>([]);
  readonly coverLetters = signal<CoverLetter[]>([]);
  readonly interviews = signal<Interview[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showInterviewModal = signal(false);
  readonly editingNotes = signal('');

  readonly statuses = APPLICATION_STATUSES;
  newStatus = '';

  newInterview: Partial<Interview> = {
    type: '',
    dateTime: '',
    contactName: '',
    contactEmail: '',
    notes: '',
  };

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) this.loadApplication(id);
  }

  loadApplication(id: string): void {
    this.loading.set(true);
    this.#appService.getById(id).subscribe({
      next: (data) => {
        this.app.set(data);
        this.editingNotes.set(data.notes || '');
        this.newStatus = data.status;
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });

    this.#analysisService.getByApplication(id).subscribe({
      next: (data) => this.analyses.set(data),
    });

    this.#coverLetterService.getByApplication(id).subscribe({
      next: (data) => this.coverLetters.set(data),
    });

    this.#interviewService.getAll(undefined, id).subscribe({
      next: (data) => this.interviews.set(data),
    });
  }

  analyzeMatch(): void {
    const app = this.app();
    if (!app) return;
    const resumeText = prompt('Enter your resume text for analysis:');
    if (!resumeText) return;

    this.#analysisService.analyzeMatch(app.id, resumeText).subscribe({
      next: (analysis) => {
        this.analyses.update((list) => [...list, analysis]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Analysis failed');
      },
    });
  }

  changeStatus(status: string): void {
    const app = this.app();
    if (!app || status === app.status) return;
    this.#appService.updateStatus(app.id, status).subscribe({
      next: (updated) => this.app.set(updated),
    });
  }

  saveNotes(): void {
    const app = this.app();
    if (!app) return;
    this.#appService.update(app.id, { notes: this.editingNotes() }).subscribe({
      next: (updated) => this.app.set(updated),
    });
  }

  createInterview(): void {
    const app = this.app();
    if (!app || !this.newInterview.type || !this.newInterview.dateTime) return;
    this.#interviewService
      .create({
        ...this.newInterview,
        applicationId: app.id,
        companyId: app.companyId,
      })
      .subscribe({
        next: (iv) => {
          this.interviews.update((list) => [...list, iv]);
          this.showInterviewModal.set(false);
          this.newInterview = { type: '', dateTime: '', contactName: '', contactEmail: '', notes: '' };
        },
      });
  }

  markInterviewComplete(id: string): void {
    this.#interviewService.markComplete(id).subscribe({
      next: (updated) =>
        this.interviews.update((list) =>
          list.map((i) => (i.id === id ? updated : i))
        ),
    });
  }

  deleteCoverLetter(id: string): void {
    if (!confirm('Delete this cover letter?')) return;
    this.#coverLetterService.delete(id).subscribe({
      next: () => this.coverLetters.update((list) => list.filter((cl) => cl.id !== id)),
    });
  }

  goBack(): void {
    window.history.back();
  }
}
