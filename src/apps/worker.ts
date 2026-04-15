import { createLogger } from "@/logger.js";
import { createCompositionRoot } from "./composition-root.js";
import { jobs } from "@/worker/index.js";
import { WorkerContext } from "@/worker/worker.types.js";

const logger = createLogger({ context: "worker" });

export async function bootstrapWorker() {
  const {
    close,
    infra,
    services,
    repositories,
    dispatch,
  } = await createCompositionRoot({ logger, appId: "worker" });

  const context: WorkerContext = {
    repositories,
    services,
    dispatch,
    logger: logger.child("job"),
  }

  for (const job of jobs) {
    await infra.jobConsumer.register(job.queueName, job.execute(context), job.workOptions);
  }

  await infra.jobConsumer.start();
  logger.info("Job workers started");
  return async function shutdownWorker() {
    await infra.jobConsumer.stop();
    await close();
    logger.info("Job workers stopped");
  };
}