import { describe, it, expect } from "vitest";
import { QUIZ_THEMES, QUIZ_THEME_GROUPS, QUIZ_BONUS_EVENTS } from "./data";

const POINTS = ["100", "200", "300", "400", "500"];
const norm = (s) => ` ${String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

const cells = [];
for (const [theme, t] of Object.entries(QUIZ_THEMES)) {
  t.categories.forEach((cat) => {
    for (const p of Object.keys(cat.questions)) {
      cat.questions[p].forEach((q, i) => cells.push({ where: `${theme} / ${cat.name} / ${p} #${i}`, theme, cat, p, q }));
    }
  });
}

describe("quiz data", () => {
  it("every theme has an icon and categories with exactly the 5 point rows, each non-empty", () => {
    for (const [theme, t] of Object.entries(QUIZ_THEMES)) {
      expect(t.icon, theme).toBeTruthy();
      expect(t.categories.length, theme).toBeGreaterThan(0);
      const names = t.categories.map((c) => c.name);
      expect(new Set(names).size, `${theme} duplicate category`).toBe(names.length);
      t.categories.forEach((c) => {
        expect(Object.keys(c.questions).sort(), `${theme}/${c.name}`).toEqual(POINTS);
        POINTS.forEach((p) => expect(c.questions[p].length, `${theme}/${c.name}/${p}`).toBeGreaterThan(0));
      });
    }
  });

  it("every question and answer is a clean non-empty string", () => {
    for (const { where, q } of cells) {
      expect(Object.keys(q).sort(), where).toEqual(["a", "q"]);
      expect(typeof q.q === "string" && q.q.trim().length >= 10, `${where} question`).toBe(true);
      expect(typeof q.a === "string" && q.a.trim().length > 0, `${where} answer`).toBe(true);
      expect(q.q, `${where} whitespace`).toBe(q.q.trim());
      expect(q.a, `${where} whitespace`).toBe(q.a.trim());
    }
  });

  it("no question appears twice within a theme", () => {
    for (const [theme, t] of Object.entries(QUIZ_THEMES)) {
      const seen = new Set();
      cells.filter((c) => c.theme === theme).forEach(({ where, q }) => {
        const k = norm(q.q);
        expect(seen.has(k), `${where} duplicate question`).toBe(false);
        seen.add(k);
      });
    }
  });

  it("the question text does not contain its own answer", () => {
    for (const { where, q } of cells) {
      const a = norm(q.a);
      if (a.trim().length < 4) continue;
      expect(norm(q.q).includes(a), `${where} leaks "${q.a}"`).toBe(false);
    }
  });

  it("theme groups only reference real themes, each at most once", () => {
    const listed = Object.values(QUIZ_THEME_GROUPS).flat();
    listed.forEach((n) => expect(QUIZ_THEMES[n], `group references missing theme ${n}`).toBeTruthy());
    expect(new Set(listed).size).toBe(listed.length);
  });

  it("bonus events are well-formed", () => {
    QUIZ_BONUS_EVENTS.forEach((e) => {
      expect(e.type && e.name && e.desc).toBeTruthy();
    });
    expect(QUIZ_BONUS_EVENTS.some((e) => !e.requiresOpponent)).toBe(true);
  });
});
