import type { Logger } from "@/logger.js";
import { dbHttpErrors } from "./db.http-errors.js";
import { systemHttpErrors } from "./system.http-errors.js";
import type { HttpError, HttpErrorMapper } from "./types.js";

const mappers: HttpErrorMapper[] = [
  systemHttpErrors,
  dbHttpErrors,
];

function fallbackHttpError(error: unknown): HttpError {
  if (error instanceof Error) {
    return { status: 500, body: { error: error.message ?? "Internal error" } };
  }
  return { status: 500, body: { error: "Internal error" } };
}

/**
 * Converts a domain/core error into an HTTP response contract (status/body/headers).
 * Centralizes HTTP mapping while preserving neverthrow flow (no throws required).
 */
export function toHttpError(error: unknown, logger?: Logger): HttpError {
  for (const mapper of mappers) {
    const out = mapper(error);
    if (out) return out;
  }

  if (logger) logger.error("Unhandled error (no HTTP mapping found)", { error });
  return fallbackHttpError(error);
}

