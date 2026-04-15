/**
 * Deep-clones a plain config object (no special types). Safe for JSON-like config.
 */
export function clone(data: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}
