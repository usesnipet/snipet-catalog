import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  createTransactionManager,
  isTransactionRollback,
  prismaClientForTransaction,
  TransactionRollback,
} from "./transaction-manager.js";

describe("createTransactionManager", () => {
  it("returns the callback result and resolves commit()", async () => {
    const prismaTx = { tag: "tx" };
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: typeof prismaTx) => Promise<number>) => fn(prismaTx)),
    } as unknown as PrismaClient;

    const tm = createTransactionManager({ prisma });
    const out = await tm.transaction(async (tx) => {
      await tx.commit();
      return 7;
    });

    expect(out).toBe(7);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects with TransactionRollback when rollback() is used", async () => {
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<string>) => {
        return fn({});
      }),
    } as unknown as PrismaClient;

    const tm = createTransactionManager({ prisma });

    await expect(
      tm.transaction(async (tx) => {
        await tx.rollback();
        return "never";
      }),
    ).rejects.toThrow(TransactionRollback);

    await expect(
      tm.transaction(async (tx) => {
        await tx.rollback();
        return "never";
      }),
    ).rejects.toSatisfy((e: unknown) => isTransactionRollback(e));
  });

  it("exposes the Prisma transaction client via prismaClientForTransaction during the callback", async () => {
    const prismaTx = { plugin: { findMany: vi.fn() } };
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: typeof prismaTx) => Promise<void>) => {
        await fn(prismaTx);
      }),
    } as unknown as PrismaClient;

    const tm = createTransactionManager({ prisma });

    await tm.transaction(async (tx) => {
      expect(prismaClientForTransaction(tx)).toBe(prismaTx);
    });
  });

  it("throws when prismaClientForTransaction is used after the transaction ends", async () => {
    const prismaTx = {};
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: typeof prismaTx) => Promise<unknown>) => fn(prismaTx)),
    } as unknown as PrismaClient;

    const tm = createTransactionManager({ prisma });
    let captured: Parameters<Parameters<typeof tm.transaction>[0]>[0];

    await tm.transaction(async (tx) => {
      captured = tx;
      return null;
    });

    expect(() => prismaClientForTransaction(captured!)).toThrow(/Invalid or expired transaction handle/);
  });
});
