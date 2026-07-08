import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../shared/services/interview.service';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { Interview, InterviewQuestion } from '../../shared/models';

@Component({
  selector: 'app-interview-prep',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, LoadingSkeletonComponent, ErrorBannerComponent],
  template: `
    @if (loading()) {
      <app-loading-skeleton [rows]="5" />
    } @else if (error()) {
      <app-error-banner [message]="error()" (dismiss)="goBack()" />
    } @else if (interview(); as iv) {
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center gap-2 text-sm text-secondary-500 mb-2">
          <a routerLink="/interviews" class="hover:text-primary-600">&larr; Interviews</a>
        </div>

        <!-- Interview Details -->
        <div class="card">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">{{ iv.type }} Interview Prep</h1>
              <p class="text-secondary-500 mt-1">{{ iv.dateTime | date:'EEEE, MMM d, y h:mm a' }}</p>
              @if (iv.company) {
                <p class="text-sm text-secondary-400">Company: {{ iv.company.name }}</p>
              }
              @if (iv.contactName) {
                <p class="text-sm text-secondary-400">Contact: {{ iv.contactName }}</p>
              }
            </div>
            @if (!iv.completed) {
              <button (click)="completeInterview()" class="btn-primary text-sm">Mark Complete</button>
            } @else {
              <span class="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                Completed
              </span>
            }
          </div>
        </div>

        <!-- Prep Stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="card text-center">
            <p class="text-2xl font-bold text-primary-600">{{ questions().length }}</p>
            <p class="text-xs text-secondary-500 mt-1">Questions</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold text-green-600">{{ answeredCount }}</p>
            <p class="text-xs text-secondary-500 mt-1">Answered</p>
          </div>
          <div class="card text-center">
            <p class="text-2xl font-bold text-amber-600">{{ prepProgress }}%</p>
            <p class="text-xs text-secondary-500 mt-1">Prep Progress</p>
          </div>
        </div>

        <!-- Preparation Notes -->
        <div class="card">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Preparation Notes</h2>
          <textarea
            [(ngModel)]="prepNotes"
            (blur)="savePrepNotes()"
            rows="4"
            placeholder="Write your preparation notes here..."
            class="w-full"
          ></textarea>
        </div>

        <!-- Questions -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200">Common Questions</h2>
            <button (click)="addingQuestion.set(true)" class="btn-primary text-sm">Add Question</button>
          </div>

          @if (addingQuestion()) {
            <div class="mb-4 p-4 bg-secondary-50 dark:bg-secondary-200 rounded-lg">
              <textarea
                [(ngModel)]="newQuestionText"
                placeholder="Enter interview question..."
                rows="2"
                class="mb-2"
              ></textarea>
              <div class="flex gap-2">
                <button (click)="addQuestion()" class="btn-primary text-xs">Add</button>
                <button (click)="addingQuestion.set(false)" class="btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          }

          @if (questions().length === 0) {
            <p class="text-sm text-secondary-400 text-center py-4">No questions yet. Add common interview questions to prepare.</p>
          } @else {
            <div class="space-y-3">
              @for (q of questions(); track q.id) {
                <div class="p-4 bg-secondary-50 dark:bg-secondary-200 rounded-lg">
                  <div class="flex justify-between items-start">
                    <p class="text-sm font-medium text-secondary-800 dark:text-secondary-300">{{ q.question }}</p>
                    <button (click)="deleteQuestion(q.id)" class="text-danger-500 hover:text-danger-700 text-xs">Remove</button>
                  </div>
                  <textarea
                    [(ngModel)]="q.answer"
                    (blur)="updateQuestion(q)"
                    placeholder="Your answer..."
                    rows="2"
                    class="mt-2 text-sm"
                  ></textarea>
                </div>
              }
            </div>
          }
        </div>

        <!-- Feedback -->
        @if (iv.completed && iv.feedback) {
          <div class="card">
            <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-2">Feedback</h2>
            <p class="text-sm text-secondary-600">{{ iv.feedback }}</p>
          </div>
        }
      </div>
    }
  `,
})
export class InterviewPrepComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #interviewService = inject(InterviewService);

  readonly interview = signal<Interview | null>(null);
  readonly questions = signal<InterviewQuestion[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly addingQuestion = signal(false);

  prepNotes = '';
  newQuestionText = '';

  ngOnInit(): void {
    const id = this.#route.snapshot.paramMap.get('id');
    if (id) this.loadInterview(id);
  }

  loadInterview(id: string): void {
    this.loading.set(true);
    this.#interviewService.getById(id).subscribe({
      next: (data) => {
        this.interview.set(data);
        this.prepNotes = data.prepNotes || '';
        this.questions.set(data.questions || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  get answeredCount(): number {
    return this.questions().filter((q) => q.answer?.trim()).length;
  }

  get prepProgress(): number {
    const total = this.questions().length;
    if (total === 0) return 0;
    return Math.round((this.answeredCount / total) * 100);
  }

  savePrepNotes(): void {
    const iv = this.interview();
    if (!iv) return;
    this.#interviewService.update(iv.id, { prepNotes: this.prepNotes }).subscribe();
  }

  addQuestion(): void {
    const iv = this.interview();
    if (!iv || !this.newQuestionText.trim()) return;
    const maxOrder = Math.max(...this.questions().map((q) => q.sortOrder), 0);
    const newQ: InterviewQuestion = {
      id: crypto.randomUUID(),
      interviewId: iv.id,
      question: this.newQuestionText.trim(),
      answer: '',
      sortOrder: maxOrder + 1,
    };
    this.questions.update((list) => [...list, newQ]);
    this.newQuestionText = '';
    this.addingQuestion.set(false);
  }

  updateQuestion(q: InterviewQuestion): void {
    // Persist via update (in a real app this would call the API)
    // For now, it's already stored in the signal
  }

  deleteQuestion(id: string): void {
    this.questions.update((list) => list.filter((q) => q.id !== id));
  }

  completeInterview(): void {
    const iv = this.interview();
    if (!iv) return;
    const feedback = prompt('Any feedback from the interview?');
    this.#interviewService.markComplete(iv.id, feedback || undefined).subscribe({
      next: (updated) => this.interview.set(updated),
    });
  }

  goBack(): void {
    window.history.back();
  }
}
