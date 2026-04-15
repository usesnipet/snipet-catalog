/**
 * Dispatch / job transport layer errors.
 */
export class DispatchError extends Error {
  code = "DISPATCH_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DispatchError";
  }
}

export class InvalidJobPayloadError extends DispatchError {
  code = "INVALID_JOB_PAYLOAD_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message, cause);
    this.name = "InvalidJobPayloadError";
  }
}

/**
 * Raised when a {@link JobHandler} returns `Err` so pg-boss can fail the job.
 * Wraps the handler's error for observability without rethrowing an untyped value.
 */
export class JobHandlerReturnedErrError extends DispatchError {
  code = "JOB_HANDLER_RETURNED_ERR";

  constructor(
    message: string,
    public readonly jobId: string,
    public readonly handlerError: unknown,
  ) {
    super(message, handlerError);
    this.name = "JobHandlerReturnedErrError";
  }
}
