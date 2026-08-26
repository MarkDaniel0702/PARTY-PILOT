import { useRef, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Roster } from "../../shared/components/Roster";
import { Stepper } from "../../shared/components/Stepper";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { PassCard } from "../../shared/components/PassCard";
import { TurnBanner } from "../../shared/components/RevealCard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import layoutStyles from "../../shared/components/layout.module.css";
import { WORDGRID_CATEGORIES, WORDGRID_CATEGORY_ICONS } from "./data";
import styles from "./wordgrid.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MIN_GUESSES = 4;
const MAX_GUESSES = 8;

const CATEGORY_ITEMS = Object.keys(WORDGRID_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: WORDGRID_CATEGORY_ICONS[name] || "🟩"
}));

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

function computeStatuses(guess, secret) {
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

function createEmptyBoard(rows, wordLength) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: wordLength }, () => ({ letter: "", status: null, flipped: false }))
  );
}

function WordBoard({ board }) {
  return (
    <div className={styles.board}>
      {board.map((row, r) => (
        <div className={styles.row} key={r}>
          {row.map((tile, c) => (
            <div
              key={c}
              className={`${styles.tile} ${tile.flipped ? styles.flip : ""} ${tile.status ? styles[tile.status] : ""}`.trim()}
            >
              {tile.letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);
  const [maxGuessesSetting, setMaxGuessesSetting] = useState(6);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 45, defaultEnabled: true });
  const usedIndices = useUsedIndices();
  const guessInputRef = useRef(null);
  // Authoritative guess count used for synchronous bookkeeping (which board
  // row to animate into, etc). `guessesUsed` state is what the "Guess X of
  // Y" banner reads — like the original, it's only updated once a row's
  // flip animation finishes, not the instant a guess is submitted, so the
  // banner doesn't jump ahead of what's still animating on screen.
  const guessesUsedRef = useRef(0);

  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [lastResult, setLastResult] = useState("");

  const [currentWord, setCurrentWord] = useState("");
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [board, setBoard] = useState([]);
  const [guessInput, setGuessInput] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  const gameTimer = useGameTimer({ onExpire: () => handleTimerExpire() });

  function handleStart() {
    usedIndices.reset();
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    setScores(resolvedNames.map(() => 0));
    setTurnIndex(0);
    setMaxGuesses(maxGuessesSetting);
    setLastResult("");
    setPhase("pass");
  }

  function startGuessTimer() {
    gameTimer.stop();
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function handleReveal() {
    const { item } = usedIndices.pickUnused(WORDGRID_CATEGORIES[category]);
    setCurrentWord(item);
    guessesUsedRef.current = 0;
    setGuessesUsed(0);
    setBoard(createEmptyBoard(maxGuesses, item.length));
    setMessage("");
    setGuessInput("");
    setBusy(false);
    setPhase("guess");
    startGuessTimer();
    requestAnimationFrame(() => guessInputRef.current?.focus());
  }

  function animateRow(rowIndex, letters, statuses, done) {
    const len = letters.length;
    for (let i = 0; i < len; i++) {
      setTimeout(() => {
        setBoard((prev) => {
          const next = prev.map((row) => row.slice());
          next[rowIndex][i] = { ...next[rowIndex][i], flipped: true };
          return next;
        });
        setTimeout(() => {
          setBoard((prev) => {
            const next = prev.map((row) => row.slice());
            next[rowIndex][i] = { ...next[rowIndex][i], letter: letters[i], status: statuses[i] };
            return next;
          });
          if (i === len - 1 && done) done();
        }, 280);
      }, i * 300);
    }
  }

  function submitGuess(guess) {
    setBusy(true);
    gameTimer.stop();
    const nextGuessesUsed = guessesUsedRef.current + 1;
    guessesUsedRef.current = nextGuessesUsed;
    const rowIndex = nextGuessesUsed - 1;
    const statuses = computeStatuses(guess, currentWord);
    animateRow(rowIndex, guess.split(""), statuses, () => {
      setGuessInput("");
      if (guess === currentWord) {
        handleWin(nextGuessesUsed);
      } else if (nextGuessesUsed >= maxGuesses) {
        handleLoss();
      } else {
        setGuessesUsed(nextGuessesUsed);
        setBusy(false);
        startGuessTimer();
        requestAnimationFrame(() => guessInputRef.current?.focus());
      }
    });
  }

  function handleGuess() {
    if (busy) return;
    const guess = guessInput.trim().toUpperCase();
    if (guess.length !== currentWord.length || !/^[A-Z]+$/.test(guess)) {
      setMessage(`Guess must be ${currentWord.length} letters, letters only.`);
      return;
    }
    setMessage("");
    submitGuess(guess);
  }

  function handleTimerExpire() {
    if (busy) return;
    const guess = guessInput.trim().toUpperCase();
    if (guess.length === currentWord.length && /^[A-Z]+$/.test(guess)) {
      submitGuess(guess);
      return;
    }
    setBusy(true);
    const nextGuessesUsed = guessesUsedRef.current + 1;
    guessesUsedRef.current = nextGuessesUsed;
    const rowIndex = nextGuessesUsed - 1;
    const placeholder = currentWord.split("").map(() => "–");
    const statuses = currentWord.split("").map(() => "absent");
    animateRow(rowIndex, placeholder, statuses, () => {
      setGuessInput("");
      if (nextGuessesUsed >= maxGuesses) {
        handleLoss();
      } else {
        setGuessesUsed(nextGuessesUsed);
        setBusy(false);
        startGuessTimer();
        setMessage("⏰ Time's up! That guess is skipped.");
      }
    });
  }

  function handleWin(guessesUsedSnapshot) {
    gameTimer.stop();
    const points = Math.max(maxGuesses - guessesUsedSnapshot + 1, 1);
    const newScores = scores.slice();
    newScores[turnIndex] += points;
    setScores(newScores);
    finishTurn(
      `✅ ${names[turnIndex]} guessed it in ${guessesUsedSnapshot} ${guessesUsedSnapshot === 1 ? "try" : "tries"}! +${points} pts`,
      newScores
    );
  }

  function handleLoss() {
    gameTimer.stop();
    finishTurn(`❌ Out of guesses. The word was "${currentWord}".`, scores);
  }

  function giveUp() {
    if (busy) return;
    gameTimer.stop();
    finishTurn(`🏳️ ${names[turnIndex]} gave up. The word was "${currentWord}".`, scores);
  }

  function finishTurn(resultText, scoresSnapshot) {
    setLastResult(resultText);
    setBusy(false);
    const nextIndex = turnIndex + 1;
    setTurnIndex(nextIndex);
    if (nextIndex >= names.length) {
      showSummary(scoresSnapshot);
    } else {
      setPhase("pass");
    }
  }

  function showSummary(scoresSnapshot) {
    const entrants = names.map((name, i) => ({ name, score: scoresSnapshot[i] }));
    const { ranked, tied, winner } = resolveStanding(entrants);
    if (tied.length <= 1) {
      setResult({ ranked, winner: finalizeWinner(winner), shared: false, tiebreak: null });
      setPhase("summary");
    } else {
      setPendingRanked(ranked);
      setPendingTied(tied);
      setPhase("tiebreak");
    }
  }

  function handleTiebreakResolved(winner, shared, tiebreak) {
    setResult({ ranked: pendingRanked, winner: finalizeWinner(winner), shared, tiebreak });
    setPhase("summary");
  }

  function handlePlayAgain() {
    usedIndices.reset();
    setScores(names.map(() => 0));
    setTurnIndex(0);
    setLastResult("");
    setPhase("pass");
  }

  function handleNewGame() {
    setCategory(null);
    setPhase("setup");
  }

  return (
    <GameShell title="WORD GRID" titleIcon={Grid3x3}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Word Grid</ScreenTitle>
        <ScreenSub>No host needed — the app deals a secret word, tracks every guess, and scores the round automatically.</ScreenSub>

        <HowToPlay>
          <ol>
            <li>Pick a category, add your players, then tap <strong>Start</strong>.</li>
            <li>Each turn, pass the device to the next player — the app secretly picks a word for them to guess.</li>
            <li>Type a guess of the right length and tap <strong>Guess</strong>. Tiles flip to show how close you are:</li>
          </ol>
          <p className={styles.howLegend}>
            <span className={`${styles.legendChip} ${styles.legendCorrect}`.trim()}>Green</span> = right letter, right spot ·{" "}
            <span className={`${styles.legendChip} ${styles.legendPresent}`.trim()}>Gold</span> = right letter, wrong spot ·{" "}
            <span className={`${styles.legendChip} ${styles.legendAbsent}`.trim()}>Gray</span> = not in the word
          </p>
          <ol start={4}>
            <li>Guess the word before you run out of tries for more points — the app scores it for you.</li>
            <li>The next player's turn starts automatically once the round ends.</li>
          </ol>
        </HowToPlay>

        <SetupBlock label="1. Choose a category" wide>
          <GroupedPicker groups={{ "Pick one": CATEGORY_ITEMS }} value={category} onChange={setCategory} />
        </SetupBlock>

        <SetupBlock
          label={<>2. Who's playing? <span className={layoutStyles.optional}>(names optional)</span></>}
        >
          <Roster
            count={roster.count}
            names={roster.names}
            min={roster.min}
            max={roster.max}
            onCountChange={roster.setCount}
            onNameChange={roster.setName}
            hint={`${MIN_PLAYERS}–${MAX_PLAYERS} players`}
          />
        </SetupBlock>

        <SetupBlock label="3. Max guesses per round">
          <Stepper
            value={maxGuessesSetting}
            min={MIN_GUESSES}
            max={MAX_GUESSES}
            onChange={setMaxGuessesSetting}
            hint={`${MIN_GUESSES}–${MAX_GUESSES} guesses — fewer guesses used means more points`}
          />
        </SetupBlock>

        <SetupBlock label="4. Timer">
          <TimerSetup
            unitLabel="per guess"
            recommended={45}
            presets={[30, 45, 60, 90]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button disabled={!category} onClick={handleStart}>
          Deal the Word →
        </Button>
      </Screen>

      <Screen active={phase === "pass"}>
        <TurnBanner>{lastResult}</TurnBanner>
        <PassCard
          icon="🟩"
          title="Pass the device to"
          name={names[turnIndex]}
          hint="The app already picked your word — nobody else needs to see anything."
          buttonLabel="Tap to Start Guessing"
          onReveal={handleReveal}
        />
      </Screen>

      <Screen active={phase === "guess"}>
        <TurnBanner>
          Guess {guessesUsed + 1} of {maxGuesses}
        </TurnBanner>
        {timerSetup.enabled && <GameTimer timer={gameTimer} />}
        <WordBoard board={board} />
        <div className={styles.inputArea}>
          <input
            ref={guessInputRef}
            type="text"
            className={styles.gameInput}
            placeholder="Type your guess..."
            autoComplete="off"
            autoCapitalize="characters"
            disabled={busy}
            value={guessInput}
            onChange={(e) => setGuessInput(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") handleGuess();
            }}
          />
          <Button disabled={busy} onClick={handleGuess}>
            Guess
          </Button>
        </div>
        <p className={styles.guessMessage}>{message}</p>
        <div className={styles.giveUpWrap}>
          <Button variant="secondary" disabled={busy} onClick={giveUp}>
            🏳️ Give Up
          </Button>
        </div>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Round Complete!</ScreenTitle>
        <ScreenSub>Here's how everyone scored.</ScreenSub>
        {result && <ResultsList result={result} unit="pts" unitSingular="pt" />}
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "tiebreak"}>
        <BigIcon>⚔️</BigIcon>
        <ScreenTitle>It's a Tie!</ScreenTitle>
        <TieBreakerScreen tied={pendingTied} onResolved={handleTiebreakResolved} />
      </Screen>
    </GameShell>
  );
}
