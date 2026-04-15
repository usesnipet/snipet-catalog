import type { Logger } from "@/logger.js";
import { SystemVersionReadError } from "@/core/services/errors/system.errors.js";
import { rootdir } from "@/rootdir.js";
import { readFile } from "fs/promises";
import { Result, err, ok } from "neverthrow";
import { join } from "path";

export type SystemService = ReturnType<typeof createSystemService>;

/**
 * Creates the Security service with injected logger.
 * @param deps - Dependencies containing logger
 * @returns Service object with encryption and hashing methods
 */
export function createSystemService(deps: { logger: Logger }) {
  const { logger } = deps;
  let versionCache: string | undefined;

  return {
    async getVersion(): Promise<Result<string, SystemVersionReadError>> {
      logger.debug("Getting version");
      if (versionCache) return ok(versionCache);
      try {
        const result = await readFile(join(rootdir, "..", "package.json"), { encoding: "utf8" });
        let packageJson: { version?: string };
        try {
          packageJson = JSON.parse(result) as { version?: string };
        } catch (parseError) {
          return err(
            new SystemVersionReadError("Invalid package.json JSON", parseError),
          );
        }

        if (typeof packageJson.version !== "string") {
          return err(new SystemVersionReadError("Missing version in package.json"));
        }

        versionCache = packageJson.version;
        return ok(versionCache);
      } catch (error) {
        return err(
          new SystemVersionReadError(
            error instanceof Error ? error.message : "Failed to read package.json",
            error,
          ),
        );
      }
    }
  };
}
