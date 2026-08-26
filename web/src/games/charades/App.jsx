import { useState } from "react";
import { Drama } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { PassCard } from "../../shared/components/PassCard";
import { RevealCard, TurnBanner } from "../../shared/components/RevealCard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { CHARADES_CATEGORIES, CHARADES_CATEGORY_ICONS } from "./data";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

const CATEGORY_ITEMS = Object.keys(CHARADES_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: CHARADES_CATEGORY_ICONS[name] || "🎭"
}));

function finalizeWinner(winner) {
  // Ports the original's `result.winner === entry && entry.score > 0` guard
  // — a lone "winner" who never actually scored a point (only possible if
  // everyone tied at 0 and a tie-breaker crowned someone) doesn't get the
  // gold highlight.
  return winner && winner.score > 0 ? winner : null;
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 60, defaultEnabled: true });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({
    onExpire: () => finishTurn(`⏰ Time's up! The word was "${currentWord}".`, scores)
  });

  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [lastResult, setLastResult] = useState("");

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  function handleStart() {
    usedIndices.reset();
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    setScores(resolvedNames.map(() => 0));
    setTurnIndex(0);
    setLastResult("");
    setPhase("pass");
  }

  function handleReveal() {
    const pool = CHARADES_CATEGORIES[category];
    const { item } = usedIndices.pickUnused(pool);
    setCurrentWord(item);
    setPhase("act");
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function handleCorrect() {
    gameTimer.stop();
    const newScores = scores.slice();
    newScores[turnIndex] += 1;
    setScores(newScores);
    finishTurn(`✅ ${names[turnIndex]} got it! (+1 point)`, newScores);
  }

  function handleSkip() {
    gameTimer.stop();
    finishTurn(`⏭️ Skipped "${currentWord}".`, scores);
  }

  function finishTurn(resultText, scoresSnapshot) {
    setLastResult(resultText);
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
    <GameShell title="CHARADES" titleIcon={Drama}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Charades</ScreenTitle>
        <ScreenSub>No host needed — the app deals the word, runs the clock, and passes the turn automatically.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add your players, then tap <strong>Start</strong>.</>,
            "Each turn, one player privately sees a secret word or phrase and acts it out — no talking!",
            <>The group shouts out guesses. Anyone taps <strong>Correct!</strong> the moment it's guessed.</>,
            <>If time runs out first, tap <strong>Skip</strong> and the next player goes.</>,
            "Correct rounds score a point for the actor — totally optional, just for fun."
          ]}
        />

        <SetupBlock label="1. Choose a category" wide>
          <GroupedPicker groups={{ "Pick one": CATEGORY_ITEMS }} value={category} onChange={setCategory} />
        </SetupBlock>

        <SetupBlock label="2. Who's playing?">
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

        <SetupBlock label="3. Timer">
          <TimerSetup
            unitLabel="per round"
            recommended={60}
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
          icon="🎭"
          title="Pass the device to"
          name={names[turnIndex]}
          hint="Get ready to act — nobody else should see the word!"
          buttonLabel="Tap to Reveal My Word"
          onReveal={handleReveal}
        />
      </Screen>

      <Screen active={phase === "act"}>
        <ScreenSub>
          <strong>{names[turnIndex]}</strong>, act this out — no talking or spelling!
        </ScreenSub>
        {timerSetup.enabled && <GameTimer timer={gameTimer} />}
        <RevealCard label="ACT THIS OUT" text={currentWord} />
        <ButtonRow>
          <Button onClick={handleCorrect}>✅ Correct!</Button>
          <Button variant="secondary" onClick={handleSkip}>⏭️ Skip</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Nice Acting!</ScreenTitle>
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
