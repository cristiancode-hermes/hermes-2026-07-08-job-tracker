import { Component, input } from '@angular/core';
import { APPLICATION_STATUSES, ApplicationStatus } from '../../models';

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-300 dark:text-secondary-800',
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  screening: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  interview: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  offer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="status-badge {{ STATUS_COLORS[status()] || STATUS_COLORS['saved'] }}">
      {{ displayLabel() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input<string>('saved');

  STATUS_COLORS = STATUS_COLORS;

  displayLabel(): string {
    return this.status().charAt(0).toUpperCase() + this.status().slice(1);
  }
}
