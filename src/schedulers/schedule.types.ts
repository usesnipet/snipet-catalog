import type { Repositories } from "@/core/repositories/index.js";
import type { Services } from "@/core/services/index.js";
import type { Logger } from "@/logger.js";

/**
 * Context passed to each schedule's execute function.
 * Contains all dependencies available at bootstrap time.
 */
export interface ScheduleContext {
  repositories: Repositories;
  services: Services;
  logger: Logger;
}

/**
 * Schedule definition for cron jobs.
 * Each scheduler file implements this interface.
 */
export interface Schedule {
  /** Unique name for logging and identification */
  name: string;
  /** Cron expression (e.g. "* * * * *" for every minute) */
  cronExpression: string;
  /** If true, runs immediately when the app starts */
  executeOnBootstrap: boolean;
  /** The function to execute on each run */
  execute: (ctx: ScheduleContext) => Promise<void>;
}
