# Database Schema — Hermes Job Tracker

## ER Diagram

```mermaid
erDiagram
    User ||--o{ JobApplication : creates
    User ||--o{ Company : creates
    User ||--o{ Interview : schedules
    User ||--o{ CoverLetter : writes
    User ||--o{ AIAnalysis : requests
    User ||--o{ UserSettings : has

    Company ||--o{ JobApplication : has
    Company ||--o{ Interview : hosts

    JobApplication ||--o{ Interview : includes
    JobApplication ||--o{ CoverLetter : for
    JobApplication ||--o{ AIAnalysis : analyzed_by

    Interview ||--o{ InterviewQuestion : has
```

## Entities (8)

| Entity | Fields | Relations |
|--------|--------|-----------|
| User | id, email, passwordHash, name, createdAt, updatedAt | 1:M with everything |
| Company | id, userId, name, website?, location?, notes?, contactName?, contactEmail?, contactPhone?, createdAt, updatedAt | M:1 User, 1:M apps + interviews |
| JobApplication | id, userId, companyId, title, description?, salary?, location?, url?, notes?, status, resumeText?, appliedAt?, createdAt, updatedAt | M:1 User, M:1 Company, 1:M interviews/coverLetters/analyses |
| Interview | id, userId, applicationId, companyId, type, dateTime, contactName?, contactEmail?, notes?, prepNotes?, feedback?, completed, createdAt, updatedAt | M:1 User, M:1 Application, M:1 Company, 1:M questions |
| InterviewQuestion | id, interviewId, question, answer?, sortOrder | M:1 Interview |
| CoverLetter | id, userId, applicationId, content, tone, length, version, createdAt | M:1 User, M:1 Application |
| AIAnalysis | id, userId, applicationId, resumeText, matchScore, strengths, gaps, suggestions, modelUsed, createdAt | M:1 User, M:1 Application |
| UserSettings | id, userId, resumeText?, theme, preferences?, updatedAt | 1:1 User |

## Status Machine

```mermaid
stateDiagram-v2
    [*] --> Saved
    Saved --> Applied
    Applied --> Screening
    Screening --> Interview
    Interview --> Offer
    Offer --> Accepted
    Saved --> Withdrawn
    Applied --> Withdrawn
    Screening --> Withdrawn
    Interview --> Withdrawn
    Offer --> Withdrawn
    Saved --> Rejected
    Applied --> Rejected
    Screening --> Rejected
    Interview --> Rejected
    Offer --> Rejected
    Accepted --> [*]
    Withdrawn --> [*]
    Rejected --> [*]
```

## Migration Strategy

- **Dev:** `synchronize: true` with better-sqlite3 — TypeORM auto-creates tables
- **Prod:** Use TypeORM migrations with PostgreSQL — SQL files in `apps/api/migrations/`
- **Neon:** Set `type: 'postgres'` in TypeORM config, use proper connection URL
