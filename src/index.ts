import "dotenv/config";
import { bootstrapCron } from "./apps/cron.js";
import { bootstrapServer } from "./apps/server.js";
import { bootstrapWorker } from "./apps/worker.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

type ShutdownTask = () => Promise<void>;

async function bootstrap() {
  const shutdownTasks: ShutdownTask[] = [];

  if (env.APPS.includes("server")) shutdownTasks.push(await bootstrapServer());
  if (env.APPS.includes("worker")) shutdownTasks.push(await bootstrapWorker());
  if (env.APPS.includes("cron")) shutdownTasks.push(await bootstrapCron());

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`Received ${signal}. Shutting down applications...`);
    await Promise.allSettled(shutdownTasks.map((task) => task()));
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

bootstrap().catch((err) => {
  logger.error("Bootstrap failed", err);
  process.exit(1);
});
