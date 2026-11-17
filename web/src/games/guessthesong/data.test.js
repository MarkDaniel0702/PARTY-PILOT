import { describe, it, expect } from "vitest";
import { GUESSTHESONG_CATEGORIES, GUESSTHESONG_CATEGORY_ICONS } from "./data";
import { getArtistThemes, MIN_ARTIST_SONGS } from "./artistThemes";

const norm = (s) => ` ${String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
const songs = Object.entries(GUESSTHESONG_CATEGORIES).flatMap(([genre, list]) =>
  list.map((song, i) => ({ where: `${genre} #${i} (${song.answer})`, genre, song }))
);

describe("guessthesong data", () => {
  it("every genre has an icon and at least one song", () => {
    for (const [genre, list] of Object.entries(GUESSTHESONG_CATEGORIES)) {
      expect(GUESSTHESONG_CATEGORY_ICONS[genre], genre).toBeTruthy();
      expect(list.length, genre).toBeGreaterThan(0);
    }
  });

  it("every song has 2+ non-empty clues, an 'Title — Artist' answer and a 100-500 point value", () => {
    for (const { where, song } of songs) {
      expect(Array.isArray(song.clues) && song.clues.length >= 2, `${where} clues`).toBe(true);
      song.clues.forEach((c, i) => expect(typeof c === "string" && c.trim().length > 0, `${where} clue ${i}`).toBe(true));
      expect(song.answer.includes(" — "), `${where} answer format`).toBe(true);
      expect([100, 200, 300, 400, 500], `${where} pointValue`).toContain(song.pointValue);
    }
  });

  it("clip fields are valid when present", () => {
    for (const { where, song } of songs) {
      if (song.youtubeId === undefined) continue;
      expect(/^[\w-]{11}$/.test(song.youtubeId), `${where} youtubeId`).toBe(true);
      if (song.clipStart !== undefined) expect(song.clipStart, `${where} clipStart`).toBeGreaterThanOrEqual(0);
      if (song.clipDuration !== undefined) {
        expect(song.clipDuration, `${where} clipDuration`).toBeGreaterThan(0);
        expect(song.clipDuration, `${where} clipDuration`).toBeLessThanOrEqual(60);
      }
    }
  });

  it("no genre lists the same song twice", () => {
    for (const [genre, list] of Object.entries(GUESSTHESONG_CATEGORIES)) {
      const seen = new Set();
      list.forEach((s) => {
        const k = norm(s.answer);
        expect(seen.has(k), `${genre}: ${s.answer} twice`).toBe(false);
        seen.add(k);
      });
    }
  });

  it("the description clue does not spell out the song title", () => {
    for (const { where, song } of songs) {
      const title = norm(song.answer.split(" — ")[0]);
      if (title.trim().length < 4) continue;
      song.clues.forEach((c, i) => {
        if (i === 0 || /^\s*artists?\s*:/i.test(c)) return;
        expect(norm(c).includes(title), `${where} clue ${i} contains the title`).toBe(false);
      });
    }
  });

  it("artist themes meet the minimum size and drop the redundant artist clue", () => {
    for (const t of getArtistThemes()) {
      expect(t.songs.length).toBeGreaterThanOrEqual(MIN_ARTIST_SONGS);
      t.songs.forEach((s) => expect(s.clues.some((c) => /^\s*artists?\s*:/i.test(c))).toBe(false));
    }
  });
});
