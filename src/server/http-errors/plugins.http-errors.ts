import type { HttpErrorMapper } from "./types.js";
import {
  PluginConflictError,
  PluginNotFoundError,
} from "@/core/repositories/errors/plugin.errors.js";
import {
  PluginVersionConflictError,
  PluginVersionNotFoundError,
  PluginVersionPluginNotFoundError,
} from "@/core/repositories/errors/plugin-version.errors.js";

export const pluginsHttpErrors: HttpErrorMapper = (error) => {
  if (error instanceof PluginNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  if (error instanceof PluginConflictError) {
    return {
      status: 409,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  if (error instanceof PluginVersionNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  if (error instanceof PluginVersionPluginNotFoundError) {
    return {
      status: 404,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  if (error instanceof PluginVersionConflictError) {
    return {
      status: 409,
      body: { error: error.message, code: error.code },
      isExpected: true,
    };
  }

  return null;
};

