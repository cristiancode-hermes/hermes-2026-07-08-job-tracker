import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, ErrorBannerComponent],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center">
      <div class="w-full max-w-md">
        <div class="card">
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Create account</h1>
            <p class="text-sm text-secondary-500 mt-1">Start tracking your job applications</p>
          </div>

          <app-error-banner [message]="error()" (dismiss)="error.set(null)" />

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Full Name</label>
              <input id="name" type="text" [(ngModel)]="name" name="name" required placeholder="John Doe" class="w-full" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
              <input id="email" type="email" [(ngModel)]="email" name="email" required placeholder="you@example.com" class="w-full" />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Password</label>
              <input id="password" type="password" [(ngModel)]="password" name="password" required minlength="8" placeholder="At least 8 characters" class="w-full" />
              @if (password && password.length < 8) {
                <p class="text-xs text-danger-500 mt-1">Password must be at least 8 characters</p>
              }
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Confirm Password</label>
              <input id="confirmPassword" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required placeholder="Repeat password" class="w-full" />
              @if (confirmPassword && password !== confirmPassword) {
                <p class="text-xs text-danger-500 mt-1">Passwords do not match</p>
              }
            </div>

            <button type="submit" [disabled]="loading() || !isFormValid()" class="btn-primary w-full flex items-center justify-center gap-2">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              }
              {{ loading() ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-secondary-500">
            Already have an account?
            <a routerLink="/login" class="text-primary-600 hover:text-primary-500 font-medium">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  readonly #auth = inject(AuthService);
  readonly #router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = signal(false);
  error = signal<string | null>(null);

  isFormValid(): boolean {
    return !!this.name && !!this.email && this.password.length >= 8 && this.password === this.confirmPassword;
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.#auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.#router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
