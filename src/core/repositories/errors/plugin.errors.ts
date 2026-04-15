/**
 * Plugin repository errors.
 */
export class PluginNotFoundError extends Error {
  code = "PLUGIN_NOT_FOUND";

  constructor(message: string = "Plugin not found", public readonly cause?: unknown) {
    super(message);
    this.name = "PluginNotFoundError";
  }
}

export class PluginConflictError extends Error {
  code = "PLUGIN_CONFLICT";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PluginConflictError";
  }
}

