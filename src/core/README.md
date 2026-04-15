# Core

Domain layer — business logic, schemas, repositories, and services. Framework-agnostic.

## Structure

| Folder | Purpose |
|--------|---------|
| **repositories/** | Data access — one file per Prisma model. CRUD operations. |
| **services/** | Business logic as factories. Orchestrate repositories and enforce rules. |
| **pipelines/** | Embedding pipelines. Chunking, preprocessing, embedding, indexing. |
| **embedding/** | Embedding components. Chunker, pre-processor, embedder, indexer. |
| **helpers/** | Helper functions |
| **schemas/** | Zod schemas — validation and DTOs. Source of truth for API contracts. |
| **sources/** | Abstract interfaces for ingestion and retrieval (S3, etc.). |
| **errors/** | Custom domain errors with unique `code` and `message`. |
| **utils/** | Shared utilities used by services. |

## Conventions

- **Factory pattern**: Services and repositories receive dependencies via `deps`, return an object with methods.
- **Result types**: Use `neverthrow` (`Result<T, E>`) for operations that can fail.
- **Schema boundaries**: Services only receive/return schema types — never raw Prisma types.
- **Logger**: Injected via `deps`; use `logger.debug()` for traces, `logger.error()` for failures.

## Domains

- **EmbeddingProfile** / **EmbeddingProcess** — embedding pipeline configuration and execution logs
- **KnowledgeBase** / **KnowledgeSource** — knowledge bases and their data sources
- **LLM** / **LLMCall** — LLM configuration and usage tracking
- **Preset** — JSON Schema presets for validating configs (sources, LLMs)
