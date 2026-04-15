import type { Logger } from "@/logger.js";
import { PgBoss } from "pg-boss";

export type PgBossInstance = InstanceType<typeof PgBoss>;

/**
 * Creates a pg-boss instance. Caller must call {@link PgBossInstance.start} before send/work
 * and {@link PgBossInstance.stop} on shutdown.
 * @param connectionString - Postgres URL (same DB as app migrations)
 * @param logger - Logger for bootstrap issues
 */
export function createPgBoss(connectionString: string, schema: string, logger: Logger): PgBossInstance {
  const boss = new PgBoss({
    connectionString,
    schema,
    application_name: "snipet-pg-boss",
  });
  boss.on("error", (error) => {
    logger.error("pg-boss error", { error });
  });
  return boss;
}
