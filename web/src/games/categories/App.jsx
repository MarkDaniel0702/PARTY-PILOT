import { useState } from "react";
import { Brain } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow, ToggleCheck } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { CategoryBanner, TurnBanner, RevealCard } from "../../shared/components/RevealCard";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { CATEGORIES_LIST } from "./data";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [eliminationMode, setEliminationMode] = useState(true);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 10, defaultEnabled: true });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({ onExpire: () => handleStuck() });

  const [names, setNames] = useState([]);
  const [activeIndices, setActiveIndices] = useState([]);
  const [turnPos, setTurnPos] = useState(0);
  const [category, setCategory] = useState("");
  const [summaryTitle, setSummaryTitle] = useState("Round Complete!");
  const [summaryText, setSummaryText] = useState("Great round.");

  function pickCategory() {
    return usedIndices.pickUnused(CATEGORIES_LIST).item;
  }

  function startTimerForTurn() {
    gameTimer.stop();
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function handleStart() {
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    const active = resolvedNames.map((_, i) => i);
    setActiveIndices(active);
    setTurnPos(0);
    setCategory(pickCategory());
    setPhase("play");
    startTimerForTurn();
  }

  function advanceTurn() {
    setTurnPos((p) => (p + 1) % activeIndices.length);
    startTimerForTurn();
  }

  function handleNailedIt() {
    gameTimer.stop();
    advanceTurn();
  }

  function handleStuck() {
    gameTimer.stop();
    if (eliminationMode) {
      const newActive = activeIndices.slice();
      newActive.splice(turnPos, 1);
      if (newActive.length === 1) {
        setActiveIndices(newActive);
        showSummary(names[newActive[0]]);
        return;
      }
      const newPos = turnPos >= newActive.length ? 0 : turnPos;
      setActiveIndices(newActive);
      setTurnPos(newPos);
      startTimerForTurn();
    } else {
      advanceTurn();
    }
  }

  function handleNewCategory() {
    setCategory(pickCategory());
    setTurnPos(0);
    startTimerForTurn();
  }

  function handleEndRound() {
    showSummary(null);
  }

  function showSummary(winnerName) {
    gameTimer.stop();
    if (winnerName) {
      setSummaryTitle("🏆 We Have a Winner!");
      setSummaryText(`${winnerName} is the last one standing!`);
    } else {
      setSummaryTitle("Round Complete!");
      setSummaryText("Great round! Ready for another?");
    }
    setPhase("summary");
  }

  function handlePlayAgain() {
    const active = names.map((_, i) => i);
    setActiveIndices(active);
    setTurnPos(0);
    setCategory(pickCategory());
    setPhase("play");
    startTimerForTurn();
  }

  function handleNewGame() {
    usedIndices.reset();
    setPhase("setup");
  }

  const currentName = names[activeIndices[turnPos]];

  return (
    <GameShell title="CATEGORIES" titleIcon={Brain}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Categories</ScreenTitle>
        <ScreenSub>No host needed — the app picks the category, keeps time, and moves the turn along.</ScreenSub>

        <HowToPlay
          steps={[
            <>Add your players and tap <strong>Start</strong> — a random category appears.</>,
            "Going in turn order, each player names something in that category before the timer runs out.",
            <>Tap <strong>Nailed It!</strong> once they say something, or <strong>Stuck / Repeated</strong> if they can't — the group self-referees, the app just keeps the pace.</>,
            "In Elimination Mode, getting stuck knocks you out — last player standing wins. Turn it off for a casual, no-pressure round."
          ]}
        />

        <SetupBlock label="Who's playing?">
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

        <SetupBlock>
          <ToggleCheck
            label="🎯 Elimination Mode (last player standing wins)"
            checked={eliminationMode}
            onChange={setEliminationMode}
          />
        </SetupBlock>

        <SetupBlock label="Timer">
          <TimerSetup
            unitLabel="per turn"
            recommended={10}
            presets={[5, 10, 15, 20]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button onClick={handleStart}>Start →</Button>
      </Screen>

      <Screen active={phase === "play"}>
        <CategoryBanner>🧠 Category: {category}</CategoryBanner>
        <TurnBanner>{currentName ? `🎙️ ${currentName}'s turn!` : null}</TurnBanner>
        {timerSetup.enabled && <GameTimer timer={gameTimer} />}

        <RevealCard footnote="Say something that fits the category out loud!" />

        <ButtonRow>
          <Button onClick={handleNailedIt}>✅ Nailed It!</Button>
          <Button variant="secondary" onClick={handleStuck}>❌ Stuck / Repeated</Button>
        </ButtonRow>
        <ButtonRow>
          <Button variant="secondary" onClick={handleNewCategory}>🔄 New Category</Button>
          <Button variant="secondary" onClick={handleEndRound}>🏁 End Round</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏆</BigIcon>
        <ScreenTitle>{summaryTitle}</ScreenTitle>
        <ScreenSub>{summaryText}</ScreenSub>
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
