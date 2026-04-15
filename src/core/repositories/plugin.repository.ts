import type { Prisma, PrismaClient } from "@prisma/client";
import { err, ok, Result } from "neverthrow";
import type { Logger } from "@/logger.js";
import type {
  CreatePlugin,
  UpdatePlugin,
  Plugin,
} from "@/core/schemas/index.js";
import {
  isPrismaRecordNotFound,
  isPrismaUniqueViolation,
  toEntityDbError,
} from "@/core/repositories/utils.js";
import { DbError } from "@/core/repositories/errors/db.errors.js";
import {
  PluginConflictError,
  PluginNotFoundError,
} from "@/core/repositories/errors/plugin.errors.js";
import { prismaForRepository, type RepositoryOpts } from "@/core/repositories/repository-opts.js";

export type PluginRepository = ReturnType<typeof createPluginRepository>;

type PluginRepositoryDeps = {
  prisma: PrismaClient;
  logger: Logger;
};

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Creates the Plugin repository.
 * @param deps - Dependencies containing Prisma client and logger
 */
export function createPluginRepository(deps: PluginRepositoryDeps) {
  const { prisma, logger } = deps;

  return {
    async find(
      params?: {
        skip?: number;
        take?: number;
      },
      opts?: RepositoryOpts,
    ): Promise<Result<Plugin[], DbError>> {
      logger.debug("PluginRepository.find", { params, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const rows = await db.plugin.findMany({
          skip: params?.skip ?? 0,
          take: params?.take ?? 1000,
        });
        return ok(rows);
      } catch (e) {
        return err(toEntityDbError(DbError, e));
      }
    },

    async setLatestPluginVersionById(
      id: string,
      versionId: string,
      opts?: RepositoryOpts,
    ): Promise<Result<Plugin, PluginNotFoundError | PluginConflictError | DbError>> {
      logger.debug("PluginRepository.setLatestPluginVersionById", { id, versionId, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const row = await db.plugin.update({
          where: { id },
          data: { latestPluginVersion: { connect: { id: versionId } } },
        });
        return ok(row);
      } catch (e) {
        return err(toEntityDbError(DbError, e));
      }
    },

    async findById(
      id: string,
      opts?: RepositoryOpts,
    ): Promise<Result<Plugin, PluginNotFoundError | DbError>> {
      logger.debug("PluginRepository.findById", { id, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        const row = await db.plugin.findUnique({ where: { id } });
        if (!row) return err(new PluginNotFoundError("Plugin not found"));
        return ok(row);
      } catch (e) {
        return err(toEntityDbError(DbError, e));
      }
    },

    async create(
      { version, ...data }: CreatePlugin,
      opts?: RepositoryOpts,
    ): Promise<Result<Plugin, PluginConflictError | DbError>> {
      logger.debug("PluginRepository.create", { packageName: data.packageName, hasTx: Boolean(opts?.tx) });
      const run = async (db: Db) => {
        const row = await db.plugin.create({ data });
        const versionRow = await db.pluginVersion.create({
          data: {
            pluginId: row.id,
            version: version.version,
            pluginManifest: version.pluginManifest,
          },
        });
        await db.plugin.update({
          where: { id: row.id },
          data: { latestPluginVersionId: versionRow.id },
        });
        return ok(row);
      };
      try {
        if (opts?.tx) {
          return await run(prismaForRepository(prisma, opts));
        }
        return await prisma.$transaction((tx) => run(tx));
      } catch (e) {
        if (isPrismaUniqueViolation(e)) {
          return err(new PluginConflictError("Plugin with this packageName already exists", e));
        }
        return err(toEntityDbError(DbError, e));
      }
    },

    async updateById(
      id: string,
      { version, ...data }: UpdatePlugin,
      opts?: RepositoryOpts,
    ): Promise<Result<Plugin, PluginNotFoundError | PluginConflictError | DbError>> {
      logger.debug("PluginRepository.updateById", { id, data, hasTx: Boolean(opts?.tx) });
      const run = async (db: Db) => {
        const row = await db.plugin.update({ where: { id }, data });
        if (version) {
          const versionRow = await db.pluginVersion.create({
            data: {
              pluginId: row.id,
              version: version.version,
              pluginManifest: version.pluginManifest,
            },
          });
          if (version.setAsLatest) {
            await db.plugin.update({
              where: { id },
              data: { latestPluginVersion: { connect: { id: versionRow.id } } },
            });
          }
        }
        return ok(row);
      };
      try {
        if (opts?.tx) {
          return await run(prismaForRepository(prisma, opts));
        }
        return await prisma.$transaction((tx) => run(tx));
      } catch (e) {
        if (isPrismaRecordNotFound(e)) {
          return err(new PluginNotFoundError("Plugin not found"));
        }
        if (isPrismaUniqueViolation(e)) {
          return err(new PluginConflictError("Plugin with this packageName already exists", e));
        }
        return err(toEntityDbError(DbError, e));
      }
    },

    async deleteById(
      id: string,
      opts?: RepositoryOpts,
    ): Promise<Result<void, PluginNotFoundError | DbError>> {
      logger.debug("PluginRepository.deleteById", { id, hasTx: Boolean(opts?.tx) });
      try {
        const db = prismaForRepository(prisma, opts);
        await db.plugin.delete({ where: { id } });
        return ok(undefined);
      } catch (e) {
        if (isPrismaRecordNotFound(e)) {
          return err(new PluginNotFoundError("Plugin not found"));
        }
        return err(toEntityDbError(DbError, e));
      }
    },
  };
}
