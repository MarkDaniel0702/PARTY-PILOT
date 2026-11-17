import { describe, it, expect } from "vitest";
import { CATEGORIES_LIST } from "./data";

describe("categories data", () => {
  it("has enough distinct, trimmed, non-empty categories", () => {
    expect(CATEGORIES_LIST.length).toBeGreaterThanOrEqual(10);
    expect(new Set(CATEGORIES_LIST.map((c) => c.toLowerCase())).size).toBe(CATEGORIES_LIST.length);
    CATEGORIES_LIST.forEach((c) => expect(c && c === c.trim()).toBeTruthy());
  });
});
