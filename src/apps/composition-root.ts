import { createDispatch } from "@/core/dispatch/index.js";
import { createRepositories } from "@/core/repositories/index.js";
import { createServices } from "@/core/services/index.js";
import { env } from "@/env.js";
import { createInfra } from "@/infra/index.js";
import { acquirePrismaClient, releasePrismaClient } from "@/infra/prisma/index.js";
import { Logger } from "@/logger.js";

type CompositionRootDeps = {
  appId: string;
  logger: Logger;
};

export async function createCompositionRoot({ logger, appId: appName }: CompositionRootDeps) {
  const prisma = await acquirePrismaClient(appName);
  const { close: closeInfra, providers: infra } = await createInfra({ logger: logger.child("infra") });

  const repositories = createRepositories({
    prisma,
    logger: logger.child("repository"),
  });
  const dispatch = createDispatch({
    publisher: infra.jobPublisher,
    logger,
  });
  const services = await createServices({
    repositories,
    logger: logger.child("service"),
    infra,
    dispatch,
  });

  return {
    infra,
    repositories,
    dispatch,
    services,
    close: async () => {
      await releasePrismaClient(appName);
      await closeInfra();
    },
  };
}