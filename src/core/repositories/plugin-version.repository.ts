import type { PrismaClient } from "@prisma/client";
import { err, ok, Result } from "neverthrow";
import type { Logger } from "@/logger.js";
import type { CreatePluginVersion, PluginVersion } from "@/core/schemas/index.js";
import {
  isPrismaForeignKeyViolation,
  isPrismaRecordNotFound,
  isPrismaUniqueViolation,
  toEntityDbError,
} from "@/core/repositories/utils.js";
import { DbError } from "@/core/repositories/errors/db.errors.js";
import {
  PluginVersionConflictError,
  PluginVersionNotFoundError,
  PluginVersionPluginNotFoundError,
} from "@/core/repositories/errors/plugin-version.errors.js";
import { prismaForRepository, type RepositoryOpts } from "@/core/repositories/repository-opts.js";

export type PluginVersionRepository = ReturnType<typeof createPluginVersionRepository>;

type PluginVersionRepositoryDeps = {
  prisma: PrismaClient;
  logger: Logger;
};

/**
 * Creates the PluginVersion repository.
 * @param deps - Dependencies containing Prisma client and logger
 */
export function createPluginVersionRepository(deps: PluginVersionRepositoryDeps) {
  const { prisma, logger } = deps;

  return {
    async findByPluginId(
      pluginId: string,
      params?: { skip?: number; take?: number },
      opts?: RepositoryOpts,
    ): Promise<Result<PluginVersion[], DbError>> {
      logger.debug("PluginVersionRepository.findByPluginId", { pluginId, params, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const rows = await db.pluginVersion.findMany({
          where: { pluginId },
          skip: params?.skip,
          take: params?.take,
          orderBy: { createdAt: "desc" },
        });
        return ok(rows);
      } catch (e) {
        return err(toEntityDbError(DbError, e));
      }
    },

    async findById(
      id: string,
      opts?: RepositoryOpts,
    ): Promise<Result<PluginVersion, PluginVersionNotFoundError | DbError>> {
      logger.debug("PluginVersionRepository.findById", { id, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const row = await db.pluginVersion.findUnique({ where: { id } });
        if (!row) return err(new PluginVersionNotFoundError("Plugin version not found"));
        return ok(row);
      } catch (e) {
        return err(toEntityDbError(DbError, e));
      }
    },

    async create(
      pluginId: string,
      data: CreatePluginVersion,
      opts?: RepositoryOpts,
    ): Promise<
      Result<
        PluginVersion,
        | PluginVersionPluginNotFoundError
        | PluginVersionConflictError
        | DbError
      >
    > {
      logger.debug("PluginVersionRepository.create", { pluginId, version: data.version, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const row = await db.pluginVersion.create({
          data: {
            pluginId,
            version: data.version,
            pluginManifest: data.pluginManifest,
          },
        });
        return ok(row);
      } catch (e) {
        if (isPrismaForeignKeyViolation(e)) {
          return err(new PluginVersionPluginNotFoundError("Plugin not found", e));
        }
        if (isPrismaUniqueViolation(e)) {
          return err(
            new PluginVersionConflictError("Plugin version already exists for this plugin", e),
          );
        }
        return err(toEntityDbError(DbError, e));
      }
    },

    async deleteById(
      id: string,
      opts?: RepositoryOpts,
    ): Promise<Result<void, PluginVersionNotFoundError | DbError>> {
      logger.debug("PluginVersionRepository.deleteById", { id, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        await db.pluginVersion.delete({ where: { id } });
        return ok(undefined);
      } catch (e) {
        if (isPrismaRecordNotFound(e)) {
          return err(new PluginVersionNotFoundError("Plugin version not found"));
        }
        return err(toEntityDbError(DbError, e));
      }
    },
  };
}
