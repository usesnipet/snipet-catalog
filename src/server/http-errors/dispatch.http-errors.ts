import {
  DispatchError,
  InvalidJobPayloadError,
  JobHandlerReturnedErrError,
} from "@/core/dispatch/errors/dispatch.errors.js";
import type { HttpErrorMapper } from "./types.js";

export const dispatchHttpErrors: HttpErrorMapper = (error) => {
  if (error instanceof InvalidJobPayloadError) {
    return {
      status: 400,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  if (error instanceof JobHandlerReturnedErrError) {
    return {
      status: 500,
      body: { error: "Internal error", code: error.code },
    };
  }

  if (error instanceof DispatchError) {
    return {
      status: 500,
      body: { error: "Internal error", code: error.code },
    };
  }

  return null;
};

