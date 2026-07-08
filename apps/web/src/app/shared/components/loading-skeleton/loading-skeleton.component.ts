import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="space-y-4">
      @for (_ of [].constructor(rows()); track $index) {
        <div class="card p-4">
          <div class="skeleton h-4 w-3/4 mb-2"></div>
          <div class="skeleton h-3 w-1/2 mb-1"></div>
          <div class="skeleton h-3 w-2/3"></div>
        </div>
      }
    </div>
  `,
})
export class LoadingSkeletonComponent {
  readonly rows = input(3);
}
