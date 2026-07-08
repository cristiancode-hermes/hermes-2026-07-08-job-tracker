import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, ErrorBannerComponent],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="w-full max-w-md">
        <div class="card">
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Welcome back</h1>
            <p class="text-sm text-secondary-500 mt-1">Sign in to your Hermes Job Tracker</p>
          </div>

          <app-error-banner [message]="error()" (dismiss)="error.set(null)" />

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                placeholder="you@example.com"
                class="w-full"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="8"
                placeholder="••••••••"
                class="w-full"
              />
            </div>

            <button type="submit" [disabled]="loading()" class="btn-primary w-full flex items-center justify-center gap-2">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-secondary-500">
            Don't have an account?
            <a routerLink="/register" class="text-primary-600 hover:text-primary-500 font-medium">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);

    this.#auth.login(this.email, this.password).subscribe({
      next: () => {
        this.#router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }
}
