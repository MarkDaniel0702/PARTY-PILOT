import { describe, it, expect } from "vitest";
import {
  NORM,
  MIN_STEP,
  clampNorm,
  toNorm,
  fromNorm,
  createStroke,
  shouldAppend,
  appendPoint,
  appendPoints,
  fitBox
} from "./strokes";

describe("clampNorm", () => {
  it("rounds to an integer and clamps to the grid", () => {
    expect(clampNorm(12.4)).toBe(12);
    expect(clampNorm(-50)).toBe(0);
    expect(clampNorm(NORM + 50)).toBe(NORM);
  });
});

describe("coordinate mapping", () => {
  it("maps pixels onto the normalised grid", () => {
    expect(toNorm(0, 0, 400, 300)).toEqual([0, 0]);
    expect(toNorm(400, 300, 400, 300)).toEqual([NORM, NORM]);
    expect(toNorm(200, 150, 400, 300)).toEqual([500, 500]);
  });

  it("round-trips between two differently sized surfaces", () => {
    // A phone pad and a shared screen of different sizes must agree.
    const [nx, ny] = toNorm(120, 90, 400, 300);
    const [bx, by] = fromNorm(nx, ny, 1200, 900);
    expect(Math.round(bx)).toBe(360); // 120/400 of 1200
    expect(Math.round(by)).toBe(270); // 90/300 of 900
  });

  it("survives a zero-sized surface without dividing by zero", () => {
    expect(toNorm(10, 10, 0, 0)).toEqual([0, 0]);
  });
});

describe("point thinning", () => {
  it("always records the first move", () => {
    const s = createStroke("s1", "#000", 4, 10, 10);
    expect(s.pts).toEqual([10, 10]);
  });

  it("drops points closer than the minimum step", () => {
    const s = createStroke("s1", "#000", 4, 100, 100);
    expect(shouldAppend(s, 101, 100)).toBe(false);
    expect(appendPoint(s, 101, 100)).toBe(s); // same reference = no-op
  });

  it("keeps points at or beyond the minimum step", () => {
    const s = createStroke("s1", "#000", 4, 100, 100);
    expect(shouldAppend(s, 100 + MIN_STEP, 100)).toBe(true);
    const next = appendPoint(s, 100 + MIN_STEP, 100);
    expect(next).not.toBe(s);
    expect(next.pts).toEqual([100, 100, 103, 100]);
  });

  it("does not mutate the stroke it was given", () => {
    const s = createStroke("s1", "#000", 4, 0, 0);
    appendPoint(s, 500, 500);
    expect(s.pts).toEqual([0, 0]);
  });

  it("clamps appended batches from the wire", () => {
    const s = createStroke("s1", "#000", 4, 0, 0);
    const next = appendPoints(s, [-20, 40, NORM + 99, 60]);
    expect(next.pts).toEqual([0, 0, 0, 40, NORM, 60]);
  });

  it("treats an empty batch as a no-op", () => {
    const s = createStroke("s1", "#000", 4, 0, 0);
    expect(appendPoints(s, [])).toBe(s);
  });
});

describe("fitBox", () => {
  it("letterboxes a tall container", () => {
    const box = fitBox(400, 600); // 4:3 -> 400x300, centred vertically
    expect(box.width).toBe(400);
    expect(box.height).toBe(300);
    expect(box.y).toBe(150);
    expect(box.x).toBe(0);
  });

  it("pillarboxes a wide container", () => {
    const box = fitBox(1000, 300); // 4:3 -> 400x300, centred horizontally
    expect(box.width).toBe(400);
    expect(box.height).toBe(300);
    expect(box.x).toBe(300);
    expect(box.y).toBe(0);
  });

  it("always keeps the same aspect ratio, so drawings never skew", () => {
    for (const [w, h] of [[320, 568], [430, 932], [667, 375], [1280, 720]]) {
      const box = fitBox(w, h);
      expect(box.width / box.height).toBeCloseTo(4 / 3, 5);
      expect(box.width).toBeLessThanOrEqual(w + 0.001);
      expect(box.height).toBeLessThanOrEqual(h + 0.001);
    }
  });

  it("degrades safely on a zero-sized container", () => {
    expect(fitBox(0, 0)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
