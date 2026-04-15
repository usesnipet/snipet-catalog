import type { JobConsumerRegisterOptions } from "@/core/dispatch/dispatch.types.js";
import { Dispatch, JobHandler } from "@/core/dispatch/index.js";
import type { Repositories } from "@/core/repositories/index.js";
import type { Services } from "@/core/services/index.js";
import type { Logger } from "@/logger.js";

/**
 * Context passed to each job's handle function.
 * Contains all dependencies available at bootstrap time.
 */
export interface WorkerContext {
  repositories: Repositories;
  services: Services;
  dispatch: Dispatch;
  logger: Logger;
}

/**
 * Job definition for background jobs.
 * Each job file implements this interface.
 */
export interface Job<T = unknown> {
  queueName: string;
  /** Passed to {@link JobConsumer.register} (pg-boss `work` options). */
  workOptions?: JobConsumerRegisterOptions;
  execute: (ctx: WorkerContext) => JobHandler<T>;
}
