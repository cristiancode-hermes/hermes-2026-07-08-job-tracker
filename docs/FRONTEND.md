# Frontend Architecture — Hermes Job Tracker

## Signal Architecture

All component state uses Angular 22 signals:

```typescript
// Local component state
const items = signal<T[]>([]);
const loading = signal(true);
const error = signal<string | null>(null);

// Derived state
const hasItems = computed(() => items().length > 0);
const sortedItems = computed(() => 
  [...items()].sort((a, b) => b.date.localeCompare(a.date))
);

// Component inputs/outputs
const item = input.required<T>();
const saved = output<T>();
```

## State Management Patterns

### Loading/Empty/Error (Every Page)

```
@if (loading()) {
  <app-loading-skeleton />
} @else if (error()) {
  <app-error-banner [message]="error()" (retry)="load()" />
} @else if (items().length === 0) {
  <app-empty-state [title]="'No items'" [actionLabel]="'Add one'" (action)="onAdd()" />
} @else {
  <!-- actual content -->
}
```

### Form State
All forms use typed reactive or template-driven forms with signal-based state:

```typescript
const formData = signal<CreateApplication>({
  companyId: '',
  title: '',
  description: '',
});
```

### SSE Real-Time Updates
```typescript
// In DashboardComponent
private sse = inject(SseService);

constructor() {
  this.sse.connect();
  effect(() => {
    const event = this.sse.lastEvent();
    if (event?.type === 'status-change') {
      this.loadKpis();
    }
  });
}
```

## Lazy Loading

All page components use `loadComponent` for route-level code splitting:

```typescript
{ path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component') }
```

This produces separate JS chunks for each route.

## Component Tree (11 Pages, 10+ Shared Components)

```
AppComponent
├── HeaderComponent (nav, theme toggle, user menu, search)
├── RouterOutlet
│   ├── LoginComponent
│   ├── RegisterComponent
│   ├── DashboardComponent (KPIs, chart, interviews, activity)
│   ├── ApplicationsComponent (kanban + list views)
│   ├── ApplicationDetailComponent (detail, AI, interviews, notes)
│   ├── CoverLetterWizardComponent (3-step wizard)
│   ├── CompaniesComponent (list + search)
│   ├── CompanyDetailComponent (detail + related apps)
│   ├── InterviewsComponent (list + create)
│   ├── InterviewPrepComponent (prep notes, questions, progress)
│   └── SettingsComponent (profile, resume, theme)
├── Shared Components
│   ├── StatusBadgeComponent
│   ├── ModalComponent
│   ├── LoadingSkeletonComponent
│   ├── EmptyStateComponent
│   └── ErrorBannerComponent
```

## Zoneless Notes

- `provideZonelessChangeDetection()` enables zoneless mode
- No zone.js needed — smaller bundle
- Change detection triggered by: signal set(), async operations, event handlers
- `ngOnInit` still works for initialization
- `afterNextRender` used for browser-only code (theme init)
