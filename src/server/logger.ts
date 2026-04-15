import { createLogger, LoggerOptions } from "@/logger.js";

/**
 * Creates a Fastify-compatible logger instance.
 * Use with Fastify: Fastify({ logger: { loggerInstance: createFastifyLogger() } })
 * @param options - Logger options (context, minLevel)
 * @returns Logger instance compatible with Fastify's logger interface
 */
export function createFastifyLogger(options: LoggerOptions = {}) {
  const base = createLogger({ ...options, context: options.context ?? "server" });

  function logWithPinoStyle(level: "info" | "error" | "debug" | "warn", ...args: unknown[]) {
    const [first, second] = args;
    if (typeof first === "object" && first !== null && typeof second === "string") {
      base[level](second, first);
    } else if (typeof first === "string") {
      base[level](first, ...args.slice(1));
    }
  }

  return {
    info: (...args: unknown[]) => logWithPinoStyle("info", ...args),
    error: (...args: unknown[]) => logWithPinoStyle("error", ...args),
    debug: (...args: unknown[]) => logWithPinoStyle("debug", ...args),
    warn: (...args: unknown[]) => logWithPinoStyle("warn", ...args),
    fatal: (...args: unknown[]) => logWithPinoStyle("error", ...args),
    trace: (...args: unknown[]) => logWithPinoStyle("debug", ...args),
    silent: (..._args: unknown[]) => {},
    child: (bindings: Record<string, unknown>, _opts?: Record<string, unknown>) => {
      const reqId = bindings.reqId ?? (bindings.req as { id?: string })?.id;
      const childContext = reqId ? `req:${reqId}` : "request";
      return createFastifyLogger({
        ...options,
        context: options.context ? `${options.context}:${childContext}` : childContext,
        minLevel: options.minLevel,
      });
    },
    level: "info",
  };
}
