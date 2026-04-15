export type HttpErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

export type HttpError = {
  status: number;
  body: HttpErrorBody;
  headers?: Record<string, string>;
  /**
   * If true, the handler should avoid logging as "unexpected error"
   * (useful for expected 4xx and upstream failures).
   */
  isExpected?: boolean;
};

export type HttpErrorMapper = (error: unknown) => HttpError | null;

