import { SystemVersionReadError } from "@/core/services/errors/system.errors.js";
import type { HttpErrorMapper } from "./types.js";

export const systemHttpErrors: HttpErrorMapper = (error) => {
  if (error instanceof SystemVersionReadError) {
    return {
      status: 500,
      body: { error: "Internal error", code: error.code },
    };
  }
  return null;
};

