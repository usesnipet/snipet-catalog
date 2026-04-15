import { Services } from "@/core/services/index.js";
import { Logger } from "@/logger.js";
import type { FastifyInstance } from "fastify";
import { createPluginsController } from "./plugins.controller.js";
import { createSystemController } from "./system.controller.js";

export interface ControllersDeps {
  services: Services;
  logger: Logger;
}

/**
 * Registers all API controllers.
 * @param app - Fastify instance
 */
export function createControllers(app: FastifyInstance, deps: ControllersDeps) {
  createSystemController(app, {
    service: deps.services.systemService,
    logger: deps.logger.child("system")
  });

  createPluginsController(app, {
    pluginService: deps.services.pluginService,
    logger: deps.logger.child("plugins"),
  });
}
