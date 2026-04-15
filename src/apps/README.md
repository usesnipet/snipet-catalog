# Apps

Entry points for each runnable application. Each file bootstraps its own process.

## Applications

| File | Purpose |
|------|---------|
| **server.ts** | HTTP API — Fastify, Swagger, controllers. Runs the REST API. |
| **worker.ts** | Queue workers — processes background jobs from queues. |
| **cron.ts** | Scheduled jobs — runs schedulers (e.g. knowledge source sync) on a cron schedule. |

## Bootstrap flow

1. **server** — Registers plugins (Prisma, etc.), loads presets, creates repositories and services, registers routes, listens on `PORT`.
2. **worker** — Acquires Prisma client, starts queue workers. Jobs live in `src/worker/jobs/`.
3. **cron** — Acquires Prisma client, loads presets, creates repositories/services, registers all schedules from `src/schedulers/`, runs them by cron expression (UTC).

## Running

Typically invoked via CLI or process manager (e.g. `tsx src/apps/server.ts`, `tsx src/apps/cron.ts`). See project root for scripts.
