import z from "zod";

const envSchema = z.object({

  /**
   * The port to run the server on.
   * @default 8853
   */
  PORT: z.coerce.number().default(8853),

  /**
   * The node environment.
   * @default "development"
   */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * The database URL.
   * @example "postgresql://user:password@localhost:5432/database"
   */
  DATABASE_URL: z.string(),

  /**
   * The apps to run.
   * @default "server,worker,cron"
   * @example "server,cron"
   */
  APPS: z.string()
    .default("server,worker,cron")
    .transform((s) => s.split(",").map((x) => x.trim().toLowerCase() as "server" | "worker" | "cron")),


  /**
   * The log level.
   * @default "debug" in development, "info" in production
   * @enum "debug", "info", "warn", "error"
   */
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default(process.env.NODE_ENV === "production" ? "info" : "debug"),

  /**
   * The master password for the encryption.
   * @example "my-master-password"
   */
  ENCRYPTION_MASTER_PASSWORD: z.string().min(8).default("password"),

  //#region Plugins
  /**
   * Path to directory containing installed plugins (managed by Snipet).
   * @default "./plugins"
   */
  PLUGINS_PATH: z.string().default("./plugins"),


  /**
   * Enables plugin debug logs persistence and reading via PluginManager.readLogs.
   * @default false
   */
  DEBUG_PLUGINS: z.coerce.boolean().default(false),

  //#region PG-BOSS
  /**
   * The database URL for the pg-boss.
   * @example "postgresql://user:password@localhost:5432/database"
   */
  POSTGRES_PG_BOSS_DATABASE_URL: z.string().optional(),
  /**
   * The database schema for the pg-boss.
   * @example "pg-boss"
   */
  POSTGRES_PG_BOSS_DATABASE_SCHEMA: z.string().default("queue"),
  //#endregion

}).transform((env) => ({
  ...env,
  POSTGRES_PG_BOSS_DATABASE_URL: env.POSTGRES_PG_BOSS_DATABASE_URL ?? env.DATABASE_URL,
}))

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);