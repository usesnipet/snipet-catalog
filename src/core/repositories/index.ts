import { Logger } from "@/logger.js";
import { PrismaClient } from "@prisma/client";
import { createPluginRepository } from "./plugin.repository.js";
import { createPluginVersionRepository } from "./plugin-version.repository.js";
import { createTransactionManager } from "./transaction-manager.js";

type RepositoryDeps = {
  prisma: PrismaClient;
  logger: Logger;
};

export function createRepositories(deps: RepositoryDeps) {
  const { prisma, logger } = deps;
  const transactionManager = createTransactionManager({ prisma });

  return {
    transactionManager,
    pluginRepository: createPluginRepository({ prisma, logger: logger.child("plugin") }),
    pluginVersionRepository: createPluginVersionRepository({
      prisma,
      logger: logger.child("plugin-version"),
    }),
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

export * from "./plugin.repository.js";
export * from "./plugin-version.repository.js";
export * from "./repository-opts.js";
export * from "./transaction-manager.js";