import { JobHandlerReturnedErrError } from "@/core/dispatch/errors/index.js";
import type {
  JobConsumer,
  JobConsumerRegisterOptions,
  JobHandler,
} from "@/core/dispatch/dispatch.types.js";
import type { WorkOptions } from "pg-boss";
import type { PgBossInstance } from "./pg-boss.factory.js";

/**
 * Adapts pg-boss `work` to the core {@link JobConsumer} port.
 * Handlers receive one job at a time; pg-boss batches are iterated in order.
 * @param boss - pg-boss instance (must be started after handlers are registered)
 */
export function createPgBossJobConsumer(boss: PgBossInstance): JobConsumer {
  return {
    async register<T>(
      queueName: string,
      handler: JobHandler<T>,
      options?: JobConsumerRegisterOptions,
    ) {
      const runBatch = async (jobs: { id: string; data: T }[]) => {
        for (const job of jobs) {
          const result = await handler({ id: job.id, data: job.data });
          if (result.isErr()) {
            throw new JobHandlerReturnedErrError(
              `Job handler returned Err for job ${job.id}`,
              job.id,
              result.error,
            );
          }
        }
      };

      const workOpts = options as WorkOptions | undefined;
      if (workOpts !== undefined && Object.keys(workOpts).length > 0) {
        await boss.work<T>(queueName, workOpts, runBatch);
      } else {
        await boss.work<T>(queueName, runBatch);
      }
    },

    async start() {
      await boss.start();
    },

    async stop() {
      await boss.stop();
    },
  };
}
