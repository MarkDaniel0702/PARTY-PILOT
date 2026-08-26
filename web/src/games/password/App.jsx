import { useState } from "react";
import { Lock } from "lucide-react";
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
import { RevealCard, TurnBanner } from "../../shared/components/RevealCard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { PASSWORD_CATEGORIES, PASSWORD_CATEGORY_ICONS } from "./data";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const MIN_CLUES = 3;
const MAX_CLUES = 8;

const CATEGORY_ITEMS = Object.keys(PASSWORD_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: PASSWORD_CATEGORY_ICONS[name] || "🔐"
}));

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);
  const [maxCluesSetting, setMaxCluesSetting] = useState(5);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 15, defaultEnabled: true });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({
    onExpire: () => {
      if (cluesUsed < maxClues) giveNextClue();
      else giveUp();
    }
  });

  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [maxClues, setMaxClues] = useState(5);
  const [cluesUsed, setCluesUsed] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [lastResult, setLastResult] = useState("");

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  function handleStart() {
    const resolvedNames = roster.getNames();
    usedIndices.reset();
    setNames(resolvedNames);
    setScores(resolvedNames.map(() => 0));
    setTurnIndex(0);
    setMaxClues(maxCluesSetting);
    setLastResult("");
    setPhase("pass");
  }

  function startClueTimer() {
    gameTimer.stop();
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function handleReveal() {
    const pool = PASSWORD_CATEGORIES[category];
    const { item } = usedIndices.pickUnused(pool);
    setCurrentWord(item);
    setCluesUsed(1);
    setPhase("clue");
    startClueTimer();
  }

  function giveNextClue() {
    if (cluesUsed >= maxClues) return;
    setCluesUsed(cluesUsed + 1);
    startClueTimer();
  }

  function handleGotIt() {
    gameTimer.stop();
    const points = Math.max(maxClues - cluesUsed + 1, 1);
    const newScores = scores.slice();
    newScores[turnIndex] += points;
    setScores(newScores);
    finishTurn(`✅ Guessed after ${cluesUsed} clue${cluesUsed === 1 ? "" : "s"}! +${points} pts`, newScores);
  }

  function giveUp() {
    gameTimer.stop();
    finishTurn(`The word was "${currentWord}".`, scores);
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
    <GameShell title="PASSWORD" titleIcon={Lock}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Password</ScreenTitle>
        <ScreenSub>No host needed — the app deals the word, counts clues, and scores automatically.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category, add your players, then tap <strong>Start</strong>.</>,
            "Each turn, one player privately sees a secret word and gives one-word clues out loud — no rhyming, no spelling.",
            <>The rest of the group shouts guesses. Tap <strong>They Got It!</strong> the moment someone's right.</>,
            "Fewer clues used means more points — the app scores it for you.",
            "The clue-giver role rotates automatically every round."
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

        <SetupBlock label="3. Max clues per round">
          <Stepper
            value={maxCluesSetting}
            min={MIN_CLUES}
            max={MAX_CLUES}
            onChange={setMaxCluesSetting}
            hint={`${MIN_CLUES}–${MAX_CLUES} clues — fewer clues used means more points`}
          />
        </SetupBlock>

        <SetupBlock label="4. Timer">
          <TimerSetup
            unitLabel="per clue"
            recommended={15}
            presets={[10, 15, 20, 30]}
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
          icon="🔐"
          title="Pass the device to"
          name={names[turnIndex]}
          hint="You'll give one-word clues — nobody else should see the word!"
          buttonLabel="Tap to Reveal My Word"
          onReveal={handleReveal}
        />
      </Screen>

      <Screen active={phase === "clue"}>
        <ScreenSub>Give one-word clues out loud — the group is guessing!</ScreenSub>
        <TurnBanner>
          Clue {cluesUsed} of {maxClues}
        </TurnBanner>
        {timerSetup.enabled && <GameTimer timer={gameTimer} />}
        <RevealCard label="YOUR SECRET WORD" text={currentWord} />
        <Button disabled={cluesUsed >= maxClues} onClick={giveNextClue}>
          🗣️ Give Next Clue
        </Button>
        <div style={{ marginTop: "0.8rem" }}>
          <ButtonRow>
            <Button onClick={handleGotIt}>✅ They Got It!</Button>
            <Button variant="secondary" onClick={giveUp}>🏳️ Give Up</Button>
          </ButtonRow>
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
