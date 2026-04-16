import "dotenv/config";
import { bootstrapServer } from "./apps/server.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

type ShutdownTask = () => Promise<void>;

async function bootstrap() {
  const shutdownTasks: ShutdownTask[] = [];

  if (env.APPS.includes("server")) shutdownTasks.push(await bootstrapServer());

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
