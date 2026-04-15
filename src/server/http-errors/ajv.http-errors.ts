import {
  AjvDecryptionError,
  AjvEncryptionError,
  AjvValidationFailedError,
} from "@/core/helpers/errors/ajv.errors.js";
import type { HttpErrorMapper } from "./types.js";

export const ajvHttpErrors: HttpErrorMapper = (error) => {
  if (error instanceof AjvValidationFailedError) {
    return {
      status: 400,
      body: {
        error: error.message || "Validation failed",
        code: error.code,
        details: error.details,
      },
      isExpected: true,
    };
  }

  if (error instanceof AjvEncryptionError) {
    return {
      status: 500,
      body: {
        error: "Internal error",
        code: error.code,
      },
    };
  }

  if (error instanceof AjvDecryptionError) {
    return {
      status: 500,
      body: {
        error: "Internal error",
        code: error.code,
      },
    };
  }

  return null;
};

