import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ThemeService } from '../../shared/services/theme.service';
import { SettingsService } from '../../shared/services/settings.service';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, ErrorBannerComponent],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-200">Settings</h1>

      <app-error-banner [message]="error()" (dismiss)="error.set(null)" />

      <!-- Profile -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Profile</h2>
        @if (auth.currentUser(); as user) {
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Name</label>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="profileName" class="flex-1" />
                <button (click)="updateProfile()" class="btn-primary text-sm">Save</button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
              <input type="email" [value]="user.email" disabled class="bg-secondary-50 dark:bg-secondary-200 cursor-not-allowed" />
            </div>
          </div>
        }
      </div>

      <!-- Resume -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Resume</h2>
        <p class="text-sm text-secondary-500 mb-3">Paste your resume text for AI-powered analysis and matching.</p>
        <textarea
          [(ngModel)]="resumeText"
          rows="10"
          placeholder="Paste your resume content here..."
          class="w-full font-mono text-sm"
        ></textarea>
        <div class="mt-3 flex justify-end">
          <button (click)="saveResume()" [disabled]="savingResume()" class="btn-primary text-sm">
            {{ savingResume() ? 'Saving...' : 'Save Resume' }}
          </button>
        </div>
      </div>

      <!-- Theme -->
      <div class="card">
        <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-200 mb-4">Theme</h2>
        <div class="flex gap-3">
          @for (option of themeOptions; track option.value) {
            <button
              (click)="setTheme(option.value)"
              class="flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all"
              [class.border-primary-500]="selectedTheme() === option.value"
              [class.bg-primary-50]="selectedTheme() === option.value"
              [class.border-secondary-200]="selectedTheme() !== option.value"
            >
              <div class="flex items-center justify-center gap-2">
                @if (option.value === 'system') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                } @else if (option.value === 'light') {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                }
                {{ option.label }}
              </div>
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly #themeService = inject(ThemeService);
  readonly #settingsService = inject(SettingsService);

  readonly error = signal<string | null>(null);
  readonly savingResume = signal(false);
  readonly selectedTheme = signal('system');
  readonly profileName = signal('');
  readonly resumeText = signal('');

  readonly themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  ngOnInit(): void {
    this.profileName.set(this.auth.currentUser()?.name || '');
    this.#settingsService.get().subscribe({
      next: (data) => {
        this.resumeText.set(data.resumeText || '');
        this.selectedTheme.set(data.theme || 'system');
      },
    });
  }

  updateProfile(): void {
    const name = this.profileName();
    if (!name) return;
    this.auth.updateProfile(name).subscribe({
      next: (user) => this.auth.currentUser.set(user),
      error: (err) => this.error.set(err.error?.message || 'Failed to update profile'),
    });
  }

  saveResume(): void {
    this.savingResume.set(true);
    this.#settingsService.updateResume(this.resumeText()).subscribe({
      next: () => this.savingResume.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save resume');
        this.savingResume.set(false);
      },
    });
  }

  setTheme(theme: string): void {
    this.selectedTheme.set(theme);
    this.#themeService.setTheme(theme);
    this.#settingsService.updatePreferences(theme).subscribe();
  }
}
