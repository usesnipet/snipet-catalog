import { DbError } from "@/core/repositories/errors/db.errors.js";
import type { HttpErrorMapper } from "./types.js";

export const dbHttpErrors: HttpErrorMapper = (error) => {
  if (error instanceof DbError) {
    return {
      status: 500,
      body: { error: "Internal error", code: (error as { code?: string }).code },
    };
  }

  return null;
};

