// Artist-specific Guess the Song themes — derived, not hand-authored.
//
// This module scans the whole song library in data.js at load time and,
// for every artist that has at least MIN_ARTIST_SONGS distinct songs,
// produces an optional "Guess the Song: <Artist>" theme whose pool is only
// that artist's songs. Because it's computed from the data every time, an
// artist automatically gains (or loses) a theme the moment data.js changes
// — no list to maintain here.

import { GUESSTHESONG_CATEGORIES } from "./data.js";

// An artist needs this many distinct songs before they get their own theme.
export const MIN_ARTIST_SONGS = 10;

export const ARTIST_THEME_PREFIX = "Guess the Song: ";

const ARTIST_CLUE = /^\s*artists?\s*:/i;
const ARTIST_CLUE_LABEL = /^\s*artists?\s*:\s*/i;
// Only split on an explicit "featuring" credit — never on "&", "with", or a
// comma, which are common inside real band names ("Sleeping with Sirens",
// "Earth, Wind & Fire").
const FEATURE_SPLIT = /\s+(?:ft\.?|feat\.?|featuring)\s+/i;

// Best-effort "who is this song by", used only for grouping. Prefers the
// explicit "Artist:" clue line; falls back to the text after the em-dash in
// `answer`. A trailing "(year)" / "(group)" note and a trailing "ft. X"
// credit are stripped, so "Maroon 5 ft. Cardi B" and "Maroon 5 (2015)" both
// group under "Maroon 5".
export function songArtist(song) {
  const clue = (song.clues || []).find((c) => ARTIST_CLUE.test(c));
  let raw = clue
    ? clue.replace(ARTIST_CLUE_LABEL, "")
    : (song.answer || "").split(" — ")[1] || "";
  raw = raw.trim().replace(/\s*\([^)]*\)\s*$/, "").trim();
  raw = raw.split(FEATURE_SPLIT)[0].trim();
  return raw;
}

// Stable identity for a song so the same track credited in two genres (e.g.
// a Queen hit listed in both Rock and Karaoke) is only counted once.
function songKey(song) {
  return song.youtubeId
    ? `yt:${song.youtubeId}`
    : `ans:${(song.answer || "").toLowerCase().replace(/\s+/g, " ").trim()}`;
}

// The artist is already named by the theme, so drop the redundant
// "Artist: …" clue from that song for artist-theme play — it keeps the
// title and (implicitly) the artist hidden until the reveal. Everything
// downstream reads `song.clues.length`, so a 3-clue song simply becomes a
// 2-clue one.
function stripArtistClue(song) {
  const clues = (song.clues || []).filter((c) => !ARTIST_CLUE.test(c));
  return clues.length && clues.length !== song.clues.length ? { ...song, clues } : song;
}

// Group every distinct song by its artist. Exported for reuse/testing.
export function songsByArtist(categories = GUESSTHESONG_CATEGORIES) {
  const groups = new Map();
  const seen = new Set();
  for (const songs of Object.values(categories)) {
    for (const song of songs) {
      const key = songKey(song);
      if (seen.has(key)) continue;
      seen.add(key);
      const artist = songArtist(song);
      if (!artist) continue;
      if (!groups.has(artist)) groups.set(artist, []);
      groups.get(artist).push(song);
    }
  }
  return groups;
}

// One entry per artist that currently qualifies:
//   { artist, name, count, songs }
// `name` is the theme's display name ("Guess the Song: Paramore").
// Sorted alphabetically by artist. Artists below the threshold are omitted
// entirely, so ineligible artists never appear anywhere in the UI.
export function getArtistThemes(categories = GUESSTHESONG_CATEGORIES) {
  const groups = songsByArtist(categories);
  return [...groups.entries()]
    .filter(([, list]) => list.length >= MIN_ARTIST_SONGS)
    .map(([artist, list]) => ({
      artist,
      name: ARTIST_THEME_PREFIX + artist,
      count: list.length,
      songs: list.map(stripArtistClue),
    }))
    .sort((a, b) => a.artist.localeCompare(b.artist));
}
