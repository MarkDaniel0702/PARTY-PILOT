import { useState } from "react";
import { Users } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { TurnBanner } from "../../shared/components/RevealCard";
import { PlayerPickerGrid } from "../../shared/components/Voting";
import { ResultsList } from "../../shared/components/ResultsList";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { MLT_CATEGORIES, MLT_CATEGORY_ICONS } from "./data";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

const CATEGORY_ITEMS = Object.keys(MLT_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: MLT_CATEGORY_ICONS[name] || "🎲"
}));

function PromptHeading({ text }) {
  return (
    <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,4vw,1.6rem)", textAlign: "center", margin: "0 0 1.5rem", color: "var(--paper)" }}>
      Most likely to {text}
    </p>
  );
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 30, defaultEnabled: false });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({ onExpire: () => advanceVote(voteIndex + 1) });

  const [names, setNames] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [questionsPlayed, setQuestionsPlayed] = useState(0);

  function beginPrompt(pool, namesArg) {
    const { item } = usedIndices.pickUnused(pool);
    setCurrentPrompt(item);
    setVotes(namesArg.map(() => 0));
    setVoteIndex(0);
    setPhase("vote");
    gameTimer.stop();
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function advanceVote(nextIndex) {
    setVoteIndex(nextIndex);
    if (nextIndex >= names.length) {
      setQuestionsPlayed((n) => n + 1);
      setPhase("results");
      gameTimer.stop();
    } else {
      gameTimer.stop();
      if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
    }
  }

  function castVote(nomineeIndex) {
    setVotes((prev) => prev.map((v, i) => (i === nomineeIndex ? v + 1 : v)));
    advanceVote(voteIndex + 1);
  }

  function handleStart() {
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    beginPrompt(MLT_CATEGORIES[category], resolvedNames);
  }

  function handleNextOrSkip() {
    beginPrompt(MLT_CATEGORIES[category], names);
  }

  function handleEndSession() {
    gameTimer.stop();
    setPhase("summary");
  }

  function handlePlayAgain() {
    usedIndices.reset();
    setQuestionsPlayed(0);
    beginPrompt(MLT_CATEGORIES[category], names);
  }

  function handleNewGame() {
    setCategory(null);
    setPhase("setup");
  }

  const ranked = names
    .map((name, i) => ({ name, score: votes[i] || 0 }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0] && ranked[0].score > 0 ? ranked[0] : null;

  return (
    <GameShell title="MOST LIKELY TO" titleIcon={Users}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Who's Most Likely?</ScreenTitle>
        <ScreenSub>No host needed — everyone votes for someone in the group, the app tallies it up.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add your players (at least 3), then tap <strong>Start</strong>.</>,
            'A question appears, like "Most likely to become famous?" Each player taps who they\'d vote for — in turn.',
            "Once everyone's voted, the results reveal automatically, ranked by votes.",
            <>Tap <strong>Next Question</strong> to keep going, or <strong>Skip</strong> anytime.</>
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
            unitLabel="for voting"
            recommended={30}
            presets={[15, 30, 45, 60]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button disabled={!category} onClick={handleStart}>
          Start →
        </Button>
      </Screen>

      <Screen active={phase === "vote" || phase === "results"}>
        {phase === "vote" && (
          <>
            <TurnBanner>🗳️ {names[voteIndex]}, cast your vote!</TurnBanner>
            {timerSetup.enabled && <GameTimer timer={gameTimer} />}
            <PromptHeading text={currentPrompt} />
            <PlayerPickerGrid players={names} onPick={castVote} />
          </>
        )}

        {phase === "results" && (
          <>
            <PromptHeading text={currentPrompt} />
            <ResultsList result={{ ranked, winner, shared: false, tiebreak: null }} unit="votes" unitSingular="vote" />
            <Button onClick={handleNextOrSkip}>Next Question →</Button>
          </>
        )}

        <ButtonRow>
          <Button variant="secondary" onClick={handleNextOrSkip}>Skip</Button>
          <Button variant="secondary" onClick={handleEndSession}>🏁 End Session</Button>
        </ButtonRow>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Session Complete!</ScreenTitle>
        <ScreenSub>
          You made it through {questionsPlayed} question{questionsPlayed === 1 ? "" : "s"}.
        </ScreenSub>
        <ButtonRow>
          <Button onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
