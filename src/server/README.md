# Server

HTTP layer — Fastify routes, controllers, plugins, and request/response schemas.

## Structure

| Folder | Purpose |
|--------|---------|
| **controllers/** | Route handlers — one controller per domain (embedding-profiles, knowledge-sources, etc.). |
| **schemas/** | Request/response Zod schemas — query params, pagination, API-specific validation. |
| **plugins/** | Fastify plugins — Prisma, CORS, Swagger, etc. |
| **utils/** | Server-specific utilities (converters, etc.). |

## Controllers

Controllers use the **factory pattern**: `createXxxV1Controller(app, deps)`. They receive services and logger via `deps` and register routes on the Fastify instance.

- `embedding-profiles-v1` — EmbeddingProfile CRUD
- `embedding-processes-v1` — EmbeddingProcess CRUD
- `knowledge-bases-v1` — KnowledgeBase CRUD
- `knowledge-sources-v1` — KnowledgeSource CRUD + sync
- `llms-v1` — LLM CRUD
- `llm-calls-v1` — LLMCall CRUD

## API

- **Swagger UI**: `/swagger`
- **Health**: `GET /health`
