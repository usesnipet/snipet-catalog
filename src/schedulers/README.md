# Schedulers

Cron-based scheduled jobs. Each schedule runs at a fixed interval (cron expression) and receives the full context (repositories, services, logger).

## Structure

| File | Purpose |
|------|---------|
| **schedule.types.ts** | `Schedule` interface and `ScheduleContext` type. |
| **index.ts** | Registers all schedules. Add new schedules here. |
| **sync-scheduler.ts** | Finds due knowledge source syncs, runs ingestion, records next run. |

## Schedule interface

```ts
interface Schedule {
  name: string;
  cronExpression: string;      // e.g. "* * * * *" (every minute)
  executeOnBootstrap: boolean; // run immediately on app start
  execute: (ctx: ScheduleContext) => Promise<void>;
}
```

## Adding a new schedule

1. Create a new file (e.g. `my-scheduler.ts`).
2. Export a `Schedule` object with `name`, `cronExpression`, `executeOnBootstrap`, and `execute`.
3. Import and add it to the `schedules` array in `index.ts`.

All schedules run in UTC.
