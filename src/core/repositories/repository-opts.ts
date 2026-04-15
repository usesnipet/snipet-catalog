import type { Prisma, PrismaClient } from "@prisma/client";
import { prismaClientForTransaction, type TransactionHandle } from "./transaction-manager.js";

/**
 * Optional last argument for repository methods: join an existing interactive transaction.
 */
export type RepositoryOpts = {
  tx?: TransactionHandle;
};

/**
 * Returns the Prisma root client or the interactive client bound to `opts.tx`.
 */
export function prismaForRepository(
  prisma: PrismaClient,
  opts?: RepositoryOpts,
): PrismaClient | Prisma.TransactionClient {
  return opts?.tx ? prismaClientForTransaction(opts.tx) : prisma;
}
