import type { JobConsumer, JobPublisher } from "@/core/dispatch/dispatch.types.js";
import { env } from "@/env.js";
import { Logger } from "@/logger.js";
import { createPgBoss, createPgBossJobConsumer, createPgBossJobPublisher } from "./messaging/index.js";

export type InfraProviders = {
  jobPublisher: JobPublisher;
  jobConsumer: JobConsumer;
};

export type CreateInfraDeps = { logger: Logger };

/**
 * Creates infra dependencies.
 *
 * @param deps - Infra dependencies
 * @returns Infra object with created providers and close lifecycle hook
 */
export async function createInfra(deps: CreateInfraDeps) {
  const { logger } = deps;

  const boss = createPgBoss(
    env.POSTGRES_PG_BOSS_DATABASE_URL,
    env.POSTGRES_PG_BOSS_DATABASE_SCHEMA,
    logger.child("pg-boss"),
  );

  const jobPublisher = createPgBossJobPublisher(boss);
  const jobConsumer = createPgBossJobConsumer(boss);

  return {
    providers: {
      jobPublisher,
      jobConsumer,
    } as InfraProviders,
    close: async () => {
      await boss.stop().catch(console.error);
    },
  };
}

export type Infra = Awaited<ReturnType<typeof createInfra>>;
