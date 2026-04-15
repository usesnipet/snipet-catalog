import { createLogger } from "@/logger.js";
import { schedules } from "@/schedulers/index.js";
import cron from "node-cron";
import { createCompositionRoot } from "./composition-root.js";

const logger = createLogger({ context: "cron" });

/**
 * Bootstraps the cron/scheduler jobs.
 * Registers all schedules from the schedulers index.
 */
export async function bootstrapCron() {
  const {
    close,
    repositories,
    services,
    infra,
  } = await createCompositionRoot({ logger, appId: "cron" });

  const ctx = {
    repositories,
    services,
    logger: logger.child("schedule"),
  };

  const tasks: cron.ScheduledTask[] = [];

  for (const schedule of schedules) {
    const run = () => {
      schedule.execute(ctx).catch((err) => {
        logger.error("Schedule execution error", { schedule: schedule.name, err });
      });
    };

    const task = cron.schedule(schedule.cronExpression, run, { timezone: "UTC" });
    tasks.push(task);

    if (schedule.executeOnBootstrap) {
      run();
    }
  }

  logger.info("Cron jobs started", { count: schedules.length });

  return async function shutdownCron() {
    for (const task of tasks) {
      task.stop();
    }
    await close();
    logger.info("Cron jobs stopped");
  };
}