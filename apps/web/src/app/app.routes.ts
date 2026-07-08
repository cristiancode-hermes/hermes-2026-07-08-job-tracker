import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'applications', loadComponent: () => import('./pages/applications/applications.component').then(c => c.ApplicationsComponent), canActivate: [AuthGuard] },
  { path: 'applications/:id', loadComponent: () => import('./pages/application-detail/application-detail.component').then(c => c.ApplicationDetailComponent), canActivate: [AuthGuard] },
  { path: 'applications/:id/cover-letter', loadComponent: () => import('./pages/cover-letter-wizard/cover-letter-wizard.component').then(c => c.CoverLetterWizardComponent), canActivate: [AuthGuard] },
  { path: 'companies', loadComponent: () => import('./pages/companies/companies.component').then(c => c.CompaniesComponent), canActivate: [AuthGuard] },
  { path: 'companies/:id', loadComponent: () => import('./pages/company-detail/company-detail.component').then(c => c.CompanyDetailComponent), canActivate: [AuthGuard] },
  { path: 'interviews', loadComponent: () => import('./pages/interviews/interviews.component').then(c => c.InterviewsComponent), canActivate: [AuthGuard] },
  { path: 'interviews/:id/prep', loadComponent: () => import('./pages/interview-prep/interview-prep.component').then(c => c.InterviewPrepComponent), canActivate: [AuthGuard] },
  { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(c => c.SettingsComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' },
];
