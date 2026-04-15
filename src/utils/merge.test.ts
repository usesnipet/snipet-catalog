import { describe, expect, it } from "vitest";

import { merge } from "./merge.js";

describe("merge", () => {
  it("returns shallow copy of target when source is empty", () => {
    const target = { a: 1, b: 2 };
    const result = merge(target, {});
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toBe(target);
  });

  it("fills keys from source when target omits them", () => {
    const result = merge({ a: 1 }, { b: 2, c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("keeps target value when both define the same key with primitives", () => {
    const result = merge({ a: 1, flag: true }, { a: 99, flag: false });
    expect(result).toEqual({ a: 1, flag: true });
  });

  it("merges nested plain objects recursively", () => {
    const result = merge(
      { outer: { x: 1, keep: "t" } },
      { outer: { x: 2, add: "s" } }
    );
    expect(result).toEqual({
      outer: { x: 1, keep: "t", add: "s" },
    });
  });

  it("does not merge arrays: target array wins", () => {
    const result = merge({ items: [1, 2] }, { items: [3, 4] });
    expect(result.items).toEqual([1, 2]);
  });

  it("takes source value when target key is undefined", () => {
    const target: { a?: number; b: number } = { b: 2 };
    const result = merge(target, { a: 1 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("preserves keys only present on target", () => {
    const result = merge({ onlyTarget: 1 }, { fromSource: 2 });
    expect(result).toEqual({ onlyTarget: 1, fromSource: 2 });
  });
});
