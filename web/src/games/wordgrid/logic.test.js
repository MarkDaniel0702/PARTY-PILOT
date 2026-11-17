import { describe, it, expect } from "vitest";
import { computeStatuses, pointsForWin, isValidGuess } from "./logic";
import { WORDGRID_CATEGORIES, WORDGRID_CATEGORY_ICONS } from "./data";

describe("computeStatuses", () => {
  it("marks an exact match all correct", () => {
    expect(computeStatuses("TIGER", "TIGER")).toEqual(Array(5).fill("correct"));
  });

  it("marks letters not in the word absent", () => {
    expect(computeStatuses("ZZZZZ", "TIGER")).toEqual(Array(5).fill("absent"));
  });

  it("marks right-letter-wrong-place present", () => {
    expect(computeStatuses("OTTER", "OCEAN").join()).toBe("correct,absent,absent,present,absent");
  });

  it("does not over-count a repeated letter in the guess", () => {
    // Secret has one E; guess has two. Only the first (and here the correct) E counts.
    expect(computeStatuses("GEESE", "ELITE")).toEqual(["absent", "present", "absent", "absent", "correct"]);
  });

  it("gives a green priority over an earlier yellow for the same letter", () => {
    // Secret ABBEY: guess BABES -> B(present) A(present) B(correct) E(correct) S(absent)
    expect(computeStatuses("BABES", "ABBEY")).toEqual(["present", "present", "correct", "correct", "absent"]);
  });
});

describe("pointsForWin", () => {
  it("pays the most for the first guess and never less than 1", () => {
    expect(pointsForWin(6, 1)).toBe(6);
    expect(pointsForWin(6, 6)).toBe(1);
    expect(pointsForWin(6, 9)).toBe(1);
  });
});

describe("isValidGuess", () => {
  it("normalises case/whitespace and enforces length and letters only", () => {
    expect(isValidGuess(" tiger ", 5)).toBe("TIGER");
    expect(isValidGuess("tige", 5)).toBeNull();
    expect(isValidGuess("tig3r", 5)).toBeNull();
    expect(isValidGuess("ti ge", 5)).toBeNull();
    expect(isValidGuess(undefined, 5)).toBeNull();
  });
});

describe("wordgrid data", () => {
  it("every word is letters-only, uppercase, 3-9 long, unique per category", () => {
    for (const [cat, words] of Object.entries(WORDGRID_CATEGORIES)) {
      expect(WORDGRID_CATEGORY_ICONS[cat], cat).toBeTruthy();
      expect(new Set(words).size, cat).toBe(words.length);
      words.forEach((w) => expect(/^[A-Z]{3,9}$/.test(w), `${cat}: ${w}`).toBe(true));
    }
  });
});
