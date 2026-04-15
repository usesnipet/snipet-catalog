import { Prisma } from "@prisma/client";
import { DbError } from "./errors/db.errors.js";

/**
 * Maps a thrown Prisma/driver error to a typed repository DB error.
 * @param ErrorClass - Entity-specific error constructor
 * @param cause - Original error
 */
export function toEntityDbError<E>(
  ErrorClass: new (message: string, cause?: unknown) => E,
  cause: unknown,
): E {
  const message = cause instanceof Error ? cause.message : "Unexpected database error";
  return new ErrorClass(message, cause);
}

/** @deprecated Prefer {@link toEntityDbError} with an entity-specific error class */
export function toDbError(cause: unknown): DbError {
  return toEntityDbError(DbError, cause);
}

export function isPrismaUniqueViolation(e: unknown): boolean {
  return e instanceof Error && "code" in e && (e as { code: string }).code === "P2002";
}

export function isPrismaRecordNotFound(e: unknown): boolean {
  return e instanceof Error && "code" in e && (e as { code: string }).code === "P2025";
}

export function isPrismaForeignKeyViolation(e: unknown): boolean {
  return e instanceof Error && "code" in e && (e as { code: string }).code === "P2003";
}

export function toNullableJsonInput<T>(
  value: T | null | undefined
): T | typeof Prisma.JsonNull | typeof Prisma.DbNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.DbNull;
  return value;
}