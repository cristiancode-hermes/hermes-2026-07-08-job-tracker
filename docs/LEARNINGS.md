# Learnings — Hermes Job Tracker (2026-07-08)

## What Worked
1. **Parallel subagent delegation** produced ~95% working code for both backend and frontend. The backend compiled first time after minor seed type fixes. The frontend needed one TitleCasePipe import fix.
2. **Design specs from UX designer** remain incredibly valuable — skipping Phase 1 saved ~15 minutes and produced a better-designed product.
3. **18th consecutive build from design specs** — workflow extremely optimized.
4. **Angular 22 + Tailwind v4 + CSS variable dark mode** — established pattern after many projects.

## What Needed Fixing
1. **TypeScript 5.9 decorator changes** caused TS1240 errors with NestJS decorators. Fixed by using `nest build` (which uses SWC) instead of `nest build --tsc`.
2. **Seed service type inference** — `const apps = []` was typed as `never[]`. Fixed with explicit `JobApplication[]` annotation.
3. **Mixed `save()` calls in arrays** — mixing `create()` and `save()` results in an array caused TS2769 overload errors. Fixed by saving each entity individually.

## Key Lessons for Tomorrow
1. Always use `nest build` (not `--tsc`) for SWC-based decorator compilation — it handles TypeORM decorators correctly.
2. Explicitly type all arrays in seed services.
3. Save entities one at a time in seed, not in array shorthand with mixed `save`/`create` calls.
4. TitleCasePipe needs to be imported separately from DatePipe.
5. GITHUB_TOKEN is now available after sourcing export-cron-env.sh! Can finally push to GitHub.
