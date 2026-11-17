// Pure Word Grid rules, kept out of App.jsx so they can be unit-tested.

// Wordle-style tile statuses. Greens are claimed first so a repeated letter in
// the guess can't also take a "present" for a letter that is already placed.
export function computeStatuses(guess, secret) {
  const secretLetters = secret.split("");
  const guessLetters = guess.split("");
  const statuses = Array(secret.length).fill(null);

  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === secretLetters[i]) {
      statuses[i] = "correct";
      secretLetters[i] = null;
    }
  }
  for (let i = 0; i < guessLetters.length; i++) {
    if (statuses[i]) continue;
    const idx = secretLetters.indexOf(guessLetters[i]);
    if (idx !== -1) {
      statuses[i] = "present";
      secretLetters[idx] = null;
    } else {
      statuses[i] = "absent";
    }
  }
  return statuses;
}

// Guessing on the first try is worth maxGuesses points, the last try 1.
export function pointsForWin(maxGuesses, guessesUsed) {
  return Math.max(maxGuesses - guessesUsed + 1, 1);
}

// A guess is playable when it is exactly the word's length and letters only.
export function isValidGuess(raw, wordLength) {
  const g = String(raw ?? "").trim().toUpperCase();
  return g.length === wordLength && /^[A-Z]+$/.test(g) ? g : null;
}
