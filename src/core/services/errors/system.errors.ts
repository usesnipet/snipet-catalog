/**
 * System / platform service errors.
 */
export class SystemVersionReadError extends Error {
  code = "SYSTEM_VERSION_READ_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "SystemVersionReadError";
  }
}
