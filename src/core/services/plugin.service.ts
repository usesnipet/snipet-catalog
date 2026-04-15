import type { Logger } from "@/logger.js";
import type {
  PluginRepository,
  PluginVersionRepository,
  TransactionManager,
} from "@/core/repositories/index.js";
import { err, type Result } from "neverthrow";
import type {
  CreatePlugin,
  CreatePluginVersion,
  UpdatePlugin,
  Plugin,
} from "@/core/schemas/index.js";
import type { DbError } from "@/core/repositories/errors/db.errors.js";
import {
  PluginConflictError,
  PluginNotFoundError,
} from "@/core/repositories/errors/plugin.errors.js";
import {
  PluginVersionConflictError,
  PluginVersionPluginNotFoundError,
} from "../repositories/errors/plugin-version.errors.js";

export type PluginService = ReturnType<typeof createPluginService>;

type PluginServiceDeps = {
  pluginRepository: PluginRepository;
  pluginVersionRepository: PluginVersionRepository;
  transactionManager: TransactionManager;
  logger: Logger;
};

/**
 * Creates the Plugin service.
 * @param deps - Dependencies containing repository and logger
 */
export function createPluginService(deps: PluginServiceDeps) {
  const { pluginRepository, logger, pluginVersionRepository, transactionManager } = deps;

  return {
    async find(params?: {
      skip?: number;
      take?: number;
    }): Promise<Result<Plugin[], DbError>> {
      logger.debug("PluginService.find", { params });
      return pluginRepository.find(params);
    },

    async findById(id: string): Promise<Result<Plugin, PluginNotFoundError | DbError>> {
      logger.debug("PluginService.findById", { id });
      return pluginRepository.findById(id);
    },

    async create(
      body: CreatePlugin,
    ): Promise<Result<Plugin, PluginConflictError | DbError>> {
      logger.debug("PluginService.create", { packageName: body.packageName });
      return pluginRepository.create(body);
    },

    async release(release: CreatePluginVersion): Promise<
      Result<
        Plugin,
        | PluginNotFoundError
        | PluginVersionPluginNotFoundError
        | PluginVersionConflictError
        | PluginConflictError
        | DbError
      >
    > {
      return transactionManager.transaction(async (tx) => {
        const opts = { tx };
        const plugin = await pluginRepository.findById(release.pluginId, opts);
        if (plugin.isErr()) return plugin;
        const pluginVersion = await pluginVersionRepository.create(release.pluginId, release, opts);
        if (pluginVersion.isErr()) return err(pluginVersion.error);
        return pluginRepository.setLatestPluginVersionById(release.pluginId, pluginVersion.value.id, opts);
      });
    },

    async updateById(
      id: string,
      body: UpdatePlugin,
    ): Promise<Result<Plugin, PluginNotFoundError | PluginConflictError | DbError>> {
      logger.debug("PluginService.updateById", { id });
      return pluginRepository.updateById(id, body);
    },

    async deleteById(id: string): Promise<Result<void, PluginNotFoundError | DbError>> {
      logger.debug("PluginService.deleteById", { id });
      return pluginRepository.deleteById(id);
    },

    async deleteRelease(id: string): Promise<Result<void, PluginNotFoundError | DbError>> {
      logger.debug("PluginService.deleteRelease", { id });
      return pluginVersionRepository.deleteById(id);
    },
  };
}

