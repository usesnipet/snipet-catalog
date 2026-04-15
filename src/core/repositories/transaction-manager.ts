import type { Prisma, PrismaClient } from "@prisma/client";

/** Module-private key: binds a Prisma interactive client to a transaction handle. */
const transactionClient = Symbol("snipet.transactionClient");

/**
 * Thrown when {@link TransactionHandle.rollback} is invoked. The enclosing
 * `transaction()` promise rejects with this error and Prisma rolls back.
 */
export class TransactionRollback extends Error {
  readonly code = "TRANSACTION_ROLLBACK";

  constructor(message = "Transaction rolled back") {
    super(message);
    this.name = "TransactionRollback";
  }
}

/**
 * @param error - Value to inspect
 * @returns Whether `error` is a {@link TransactionRollback} instance
 */
export function isTransactionRollback(error: unknown): error is TransactionRollback {
  return error instanceof TransactionRollback;
}

/**
 * Public surface for an interactive transaction: only lifecycle controls.
 * Use this as the parameter type of callbacks passed to {@link createTransactionManager}().`transaction()`.
 */
export type TransactionHandle = {
  /**
   * No-op for API symmetry. Prisma commits when the `transaction` callback returns successfully.
   */
  commit: () => Promise<void>;
  /**
   * Aborts the transaction; the `transaction()` promise rejects with {@link TransactionRollback}.
   */
  rollback: () => Promise<void>;
};

/**
 * Handle bound to an underlying client type `TClient` (default: Prisma interactive client).
 * The client is stored on the object via a private symbol — no WeakMap.
 * Callers of `transaction()` typically only see {@link TransactionHandle}; they do not need to specify `TClient`.
 */
export type Transaction<TClient extends Prisma.TransactionClient = Prisma.TransactionClient> =
  TransactionHandle & {
    readonly [transactionClient]: TClient;
  };

/**
 * Returns the Prisma interactive client for this transaction handle.
 * For repository implementations only — services should depend on {@link TransactionHandle}.
 * @param tx - Handle received in the `transaction` callback
 * @throws If `tx` is not a live handle (e.g. after the transaction callback finished)
 */
export function prismaClientForTransaction(tx: TransactionHandle): Prisma.TransactionClient {
  const client = (tx as Transaction<Prisma.TransactionClient>)[transactionClient];
  if (client === undefined) {
    throw new Error("Invalid or expired transaction handle");
  }
  return client;
}

export type TransactionManager = ReturnType<typeof createTransactionManager>;

type TransactionManagerDeps = {
  prisma: PrismaClient;
};

/**
 * Creates a transaction manager backed by Prisma interactive transactions.
 * The returned API does not expose `PrismaClient` on {@link TransactionHandle}; use {@link prismaClientForTransaction} inside repositories when needed.
 */
export function createTransactionManager(deps: TransactionManagerDeps) {
  const { prisma } = deps;

  return {
    /**
     * Runs `fn` inside a database transaction.
     * @typeParam T - Return type of `fn`
     * @param fn - Receives a {@link TransactionHandle} (`commit` / `rollback` only in the public type)
     * @returns The value returned by `fn`
     */
    async transaction<T>(fn: (tx: TransactionHandle) => Promise<T>): Promise<T> {
      return prisma.$transaction(async (prismaTx) => {
        const tx: Transaction<typeof prismaTx> = {
          [transactionClient]: prismaTx,
          async commit() {
            // Prisma commits when this `$transaction` callback fulfills successfully.
          },
          async rollback() {
            throw new TransactionRollback();
          },
        };

        try {
          return await fn(tx);
        } finally {
          Reflect.deleteProperty(tx as object, transactionClient);
        }
      });
    },
  };
}
