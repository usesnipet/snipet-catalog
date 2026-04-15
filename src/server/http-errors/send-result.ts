import type { FastifyReply } from "fastify";
import type { Logger } from "@/logger.js";
import type { Result } from "neverthrow";
import { toHttpError } from "./to-http-error.js";

type SendResultOptions = {
  okStatus?: number;
};

/**
 * Sends a neverthrow Result as an HTTP response using the global error mappers.
 */
export function sendResult<T, E>(
  reply: FastifyReply,
  logger: Logger,
  result: Result<T, E>,
  options?: SendResultOptions,
) {
  return result.match(
    (value) => {
      if (options?.okStatus) {
        reply.status(options.okStatus);
        if (options.okStatus === 204) return reply.send();
      }
      return reply.send(value as unknown);
    },
    (error) => {
      const httpError = toHttpError(error, logger);

      if (httpError.headers) {
        for (const [k, v] of Object.entries(httpError.headers)) reply.header(k, v);
      }

      if (httpError.isExpected) {
        logger.debug("Request failed with expected error", {
          code: httpError.body.code,
          status: httpError.status,
        });
      } else {
        logger.error("Request failed with unexpected error", {
          code: httpError.body.code,
          status: httpError.status,
          error,
        });
      }

      return reply.status(httpError.status).send(httpError.body);
    },
  );
}

