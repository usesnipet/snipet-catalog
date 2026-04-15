import type { JobPublisher } from "@/core/dispatch/dispatch.types.js";
import type { PgBossInstance } from "./pg-boss.factory.js";
import { err, ok } from "neverthrow";
import { DispatchError } from "@/core/dispatch/errors/index.js";

/**
 * Adapts pg-boss `send` to the core {@link JobPublisher} port.
 * @param boss - Started pg-boss instance
 */
export function createPgBossJobPublisher(boss: PgBossInstance): JobPublisher {
  return {
    async run(queueName: string, data: unknown) {
      try {
        const id = await boss.send(queueName, data as object);
        if (!id) {
          return err(new DispatchError("Job not sent", { cause: "Job not sent" }));
        }
        return ok({ id, data, status: "pending" });
      } catch (error) {
        return err(new DispatchError((error as Error).message, error));
      }
    },
  };
}
