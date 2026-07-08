# Architecture — Hermes Job Tracker

## System Diagram

```mermaid
graph TD
    subgraph Frontend [Angular 22 - apps/web]
        A[AppComponent] --> H[HeaderComponent]
        A --> RO[RouterOutlet]
        RO --> D[DashboardPage]
        RO --> AP[ApplicationsPage]
        RO --> AD[ApplicationDetailPage]
        RO --> C[CompaniesPage]
        RO --> I[InterviewsPage]
        RO --> IP[InterviewPrepPage]
        RO --> CL[CoverLetterWizardPage]
        RO --> S[SettingsPage]
    end

    subgraph Backend [NestJS - apps/api]
        API[API Gateway :3000] --> AUTH[Auth Module]
        API --> COMP[Companies Module]
        API --> APPS[Applications Module]
        API --> ANALYSIS[Analysis Module]
        API --> CLM[Cover Letters Module]
        API --> INT[Interviews Module]
        API --> DASH[Dashboard Module]
        API --> EVT[Events Module - SSE]
        API --> SET[Settings Module]
        AUTH --> DB[(SQLite)]
        COMP --> DB
        APPS --> DB
        ANALYSIS --> DB
        CLM --> DB
        INT --> DB
        DASH --> DB
        EVT --> DB
    end

    RO -.-> |HTTP + SSE| API
    D -.-> |EventSource| EVT
```

## Data Flow

1. **Authentication:** User registers/logs in → JWT token stored in localStorage → sent as Bearer header
2. **Application Pipeline:** CRUD via NestJS with status machine validation → SSE broadcast on status change
3. **AI Analysis:** POST /api/analysis/match → Strategy Pattern (OpenAI or local fallback) → stored as AIAnalysis entity
4. **Cover Letter Generation:** POST /api/cover-letters/generate → Strategy Pattern → preview/edit/save workflow
5. **Dashboard:** Aggregation queries via TypeORM → KPI computation → SSE real-time updates
6. **SSE Events:** RxJS Subject in EventsService → EventSource in frontend → signal-based state updates

## Key Design Decisions

- **Monorepo structure:** Independent npm projects under apps/ for clean separation and independent build pipelines
- **Signal-first frontend:** All state managed via signals (signal(), computed(), input(), output()) — no zone.js, no NgRx
- **Strategy Pattern for AI:** Interface-based AI providers allow switching between OpenAI and local fallback without code changes
- **Status Machine:** Valid transition map enforces application lifecycle — no invalid states possible
- **SSE over WebSocket:** Simpler for unidirectional real-time; RxJS Subject handles broadcasting
