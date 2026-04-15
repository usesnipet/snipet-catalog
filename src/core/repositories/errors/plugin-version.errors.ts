/**
 * PluginVersion repository errors.
 */
export class PluginVersionNotFoundError extends Error {
  code = "PLUGIN_VERSION_NOT_FOUND";

  constructor(message: string) {
    super(message);
    this.name = "PluginVersionNotFoundError";
  }
}

export class PluginVersionConflictError extends Error {
  code = "PLUGIN_VERSION_CONFLICT";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PluginVersionConflictError";
  }
}

export class PluginVersionPluginNotFoundError extends Error {
  code = "PLUGIN_VERSION_PLUGIN_NOT_FOUND";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PluginVersionPluginNotFoundError";
  }
}

