
import type { Logger } from "@/logger.js";
import type { JobPublisher } from "./dispatch.types.js";

export type CreateDispatchDeps = {
  publisher: JobPublisher;
  logger: Logger;
};

/**
 * Creates all dispatch facades (validate-then-publish). Does not start consumers.
 * @param deps - Publisher port, repositories, ingestion adapter, logger
 */
export function createDispatch(deps: CreateDispatchDeps) {
  const { publisher, logger } = deps;

}

export type Dispatch = ReturnType<typeof createDispatch>;

export * from "./dispatch.types.js";
