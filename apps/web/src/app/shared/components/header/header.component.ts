import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white dark:bg-secondary-100 border-b border-secondary-200 dark:border-secondary-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-2 font-bold text-lg text-primary-600">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Hermes Job Tracker</span>
          </a>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-600 dark:text-primary-400" class="px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-200 transition-colors">
              Dashboard
            </a>
            <a routerLink="/applications" routerLinkActive="bg-primary-50 text-primary-600 dark:text-primary-400" class="px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-200 transition-colors">
              Applications
            </a>
            <a routerLink="/companies" routerLinkActive="bg-primary-50 text-primary-600 dark:text-primary-400" class="px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-200 transition-colors">
              Companies
            </a>
            <a routerLink="/interviews" routerLinkActive="bg-primary-50 text-primary-600 dark:text-primary-400" class="px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 dark:hover:bg-secondary-200 transition-colors">
              Interviews
            </a>
          </nav>

          <!-- Right side -->
          <div class="flex items-center gap-2">
            <!-- Theme toggle -->
            <button (click)="theme.toggle()" class="btn-icon" title="Toggle theme">
              @if (theme.isDark()) {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>

            <!-- User menu -->
            @if (auth.currentUser(); as user) {
              <div class="relative" #menuContainer>
                <button (click)="showMenu = !showMenu" class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-200 transition-colors">
                  <div class="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="hidden sm:inline">{{ user.name }}</span>
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                @if (showMenu) {
                  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-100 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-200 py-1 z-50" (click)="showMenu = false">
                    <a routerLink="/settings" class="block px-4 py-2 text-sm text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-200">Settings</a>
                    <hr class="border-secondary-200 dark:border-secondary-200">
                    <button (click)="auth.logout()" class="block w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-secondary-200">Logout</button>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile nav -->
    <div class="md:hidden border-b border-secondary-200 dark:border-secondary-200 bg-white dark:bg-secondary-100">
      <div class="flex justify-around px-2 py-1">
        <a routerLink="/dashboard" routerLinkActive="text-primary-600" class="flex flex-col items-center px-3 py-2 text-xs text-secondary-500">
          <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
        <a routerLink="/applications" routerLinkActive="text-primary-600" class="flex flex-col items-center px-3 py-2 text-xs text-secondary-500">
          <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Applications
        </a>
        <a routerLink="/companies" routerLinkActive="text-primary-600" class="flex flex-col items-center px-3 py-2 text-xs text-secondary-500">
          <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Companies
        </a>
        <a routerLink="/interviews" routerLinkActive="text-primary-600" class="flex flex-col items-center px-3 py-2 text-xs text-secondary-500">
          <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Interviews
        </a>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  showMenu = false;
}
