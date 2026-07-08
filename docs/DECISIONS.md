# Decisions — Hermes Job Tracker

## ADR-1: Strategy Pattern for AI Integration

**Context:** Need AI features (match analysis, cover letter generation) without requiring an OpenAI API key.

**Decision:** Use Strategy Pattern with `AIStrategy` and `CoverLetterStrategy` interfaces. OpenAIStrategy uses the OpenAI API when `OPENAI_API_KEY` is set; `LocalFallbackStrategy` uses heuristic keyword matching and template-based generation.

**Consequences:** Zero-dependency fallback works out of the box. Real LLM integration requires only setting the env var — no code changes.

## ADR-2: Status Machine with Valid Transitions

**Context:** Applications have a lifecycle that must be enforced — invalid transitions (e.g., accepted → applied) should be impossible.

**Decision:** Use a transition map (`Record<string, string[]>`) that defines valid next states for each current state. Terminal states (accepted, rejected, withdrawn) have empty arrays.

**Consequences:** Clean enforcement at the service layer; no invalid states possible. SSE events fire on every status change.

## ADR-3: SSE over WebSocket

**Context:** Dashboard needs real-time updates when application status changes.

**Decision:** Use Server-Sent Events (SSE) via `@Sse()` decorator with RxJS Subject. Simpler than WebSocket for unidirectional data flow.

**Consequences:** No socket.io dependency. Browser natively reconnects. One-direction only (server → client), which is sufficient.

## ADR-4: Signal-First Frontend Architecture

**Context:** Angular 22 provides signals as the primary state management primitive.

**Decision:** All component state uses signal(), computed(), input(), output(). No @Input/@Output decorators. Zoneless change detection via provideZonelessChangeDetection().

**Consequences:** More predictable rendering, no zone pollution, smaller bundle. Slightly more verbose for some patterns.

## ADR-5: SQLite for Development, PostgreSQL-Compatible Schema

**Context:** Need fast local development without database server dependencies.

**Decision:** Use better-sqlite3 via TypeORM for dev with `synchronize: true`. Schema designed to be PostgreSQL-compatible for production deployment.

**Consequences:** Zero-config local dev. Migration to Neon/PostgreSQL requires changing config and running proper migrations.

## ADR-6: JSON Strings for Array Fields

**Context:** SQLite doesn't support JSON arrays natively.

**Decision:** Store arrays (strengths, gaps, suggestions) as JSON-encoded strings in TEXT columns. Parse on read, stringify on write.

**Consequences:** Works with both SQLite and PostgreSQL JSON columns. Slightly more code in serialization/deserialization.

## ADR-7: Composite Indexes for Dashboard Queries

**Context:** Dashboard queries filter by userId + status for KPI computation.

**Decision:** Added composite index on `(userId, status)` for job_applications table.

**Consequences:** Dashboard queries benefit from index-only scans. Slight write overhead on status changes.
