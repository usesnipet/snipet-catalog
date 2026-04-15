import { describe, expect, it, vi } from "vitest";
import type { TransactionHandle, TransactionManager } from "@/core/repositories/index.js";
import { createLogger } from "@/logger.js";
import { ok } from "neverthrow";
import { createPluginService } from "./plugin.service.js";

describe("PluginService", () => {
  it("forwards find() to repository", async () => {
    const repo = {
      find: vi.fn().mockResolvedValue(ok([])),
      findById: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      deleteById: vi.fn(),
    };

    const service = createPluginService({
      pluginRepository: repo as any,
      pluginVersionRepository: {} as any,
      transactionManager: {
        transaction: vi.fn(async <T>(fn: (tx: TransactionHandle) => Promise<T>) => {
          const tx: TransactionHandle = { commit: vi.fn(), rollback: vi.fn() };
          return fn(tx);
        }),
      } as TransactionManager,
      logger: createLogger({ context: "test" }),
    });

    const result = await service.find({ skip: 1, take: 2 });
    expect(result.isOk()).toBe(true);
    expect(repo.find).toHaveBeenCalledWith({ skip: 1, take: 2 });
  });
});

