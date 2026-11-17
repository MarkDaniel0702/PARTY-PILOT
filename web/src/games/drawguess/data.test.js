import { describe, it, expect } from "vitest";
import { DRAWGUESS_CATEGORIES, DRAWGUESS_CATEGORY_ICONS, parseCustomWords, MIN_CUSTOM_WORDS } from "./data";
import { normalise } from "./guessMatch";

describe("drawguess data", () => {
  it("every category has an icon and enough distinct, clean words", () => {
    for (const [cat, words] of Object.entries(DRAWGUESS_CATEGORIES)) {
      expect(DRAWGUESS_CATEGORY_ICONS[cat], cat).toBeTruthy();
      expect(words.length, cat).toBeGreaterThanOrEqual(10);
      const seen = new Set();
      for (const w of words) {
        expect(w, `${cat}: ${w}`).toBe(w.trim());
        expect(normalise(w).length, `${cat}: ${w}`).toBeGreaterThanOrEqual(2);
        expect(seen.has(normalise(w)), `${cat} duplicate ${w}`).toBe(false);
        seen.add(normalise(w));
      }
    }
  });

  it("parses custom words: trims, drops blanks and case-insensitive duplicates", () => {
    expect(parseCustomWords("Cat, dog\n  CAT ,, bird ,x")).toEqual(["Cat", "dog", "bird"]);
    expect(parseCustomWords(null)).toEqual([]);
    expect(MIN_CUSTOM_WORDS).toBeGreaterThan(1);
  });
});
