# Entity Rules

Business rules and lifecycle constraints for domain entities.

---

## EmbeddingProfile

- **Immutable**: Once created, an EmbeddingProfile CANNOT be modified. To change configuration, deprecate it and create a new one.
  - Reason: Existing embeddings would become inconsistent with a modified profile (different chunk size, model, etc.). Immutability ensures data consistency and traceability.
- **Deletion**: Deletion is not allowed if the profile is in use by any source or process.
- **Deprecation**: Use status `DEPRECATED` instead of deleting when the profile is no longer active.

---

## EmbeddingProcess

Represents a single execution of the embedding pipeline. Records:

- `embeddingProfileId` — which profile was used
- `metadata` — source info, document references, etc.
- `processedAt` — execution timestamp

Chunk data stored in the vector store should include `embedding_profile_id` and `source_id` for traceability.

---

## KnowledgeSource

- **Embedding profile**: When creating a source, you must provide either the `embeddingProfileId` or the full profile configuration (to create one inline).
- **Archiving**: Sources can be archived (`status: ARCHIVED`). Archived sources are no longer used in embedding runs.
