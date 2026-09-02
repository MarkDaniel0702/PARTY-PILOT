// Pure guess matching. No React, no network — so the rules that actually
// decide scoring (and the rule that stops the answer leaking) are unit-tested
// rather than clicked through. See guessMatch.test.js.

// Lowercase, strip accents, drop anything that isn't a letter or digit, and
// collapse the rest. "St. Bernard!" and "st bernard" must match.
export function normalise(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    // Combining diacritics, written as escapes so the source stays ASCII.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Levenshtein distance, bailing out as soon as it exceeds `max` — we only
// ever care about "is this within 1 edit", never the true distance.
export function editDistance(a, b, max = Infinity) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

export const RESULT = {
  CORRECT: "correct",
  CLOSE: "close",
  WRONG: "wrong",
  IGNORED: "ignored"
};

// Near-misses only apply from this length up: on very short words a single
// edit is usually a different valid word ("cat" vs "car"), not a typo.
const MIN_CLOSE_LENGTH = 4;

/**
 * Judge one guess.
 *
 * `alreadyCorrect` and `isDrawer` produce IGNORED rather than WRONG so the
 * caller can silently drop them instead of showing misleading feedback.
 */
export function judgeGuess(guess, word, { isDrawer = false, alreadyCorrect = false } = {}) {
  const g = normalise(guess);
  const w = normalise(word);
  if (!g) return RESULT.IGNORED;
  if (isDrawer || alreadyCorrect) return RESULT.IGNORED;
  if (g === w) return RESULT.CORRECT;
  if (w.length >= MIN_CLOSE_LENGTH && editDistance(g, w, 1) === 1) return RESULT.CLOSE;
  return RESULT.WRONG;
}

/**
 * What everyone is allowed to see in the shared guess feed.
 *
 * A CLOSE result is deliberately reported as a plain wrong guess here — the
 * "so close!" hint goes only to the guesser who typed it. Broadcasting it
 * would tell the whole room they are one letter away, which leaks the answer.
 */
export function feedEntry(playerName, guess, result) {
  if (result === RESULT.CORRECT) return { name: playerName, text: null, correct: true };
  return { name: playerName, text: guess, correct: false };
}

// Blanks for the shared screen, revealing `revealCount` letters. Spaces and
// punctuation are always shown — they give away shape, not the answer.
export function maskWord(word, revealCount = 0) {
  const chars = [...String(word ?? "")];
  const letterIdx = [];
  chars.forEach((c, i) => {
    if (/[a-z0-9]/i.test(c)) letterIdx.push(i);
  });

  // Deterministic spread rather than random, so the reveal doesn't jump
  // around as the timer ticks: take evenly spaced positions.
  const reveal = new Set();
  const n = Math.max(0, Math.min(revealCount, letterIdx.length));
  for (let k = 0; k < n; k++) {
    reveal.add(letterIdx[Math.floor((k * letterIdx.length) / Math.max(1, n))]);
  }

  return chars
    .map((c, i) => {
      if (!/[a-z0-9]/i.test(c)) return c;
      return reveal.has(i) ? c : "_";
    })
    .join("");
}

// How many letters to reveal at a given point in the round. Nothing before
// 60% elapsed, then a step at 60% and another at 80%, capped at a third of
// the word so it is never nearly given away.
export function hintCount(word, elapsedFraction) {
  const letters = normalise(word).replace(/ /g, "").length;
  const cap = Math.floor(letters / 3);
  if (cap <= 0) return 0;
  if (elapsedFraction >= 0.8) return Math.min(cap, 2);
  if (elapsedFraction >= 0.6) return Math.min(cap, 1);
  return 0;
}

// Guesser: 50 base plus up to 50 for speed. Drawer: 25 per correct guesser,
// capped at 100, so a readable drawing pays without runaway scores.
export function guessPoints(remainingFraction) {
  const f = Math.max(0, Math.min(1, remainingFraction));
  return 50 + Math.round(50 * f);
}

export function drawerPoints(correctCount) {
  return Math.min(100, 25 * Math.max(0, correctCount));
}
