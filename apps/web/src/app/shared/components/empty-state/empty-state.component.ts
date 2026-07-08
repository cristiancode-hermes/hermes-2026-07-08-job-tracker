import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      @if (icon()) {
        <div class="w-16 h-16 mb-4 text-secondary-300">
          <ng-content select="[icon]" />
        </div>
      } @else {
        <svg class="w-16 h-16 mb-4 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      }
      <h3 class="text-lg font-medium text-secondary-500 dark:text-secondary-400">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 text-sm text-secondary-400 dark:text-secondary-500">{{ description() }}</p>
      }
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('Nothing here yet');
  readonly description = input('');
  readonly icon = input(false);
}
