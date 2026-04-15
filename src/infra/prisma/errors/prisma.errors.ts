/**
 * Prisma client lifecycle errors (infra layer).
 */
export class PrismaConnectError extends Error {
  code = "PRISMA_CONNECT_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PrismaConnectError";
  }
}

export class PrismaDisconnectError extends Error {
  code = "PRISMA_DISCONNECT_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "PrismaDisconnectError";
  }
}
