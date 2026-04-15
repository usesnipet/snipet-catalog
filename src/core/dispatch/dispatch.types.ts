import { Result } from "neverthrow";
import type { DispatchError } from "./errors/index.js";

/**
 * Options when subscribing a worker to a queue. Same shape as pg-boss `work()` options (`WorkOptions`):
 * concurrency, batching, polling. Retries / TTL are configured on the queue or on `send`, not here.
 */
export type JobConsumerRegisterOptions = {
  /** Workers per Node process for this queue (pg-boss: `localConcurrency`). */
  localConcurrency?: number;
  /** Jobs fetched per poll cycle. @default 1 */
  batchSize?: number;
  /** Poll interval in seconds. @default 2 */
  pollingIntervalSeconds?: number;
  /** Prefer higher-priority jobs first. @default true */
  priority?: boolean;
  /** Order by creation time. @default true */
  orderByCreatedOn?: boolean;
  /** Heartbeat refresh when `heartbeatSeconds` is set on the queue/job. */
  heartbeatRefreshSeconds?: number;
};

/**
 * Information about a job that was published or consumed.
 */
export type JobInfo = {
  id: string;
  data: unknown;
  status: "pending" | "completed" | "failed";
}

/**
 * Handler invoked for each dequeued job (transport-agnostic).
 * @typeParam T - Job payload shape after JSON parse
 */
export type JobHandler<T = unknown> = (job: {
  id: string;
  data: T;
}) => Promise<Result<unknown, DispatchError>>;

/**
 * Publishes a job to a named queue. Implementations use pg-boss, SQS, etc.
 */
export type JobPublisher = {
  /**
   * Sends a payload to the given queue.
   * @param queueName - Logical queue name (must match consumer registration)
   * @param data - JSON-serializable payload
   * @returns Job id from the broker, or null if deduplicated/suppressed
   */
  run(queueName: string, data: unknown): Promise<Result<JobInfo, DispatchError>>;
};

/**
 * Registers job handlers and controls the consumer lifecycle.
 */
export type JobConsumer = {
  /**
   * Subscribes a handler to a queue. Typically called before {@link start}.
   * @param queueName - Logical queue name
   * @param handler - Async processor for each job
   */
  register<T = unknown>(
    queueName: string,
    handler: JobHandler<T>,
    options?: JobConsumerRegisterOptions,
  ): Promise<void>;

  /**
   * Starts receiving jobs (e.g. pg-boss start + polling).
   */
  start(): Promise<void>;

  /**
   * Stops the consumer gracefully.
   */
  stop(): Promise<void>;
};
