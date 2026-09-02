import { describe, it, expect } from "vitest";
import {
  RESULT,
  normalise,
  editDistance,
  judgeGuess,
  feedEntry,
  maskWord,
  hintCount,
  guessPoints,
  drawerPoints
} from "./guessMatch";

describe("normalise", () => {
  it("ignores case, padding, punctuation and doubled spaces", () => {
    expect(normalise("  St. Bernard!! ")).toBe("st bernard");
    expect(normalise("ICE   CREAM")).toBe("ice cream");
  });

  it("strips accents so 'cafe' matches 'café'", () => {
    expect(normalise("café")).toBe(normalise("cafe"));
    expect(normalise("piñata")).toBe("pinata");
  });

  it("handles null and undefined without throwing", () => {
    expect(normalise(null)).toBe("");
    expect(normalise(undefined)).toBe("");
  });
});

describe("editDistance", () => {
  it("measures small edits", () => {
    expect(editDistance("cat", "cat")).toBe(0);
    expect(editDistance("cactus", "cactas")).toBe(1); // substitution
    expect(editDistance("cactus", "cactu")).toBe(1); // deletion
    expect(editDistance("cactus", "cacttus")).toBe(1); // insertion
  });

  it("bails out early past the cap instead of computing the true distance", () => {
    expect(editDistance("elephant", "xy", 1)).toBeGreaterThan(1);
  });
});

describe("judgeGuess", () => {
  it("accepts an exact match regardless of formatting", () => {
    expect(judgeGuess("  Cactus ", "cactus")).toBe(RESULT.CORRECT);
    expect(judgeGuess("st bernard", "St. Bernard")).toBe(RESULT.CORRECT);
  });

  it("flags a one-letter typo as close", () => {
    expect(judgeGuess("cactas", "cactus")).toBe(RESULT.CLOSE);
  });

  it("does not flag short words as close, where one edit is a different word", () => {
    expect(judgeGuess("car", "cat")).toBe(RESULT.WRONG);
  });

  it("rejects a plain wrong guess", () => {
    expect(judgeGuess("banana", "cactus")).toBe(RESULT.WRONG);
  });

  it("ignores the drawer, so they cannot guess their own word", () => {
    expect(judgeGuess("cactus", "cactus", { isDrawer: true })).toBe(RESULT.IGNORED);
  });

  it("ignores someone who already scored, so they cannot score twice", () => {
    expect(judgeGuess("cactus", "cactus", { alreadyCorrect: true })).toBe(RESULT.IGNORED);
  });

  it("ignores an empty guess", () => {
    expect(judgeGuess("   ", "cactus")).toBe(RESULT.IGNORED);
  });
});

describe("feedEntry — the rule that stops the answer leaking", () => {
  it("never puts the guess text in the feed for a correct answer", () => {
    const entry = feedEntry("Ana", "cactus", RESULT.CORRECT);
    expect(entry.correct).toBe(true);
    expect(entry.text).toBeNull();
    expect(JSON.stringify(entry)).not.toContain("cactus");
  });

  it("reports a near-miss to the room as an ordinary wrong guess", () => {
    // "so close!" goes only to the guesser; broadcasting it would tell
    // everyone they are one letter away.
    const entry = feedEntry("Ana", "cactas", RESULT.CLOSE);
    expect(entry.correct).toBe(false);
    expect(entry).not.toHaveProperty("close");
    expect(JSON.stringify(entry)).not.toContain("close");
  });
});

describe("maskWord", () => {
  it("hides every letter when nothing is revealed", () => {
    expect(maskWord("cactus", 0)).toBe("______");
  });

  it("keeps spaces and punctuation, which give away shape not answer", () => {
    expect(maskWord("st. bernard", 0)).toBe("__. _______");
  });

  it("reveals the requested number of letters", () => {
    const masked = maskWord("cactus", 2);
    expect([...masked].filter((c) => c !== "_")).toHaveLength(2);
    expect(masked).toHaveLength(6);
  });

  it("is stable — the same inputs reveal the same positions", () => {
    expect(maskWord("elephant", 2)).toBe(maskWord("elephant", 2));
  });

  it("never reveals more letters than the word has", () => {
    expect(maskWord("cat", 99)).toBe("cat");
  });
});

describe("hintCount", () => {
  it("reveals nothing before 60% elapsed", () => {
    expect(hintCount("cactus", 0)).toBe(0);
    expect(hintCount("cactus", 0.59)).toBe(0);
  });

  it("steps up at 60% and again at 80%", () => {
    expect(hintCount("cactus", 0.6)).toBe(1);
    expect(hintCount("cactus", 0.85)).toBe(2);
  });

  it("never reveals more than a third of the word", () => {
    expect(hintCount("cat", 1)).toBe(1); // 3 letters -> cap floor(3/3) = 1
    expect(hintCount("ox", 1)).toBe(0); // 2 letters -> cap 0, too short to hint
    expect(hintCount("elephant", 1)).toBe(2); // cap 2 by the 80% step, not by length
  });
});

describe("scoring", () => {
  it("pays a guesser more the earlier they are", () => {
    expect(guessPoints(1)).toBe(100);
    expect(guessPoints(0.5)).toBe(75);
    expect(guessPoints(0)).toBe(50);
  });

  it("clamps a nonsense fraction", () => {
    expect(guessPoints(5)).toBe(100);
    expect(guessPoints(-5)).toBe(50);
  });

  it("pays the drawer per correct guesser, capped", () => {
    expect(drawerPoints(0)).toBe(0);
    expect(drawerPoints(2)).toBe(50);
    expect(drawerPoints(9)).toBe(100);
  });
});
