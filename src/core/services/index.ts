import { Repositories } from "@/core/repositories/index.js";
import { Logger } from "@/logger.js";
import { createPluginService } from "./plugin.service.js";
import { createSystemService } from "./system.service.js";

type ServicesDeps = {
  repositories: Repositories;
  logger: Logger;
};

export async function createServices(deps: ServicesDeps) {
  const { logger, repositories } = deps;

  const systemService = createSystemService({ logger: logger.child("system") });
  const pluginService = createPluginService({
    logger: logger.child("plugin"),
    pluginRepository: repositories.pluginRepository,
    pluginVersionRepository: repositories.pluginVersionRepository,
    transactionManager: repositories.transactionManager,
  });

  return {
    systemService,
    pluginService,
  };
}
export type Services = Awaited<ReturnType<typeof createServices>>;

export * from "./system.service.js";
export * from "./plugin.service.js";

