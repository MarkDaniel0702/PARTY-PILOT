import { useState } from "react";
import { GitFork } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { TurnBanner } from "../../shared/components/RevealCard";
import { BinaryVoteButtons, VoteBar, VoteBarRow } from "../../shared/components/Voting";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { WYR_CATEGORIES, WYR_CATEGORY_ICONS } from "./data";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

const CATEGORY_ITEMS = Object.keys(WYR_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: WYR_CATEGORY_ICONS[name] || "🎲"
}));

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [category, setCategory] = useState(null);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 30, defaultEnabled: false });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({ onExpire: () => advanceVote(voteIndex + 1) });

  const [names, setNames] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState({ a: [], b: [] });
  const [questionsPlayed, setQuestionsPlayed] = useState(0);

  function beginPrompt(pool, namesArg) {
    const { item } = usedIndices.pickUnused(pool);
    setCurrentPrompt(item);
    setVotes({ a: [], b: [] });
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

  function castVote(choice) {
    const name = names[voteIndex];
    setVotes((prev) => ({ ...prev, [choice]: [...prev[choice], name] }));
    advanceVote(voteIndex + 1);
  }

  function handleStart() {
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    beginPrompt(WYR_CATEGORIES[category], resolvedNames);
  }

  function handleNextOrSkip() {
    beginPrompt(WYR_CATEGORIES[category], names);
  }

  function handleEndSession() {
    gameTimer.stop();
    setPhase("summary");
  }

  function handlePlayAgain() {
    usedIndices.reset();
    setQuestionsPlayed(0);
    beginPrompt(WYR_CATEGORIES[category], names);
  }

  function handleNewGame() {
    setCategory(null);
    setPhase("setup");
  }

  const totalVotes = votes.a.length + votes.b.length || 1;
  const aPct = Math.round((votes.a.length / totalVotes) * 100);
  const bPct = 100 - aPct;

  return (
    <GameShell title="WOULD YOU RATHER?" titleIcon={GitFork}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Pick a Side</ScreenTitle>
        <ScreenSub>No host needed — everyone votes, the app tallies. Pick a category and add your players.</ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add your players, then tap <strong>Start</strong>.</>,
            "Read the prompt out loud. Each player taps their own pick — A or B — in turn.",
            "Once everyone's voted, the results appear automatically. Talk about the split!",
            <>Tap <strong>Next Question</strong> to keep going, or <strong>Skip</strong> if a prompt isn't for your group.</>
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
            unitLabel="per question"
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
            <TurnBanner>🗳️ {names[voteIndex]}, pick A or B!</TurnBanner>
            {timerSetup.enabled && <GameTimer timer={gameTimer} />}
            {currentPrompt && (
              <BinaryVoteButtons optionA={currentPrompt.a} optionB={currentPrompt.b} onVote={castVote} />
            )}
          </>
        )}

        {phase === "results" && currentPrompt && (
          <>
            <VoteBarRow>
              <VoteBar label={currentPrompt.a} pct={aPct} count={`${votes.a.length} vote${votes.a.length === 1 ? "" : "s"} (${aPct}%)`} />
              <VoteBar label={currentPrompt.b} pct={bPct} count={`${votes.b.length} vote${votes.b.length === 1 ? "" : "s"} (${bPct}%)`} />
            </VoteBarRow>
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
