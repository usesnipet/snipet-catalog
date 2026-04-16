import { createRepositories } from "@/core/repositories/index.js";
import { createServices } from "@/core/services/index.js";
import { acquirePrismaClient, releasePrismaClient } from "@/infra/prisma/index.js";
import { Logger } from "@/logger.js";

type CompositionRootDeps = {
  appId: string;
  logger: Logger;
};

export async function createCompositionRoot({ logger, appId: appName }: CompositionRootDeps) {
  const prisma = await acquirePrismaClient(appName);

  const repositories = createRepositories({
    prisma,
    logger: logger.child("repository"),
  });
  const services = await createServices({
    repositories,
    logger: logger.child("service"),
  });

  return {
    repositories,
    services,
    close: async () => {
      await releasePrismaClient(appName);
    },
  };
}