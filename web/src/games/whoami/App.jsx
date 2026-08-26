import { useState } from "react";
import { HelpCircle } from "lucide-react";
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
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { shuffle } from "../../shared/utils/random";
import { WHOAMI_CATEGORIES, WHOAMI_CATEGORY_ICONS } from "./data";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;
const TIMER_RECOMMENDED = 120;

const CATEGORY_ITEMS = Object.keys(WHOAMI_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: WHOAMI_CATEGORY_ICONS[name] || "🎭"
}));

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: TIMER_RECOMMENDED, defaultEnabled: true });
  const gameTimer = useGameTimer({
    onExpire: () => finishTurn(`⏰ Time's up! The answer was ${characters[turnIndex]}.`)
  });

  const [names, setNames] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [lastResult, setLastResult] = useState("");

  function dealCharacters() {
    const pool = shuffle(WHOAMI_CATEGORIES[category]);
    const resolvedNames = roster.getNames();
    const dealt = resolvedNames.map((_, i) => pool[i % pool.length]);
    setNames(resolvedNames);
    setCharacters(dealt);
    return resolvedNames;
  }

  function handleStart() {
    dealCharacters();
    setTurnIndex(0);
    setLastResult("");
    setPhase("pass");
  }

  function handleReveal() {
    setPhase("reveal");
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function handleGotIt() {
    gameTimer.stop();
    finishTurn(`🎉 ${names[turnIndex]} got it!`);
  }

  function handleGiveUp() {
    gameTimer.stop();
    finishTurn(`The answer was ${characters[turnIndex]}.`);
  }

  function finishTurn(resultText) {
    setLastResult(resultText);
    const nextIndex = turnIndex + 1;
    setTurnIndex(nextIndex);
    setPhase(nextIndex >= names.length ? "summary" : "pass");
  }

  function handlePlayAgain() {
    dealCharacters();
    setTurnIndex(0);
    setLastResult("");
    setPhase("pass");
  }

  function handleNewGame() {
    setCategory(null);
    setPhase("setup");
  }

  const currentName = names[turnIndex];

  return (
    <GameShell title="WHO AM I?" titleIcon={HelpCircle}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Who Am I?</ScreenTitle>
        <ScreenSub>No host needed — the app assigns everyone a secret identity and keeps time automatically.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add your players, then tap <strong>Start</strong>.</>,
            <>Each player gets a secret character — held up for the <strong>group</strong> to see, not the player themselves.</>,
            "The player asks yes-or-no questions out loud to guess who they are, while the group answers.",
            <>Tap <strong>Got It!</strong> when they guess right, or let the timer run out.</>,
            "The turn passes automatically to the next player."
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
            unitLabel="per player"
            recommended={TIMER_RECOMMENDED}
            presets={[60, 90, 120, 180]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button disabled={!category} onClick={handleStart}>
          Deal the Identities →
        </Button>
      </Screen>

      <Screen active={phase === "pass"}>
        <TurnBanner>{lastResult}</TurnBanner>
        <PassCard
          icon="🙈"
          title="It's"
          name={currentName}
          hint={
            <>
              's turn! Everyone <strong>else</strong> should be watching — {currentName}, look away.
            </>
          }
          buttonLabel="They've Looked Away — Show Everyone"
          onReveal={handleReveal}
        />
      </Screen>

      <Screen active={phase === "reveal"}>
        <ScreenSub>
          Hold the screen up for the group — <strong>{currentName}</strong> shouldn't look!
        </ScreenSub>
        {timerSetup.enabled && <GameTimer timer={gameTimer} />}
        <RevealCard
          label="WHO AM I?"
          text={characters[turnIndex]}
          footnote="Ask yes-or-no questions out loud to guess who you are."
        />
        <ButtonRow>
          <Button onClick={handleGotIt}>✅ Got It!</Button>
          <Button variant="secondary" onClick={handleGiveUp}>🏳️ Reveal &amp; Skip</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Everyone's Had a Turn!</ScreenTitle>
        <ScreenSub>Great game. Ready for another round?</ScreenSub>
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
