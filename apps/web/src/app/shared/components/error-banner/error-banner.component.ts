import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  template: `
    @if (message()) {
      <div class="bg-danger-50 dark:bg-danger-50/10 border border-danger-200 dark:border-danger-700 rounded-lg p-4 mb-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-danger-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm text-danger-700 dark:text-danger-400">{{ message() }}</p>
          </div>
          @if (dismissable()) {
            <button (click)="dismiss.emit()" class="text-danger-500 hover:text-danger-700">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class ErrorBannerComponent {
  readonly message = input<string | null>(null);
  readonly dismissable = input(true);
  readonly dismiss = output<void>();
}
