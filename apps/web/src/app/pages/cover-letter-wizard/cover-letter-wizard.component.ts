import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoverLetterService } from '../../shared/services/cover-letter.service';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { CoverLetter } from '../../shared/models';

@Component({
  selector: 'app-cover-letter-wizard',
  standalone: true,
  imports: [RouterLink, DatePipe, TitleCasePipe, FormsModule, LoadingSkeletonComponent, ErrorBannerComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-2 text-sm text-secondary-500 mb-2">
        <a [routerLink]="['/applications', applicationId]" class="hover:text-primary-600">&larr; Back to Application</a>
      </div>
      <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Cover Letter Generator</h1>

      <app-error-banner [message]="error()" (dismiss)="error.set(null)" />

      <!-- Step 1: Options -->
      @if (step() === 1) {
        <div class="card space-y-4">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200">Choose your preferences</h2>
          <div>
            <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Tone</label>
            <div class="flex gap-3">
              @for (t of tones; track t) {
                <button
                  (click)="selectedTone.set(t)"
                  class="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                  [class.border-primary-500]="selectedTone() === t"
                  [class.bg-primary-50]="selectedTone() === t"
                  [class.border-secondary-200]="selectedTone() !== t"
                >
                  {{ t | titlecase }}
                </button>
              }
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Length</label>
            <div class="flex gap-3">
              @for (l of lengths; track l) {
                <button
                  (click)="selectedLength.set(l)"
                  class="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                  [class.border-primary-500]="selectedLength() === l"
                  [class.bg-primary-50]="selectedLength() === l"
                  [class.border-secondary-200]="selectedLength() !== l"
                >
                  {{ l | titlecase }}
                </button>
              }
            </div>
          </div>
          <button (click)="generate()" [disabled]="generating()" class="btn-primary w-full">
            {{ generating() ? 'Generating...' : 'Generate Cover Letter' }}
          </button>
        </div>
      }

      <!-- Generating -->
      @if (generating()) {
        <div class="card flex items-center justify-center py-12">
          <div class="text-center">
            <svg class="animate-spin w-8 h-8 text-primary-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p class="text-secondary-500">Generating your cover letter...</p>
          </div>
        </div>
      }

      <!-- Step 2-3: Preview & Edit -->
      @if (generatedLetter() && !generating()) {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200">Preview</h2>
            <div class="flex gap-2">
              <button (click)="regenerate()" class="btn-secondary text-sm">Regenerate</button>
              <button (click)="saveLetter()" class="btn-primary text-sm">Save</button>
            </div>
          </div>
          <textarea
            [(ngModel)]="editableLetter"
            rows="16"
            class="w-full font-mono text-sm"
          ></textarea>
          <div class="flex justify-between mt-3">
            <div class="flex gap-2">
              <button (click)="copyToClipboard()" class="btn-secondary text-sm">
                {{ copied() ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <p class="text-xs text-secondary-400">{{ selectedTone() }} &middot; {{ selectedLength() }}</p>
          </div>
        </div>
      }

      <!-- Version History -->
      @if (versions().length > 0) {
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Version History</h2>
          <div class="space-y-3">
            @for (v of versions(); track v.id) {
              <div class="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-200 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-secondary-800 dark:text-secondary-300">Version {{ v.version }} &middot; {{ v.tone }} &middot; {{ v.length }}</p>
                  <p class="text-xs text-secondary-400">{{ v.createdAt | date:'MMM d, y h:mm a' }}</p>
                </div>
                <div class="flex gap-2">
                  <button (click)="restoreVersion(v)" class="text-xs text-primary-600 hover:text-primary-700 font-medium">Restore</button>
                  <button (click)="deleteVersion(v.id)" class="text-xs text-danger-500 hover:text-danger-700 font-medium">Delete</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class CoverLetterWizardComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #coverLetterService = inject(CoverLetterService);

  readonly tones = ['formal', 'enthusiastic', 'professional'];
  readonly lengths = ['short', 'medium', 'long'];
  readonly selectedTone = signal('professional');
  readonly selectedLength = signal('medium');
  readonly step = signal(1);
  readonly generating = signal(false);
  readonly generatedLetter = signal<string | null>(null);
  readonly editableLetter = signal('');
  readonly versions = signal<CoverLetter[]>([]);
  readonly error = signal<string | null>(null);
  readonly copied = signal(false);

  applicationId = '';

  ngOnInit(): void {
    this.applicationId = this.#route.snapshot.paramMap.get('id') || '';
    if (this.applicationId) {
      this.#coverLetterService.getByApplication(this.applicationId).subscribe({
        next: (data) => this.versions.set(data),
      });
    }
  }

  generate(): void {
    this.generating.set(true);
    this.error.set(null);
    this.#coverLetterService.generate(this.applicationId, this.selectedTone(), this.selectedLength()).subscribe({
      next: (res) => {
        this.generatedLetter.set(res.letter);
        this.editableLetter.set(res.letter);
        this.generating.set(false);
        this.step.set(2);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to generate cover letter');
        this.generating.set(false);
      },
    });
  }

  regenerate(): void {
    this.generate();
  }

  saveLetter(): void {
    this.#coverLetterService
      .save({
        applicationId: this.applicationId,
        content: this.editableLetter(),
        tone: this.selectedTone(),
        length: this.selectedLength(),
      })
      .subscribe({
        next: (cl) => {
          this.versions.update((list) => [...list, cl]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to save cover letter');
        },
      });
  }

  restoreVersion(v: CoverLetter): void {
    this.editableLetter.set(v.content);
    this.selectedTone.set(v.tone);
    this.selectedLength.set(v.length);
  }

  deleteVersion(id: string): void {
    if (!confirm('Delete this version?')) return;
    this.#coverLetterService.delete(id).subscribe({
      next: () => this.versions.update((list) => list.filter((v) => v.id !== id)),
    });
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.editableLetter());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
