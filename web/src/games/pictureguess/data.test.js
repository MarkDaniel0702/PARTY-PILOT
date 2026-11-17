import { describe, it, expect } from "vitest";
import { PICTUREGUESS_CATEGORIES, PICTUREGUESS_CATEGORY_ICONS } from "./data";

describe("pictureguess data", () => {
  it("every category has an icon and entries with answer, emoji and a wikiTitle", () => {
    for (const [cat, list] of Object.entries(PICTUREGUESS_CATEGORIES)) {
      expect(PICTUREGUESS_CATEGORY_ICONS[cat], cat).toBeTruthy();
      expect(list.length, cat).toBeGreaterThan(0);
      for (const s of list) {
        expect(s.answer && s.emoji && s.wikiTitle, `${cat}: ${JSON.stringify(s)}`).toBeTruthy();
        expect(s.answer, `${cat}: ${s.answer}`).toBe(s.answer.trim());
        expect(s.wikiTitle, `${cat}: ${s.wikiTitle}`).toBe(s.wikiTitle.trim());
        // The REST summary endpoint takes spaces, not underscores, in this data's convention.
        expect(s.wikiTitle.includes("_"), `${cat}: ${s.wikiTitle}`).toBe(false);
      }
    }
  });

  it("no picture is repeated within a category", () => {
    for (const [cat, list] of Object.entries(PICTUREGUESS_CATEGORIES)) {
      const titles = list.map((s) => s.wikiTitle.toLowerCase());
      const answers = list.map((s) => s.answer.toLowerCase());
      expect(new Set(titles).size, `${cat} wikiTitle`).toBe(titles.length);
      expect(new Set(answers).size, `${cat} answer`).toBe(answers.length);
    }
  });
});
