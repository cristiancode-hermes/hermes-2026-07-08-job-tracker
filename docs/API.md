# API Reference — Hermes Job Tracker

Base URL: `http://localhost:3000/api`

## Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/register` | `{email, password, name}` | `{token, user}` |
| POST | `/auth/login` | `{email, password}` | `{token, user}` |
| GET | `/auth/profile` | — | `{user}` |
| PATCH | `/auth/profile` | `{name?}` | `{user}` |

## Companies

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/companies?search=&sort=` | — | `Company[]` |
| POST | `/companies` | `{name, website?, location?, notes?, contactName?, contactEmail?, contactPhone?}` | `Company` |
| GET | `/companies/:id` | — | `Company` (with applications) |
| PUT | `/companies/:id` | Partial fields | `Company` |
| DELETE | `/companies/:id` | — | `{deleted: true}` |

## Applications

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/applications?status=&search=&companyId=&sort=` | — | `JobApplication[]` (with company) |
| POST | `/applications` | `{companyId, title, description?, salary?, location?, url?, notes?}` | `JobApplication` |
| GET | `/applications/:id` | — | `JobApplication` (with all relations) |
| PUT | `/applications/:id` | Partial fields | `JobApplication` |
| PATCH | `/applications/:id/status` | `{status}` | `JobApplication` |
| DELETE | `/applications/:id` | — | `{deleted: true}` |

## AI Analysis

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/analysis/match` | `{applicationId, resumeText}` | `AIAnalysis` |
| GET | `/analysis/:id` | — | `AIAnalysis` |
| GET | `/analysis/applications/:applicationId` | — | `AIAnalysis[]` |

## Cover Letters

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/cover-letters/generate` | `{applicationId, tone, length}` | `{letter, preview}` |
| POST | `/cover-letters` | `{applicationId, content, tone, length}` | `CoverLetter` |
| GET | `/cover-letters/applications/:applicationId` | — | `CoverLetter[]` |
| GET | `/cover-letters/:id` | — | `CoverLetter` |
| DELETE | `/cover-letters/:id` | — | `{deleted: true}` |

## Interviews

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/interviews?upcoming=&applicationId=` | — | `Interview[]` (with relations) |
| POST | `/interviews` | `{applicationId, type, dateTime, contactName?, contactEmail?, notes?}` | `Interview` |
| GET | `/interviews/:id` | — | `Interview` (with questions) |
| PUT | `/interviews/:id` | Partial fields | `Interview` |
| PATCH | `/interviews/:id/complete` | `{feedback?}` | `Interview` |
| DELETE | `/interviews/:id` | — | `{deleted: true}` |

## Dashboard

| Method | Path | Response |
|--------|------|----------|
| GET | `/dashboard/kpis` | `{totalApps, inProgress, interviews, responseRate}` |
| GET | `/dashboard/status-distribution` | `{status, count}[]` |
| GET | `/dashboard/upcoming-interviews` | `Interview[]` |
| GET | `/dashboard/recent-activity` | `ActivityItem[]` |

## SSE Events

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/events` | SSE stream — events: `status-change`, `connected` |

## Settings

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/settings` | — | `UserSettings` |
| PUT | `/settings/resume` | `{resumeText}` | `{resumeText}` |
| PUT | `/settings/preferences` | `{theme}` | `UserSettings` |
