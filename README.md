# Hermes Job Tracker

> **AI-Powered Job Application Tracker** — Track and optimize your job search with AI-powered resume analysis, cover letter generation, and full application pipeline management.

## Features

- **Application Pipeline** — 8-status kanban workflow (saved → applied → screening → interview → offer → accepted/rejected/withdrawn)
- **AI Match Analysis** — Resume vs. job description fit scoring with strengths, gaps, and suggestions
- **AI Cover Letter Generation** — Tailored cover letters with tone/length options, version history
- **Dashboard** — KPI cards, status distribution chart, upcoming interviews, activity feed
- **Company Management** — Directory with search, contacts, and related applications
- **Interview Preparation** — Schedule interviews, prep notes, common questions, progress tracking
- **Dark Mode** — Full theme support with CSS variable system
- **SSE Real-Time** — Live dashboard updates on application status changes

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (signals, zoneless, standalone) |
| Styling | Tailwind CSS v4 (dark mode via CSS variables) |
| Backend | NestJS 11 (JWT Auth, Swagger, TypeORM) |
| Database | SQLite (better-sqlite3) — Neon/PostgreSQL-compatible schema |
| AI | Strategy Pattern (OpenAI + local fallback) |
| Testing | Jest (unit tests) |

## Architecture

```
2026-07-08-job-tracker/
├── apps/
│   ├── api/          → NestJS backend (12 modules)
│   └── web/          → Angular frontend (11 lazy routes)
├── docs/             → Documentation
├── .gitignore
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 22+
- npm 10+

## Local Setup

1. **Clone and install:**

```bash
cd apps/api && npm install
cd ../web && npm install
cd ../..
```

2. **Environment variables:**

Copy `.env.example` to `apps/api/.env` and configure:
- `JWT_SECRET` — A random secret string for JWT signing
- `DATABASE_PATH=data/db.sqlite` — SQLite database path
- `PORT=3000` — API server port
- `FRONTEND_URL=http://localhost:4200` — Frontend URL for CORS
- `OPENAI_API_KEY` — Optional: for LLM-powered AI features

3. **Start the API:**

```bash
cd apps/api
npm run start:dev
# API at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

4. **Start the frontend:**

```bash
cd apps/web
npm run start
# Frontend at http://localhost:4200
```

5. **Login with seeded demo users:**
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`

## Build

```bash
cd apps/api && npm run build
cd apps/web && node_modules/.bin/ng build
```

## Roadmap

- [ ] LinkedIn CSV import
- [ ] Email follow-up reminders
- [ ] CSV/PDF export
- [ ] Company comparison view
- [ ] Real OpenAI API integration (via Strategy Pattern)
- [ ] Neon/PostgreSQL deployment
- [ ] CI/CD pipeline
