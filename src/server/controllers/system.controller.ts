import { SystemService } from "@/core/services/system.service.js";
import { Logger } from "@/logger.js";
import { FastifyInstance } from "fastify";
import z from "zod";

interface SystemControllerDeps {
  service: SystemService;
  logger: Logger;
}

export function createSystemController(app: FastifyInstance, deps: SystemControllerDeps) {
  const { service, logger } = deps;

  app.get("/api/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      response: { 200: z.object({ status: z.string() }) },
    },
    handler: async () => ({ status: "ok" }),
  });
  app.get("/api/version", {
    schema: {
      description: "Version endpoint",
      tags: ["System"],
      response: { 200: z.object({ version: z.string() }) },
    },
    handler: async () => {
      const result = await service.getVersion();
      return result.match(
        (version) => ({ version }),
        (err) => {
          logger.error("Error getting version", { err });
          return { error: "Internal error" };
        }
      );
    },
  });
}