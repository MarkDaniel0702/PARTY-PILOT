import { describe, expect, it } from "vitest";
import { TTL_PROMPT_SETS } from "./data";
import { shufflePromptSet } from "./prompts";

describe("shufflePromptSet", () => {
  it("keeps the lie pointing at the same statement after shuffling", () => {
    for (const set of TTL_PROMPT_SETS) {
      const lie = set.statements[set.lieIndex];
      for (let n = 0; n < 20; n++) {
        const out = shufflePromptSet(set);
        expect(out.statements).toHaveLength(3);
        expect([...out.statements].sort()).toEqual([...set.statements].sort());
        expect(out.statements[out.lieIndex]).toBe(lie);
      }
    }
  });

  it("does not mutate the source set", () => {
    const set = TTL_PROMPT_SETS[0];
    const before = JSON.stringify(set);
    shufflePromptSet(set);
    expect(JSON.stringify(set)).toBe(before);
  });
});

describe("TTL_PROMPT_SETS data", () => {
  it("is well-formed", () => {
    const seen = new Set();
    for (const set of TTL_PROMPT_SETS) {
      expect(set.statements).toHaveLength(3);
      expect(set.lieIndex).toBeGreaterThanOrEqual(0);
      expect(set.lieIndex).toBeLessThan(3);
      for (const s of set.statements) {
        expect(s.trim().length).toBeGreaterThan(0);
        expect(seen.has(s)).toBe(false);
        seen.add(s);
      }
    }
  });
});
