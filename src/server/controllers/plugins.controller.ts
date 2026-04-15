import type { FastifyInstance, FastifyRequest } from "fastify";
import z from "zod";
import type { Logger } from "@/logger.js";
import type { PluginService } from "@/core/services/index.js";
import {
  createPluginSchema,
  updatePluginSchema,
  createPluginVersionSchema,
  pluginSchema,
  CreatePlugin,
  UpdatePlugin,
  CreatePluginVersion,
} from "@/core/schemas/index.js";
import { sendResult } from "@/server/http-errors/send-result.js";
import {
  IdParams,
  QueryParams,
  errorResponseSchema,
  idParamsSchema,
  queryParamsSchema,
} from "@/server/schemas/index.js";
import type { FastifyZodOpenApiTypeProvider } from "fastify-zod-openapi";

interface PluginsControllerDeps {
  pluginService: PluginService;
  logger: Logger;
}

/**
 * Registers Plugin and PluginVersion routes.
 * @param app - Fastify instance
 */
export function createPluginsController(
  app: FastifyInstance<any, any, any, any, FastifyZodOpenApiTypeProvider>,
  deps: PluginsControllerDeps,
) {
  const { pluginService, logger } = deps;

  // Plugins
  app.get("/api/plugins", {
    schema: {
      description: "List plugins",
      tags: ["Plugins"],
      querystring: queryParamsSchema,
      response: { 200: z.array(pluginSchema), 500: errorResponseSchema },
    },
    handler: async (req: FastifyRequest<{ Querystring: QueryParams }>, reply) => {
      const result = await pluginService.find(req.query);
      return sendResult(reply, logger, result);
    },
  });

  app.get("/api/plugins/:id", {
    schema: {
      description: "Get plugin by id",
      tags: ["Plugins"],
      params: idParamsSchema,
      response: {
        200: pluginSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Params: IdParams }>, reply) => {
      const result = await pluginService.findById(req.params.id);
      return sendResult(reply, logger, result);
    },
  });

  app.post("/api/plugins", {
    schema: {
      description: "Create plugin",
      tags: ["Plugins"],
      body: createPluginSchema,
      response: {
        201: pluginSchema,
        409: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Body: CreatePlugin }>, reply) => {
      const result = await pluginService.create(req.body);
      return sendResult(reply, logger, result, { okStatus: 201 });
    },
  });

  app.patch("/api/plugins/:id", {
    schema: {
      description: "Update plugin by id",
      tags: ["Plugins"],
      params: idParamsSchema,
      body: updatePluginSchema,
      response: {
        200: pluginSchema,
        404: errorResponseSchema,
        409: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Params: IdParams; Body: UpdatePlugin }>, reply) => {
      const result = await pluginService.updateById(req.params.id, req.body);
      return sendResult(reply, logger, result);
    },
  });

  app.delete("/api/plugins/:id", {
    schema: {
      description: "Delete plugin by id",
      tags: ["Plugins"],
      params: idParamsSchema,
      response: {
        204: z.null(),
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Params: IdParams }>, reply) => {
      const result = await pluginService.deleteById(req.params.id);
      return sendResult(reply, logger, result, { okStatus: 204 });
    },
  });


  app.post("/api/plugins/release", {
    schema: {
      description: "Release a plugin",
      tags: ["Plugins", "Releases"],
      params: z.object({ pluginId: z.uuid() }),
      body: createPluginVersionSchema,
      response: {
        201: pluginSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Body: CreatePluginVersion }>, reply) => {
      const result = await pluginService.release(req.body);
      return sendResult(reply, logger, result);
    },
  });

  app.delete("/api/plugins/release/:id", {
    schema: {
      description: "Delete a plugin release",
      tags: ["Plugins"],
      params: idParamsSchema,
      response: {
        204: z.null(),
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (req: FastifyRequest<{ Params: IdParams }>, reply) => {
      const result = await pluginService.deleteRelease(req.params.id);
      return sendResult(reply, logger, result, { okStatus: 204 });
    },
  });
}

