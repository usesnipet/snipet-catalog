import { mkdir, stat } from "fs/promises";
import path from "path";

/**
 * Checks if a given directory exists.
 * @param path - The path to check for existence.
 * @returns Promise that resolves to true if the directory exists, false otherwise.
 */
export async function existsDir(path: string) {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}
export async function ensureDir(path: string) {
  if (await existsDir(path)) return;
  await mkdir(path, { recursive: true });
}

export function safeJoin(...paths: string[]) {
  const cleanPaths = paths.map(p => p.split(path.sep).filter(p => p !== '.' && p !== '..').join(path.sep));
  return path.resolve(...cleanPaths);
}