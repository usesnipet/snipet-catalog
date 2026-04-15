# Worker

Background job processing. Queue workers consume jobs from queues and execute them.

## Structure

| Folder | Purpose |
|--------|---------|
| **jobs/** | Job processors — one file per job type. Process individual queue messages. |
| **queues/** | Queue definitions and connection setup. |

## Bootstrap

The worker app (`src/apps/worker.ts`) acquires a Prisma client and starts the queue workers. Job and queue implementations are added here as the embedding pipeline and other async workloads are implemented.

## Conventions

- Jobs receive dependencies via factory pattern.
- Use the injected logger for traces and errors.
- Jobs should be idempotent when possible.
