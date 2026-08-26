import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { TurnBanner } from "../../shared/components/RevealCard";
import { StatementCard, StatementList } from "../../shared/components/StatementCard";
import { Scoreboard } from "../../shared/components/Scoreboard";
import { ResultsList } from "../../shared/components/ResultsList";
import { TieBreakerScreen } from "../../shared/components/TieBreakerScreen";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { TTL_PROMPT_SETS } from "./data";
import styles from "./twotruths.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

export default function App() {
  const [phase, setPhase] = useState("setup");

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 60, defaultEnabled: false });
  const usedIndices = useUsedIndices();
  const gameTimer = useGameTimer({ onExpire: () => showRoundResults(roundGuesses) });

  const [names, setNames] = useState([]);
  const [scores, setScores] = useState([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const [view, setView] = useState("compose"); // 'compose' | 'statements' | 'voting' | 'results'
  const [statements, setStatements] = useState([]);
  const [lieIndex, setLieIndex] = useState(-1);

  const [showWriteForm, setShowWriteForm] = useState(false);
  const [inputs, setInputs] = useState(["", "", ""]);
  const [selectedLieIndex, setSelectedLieIndex] = useState(-1);

  const [voterOrder, setVoterOrder] = useState([]);
  const [voterPos, setVoterPos] = useState(0);
  const [roundGuesses, setRoundGuesses] = useState([]);
  const [roundSummary, setRoundSummary] = useState({ correctCount: 0, fooledCount: 0, totalVoters: 0 });

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  function startTurn() {
    setStatements([]);
    setLieIndex(-1);
    setShowWriteForm(false);
    setInputs(["", "", ""]);
    setSelectedLieIndex(-1);
    setView("compose");
  }

  function handleStart() {
    const resolvedNames = roster.getNames();
    setNames(resolvedNames);
    setScores(resolvedNames.map(() => 0));
    setTurnIndex(0);
    setRoundsPlayed(0);
    setPhase("play");
    startTurn();
  }

  function handleModeWrite() {
    setShowWriteForm(true);
    setInputs(["", "", ""]);
    setSelectedLieIndex(-1);
  }

  function handleInputChange(i, value) {
    setInputs((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
  }

  const writeFormValid = inputs.every((v) => v.trim().length > 0) && selectedLieIndex !== -1;

  function handleSubmitWrite() {
    setStatements(inputs.map((v) => v.trim()));
    setLieIndex(selectedLieIndex);
    setView("statements");
  }

  function handleModeQuick() {
    const { item } = usedIndices.pickUnused(TTL_PROMPT_SETS);
    setStatements(item.statements.slice());
    setLieIndex(item.lieIndex);
    setView("statements");
  }

  function handleStartVoting() {
    const order = names.map((_, i) => i).filter((i) => i !== turnIndex);
    setVoterOrder(order);
    setVoterPos(0);
    setRoundGuesses([]);
    setView("voting");
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function castVote(guessIndex) {
    const voterIndex = voterOrder[voterPos];
    const nextGuesses = [...roundGuesses, { voterIndex, guessIndex }];
    const nextPos = voterPos + 1;
    setRoundGuesses(nextGuesses);
    setVoterPos(nextPos);
    if (nextPos >= voterOrder.length) {
      showRoundResults(nextGuesses);
    }
  }

  function showRoundResults(guessesSnapshot) {
    gameTimer.stop();
    setRoundsPlayed((r) => r + 1);

    let correctCount = 0;
    guessesSnapshot.forEach(({ guessIndex }) => {
      if (guessIndex === lieIndex) correctCount++;
    });
    const fooledCount = guessesSnapshot.length - correctCount;

    const newScores = scores.slice();
    guessesSnapshot.forEach(({ voterIndex, guessIndex }) => {
      if (guessIndex === lieIndex) newScores[voterIndex] += 1;
    });
    newScores[turnIndex] += fooledCount;
    setScores(newScores);

    setRoundSummary({ correctCount, fooledCount, totalVoters: guessesSnapshot.length });
    setView("results");
  }

  function handleNextTurn() {
    setTurnIndex((t) => (t + 1) % names.length);
    startTurn();
  }

  function goToSummary() {
    const entrants = names.map((name, i) => ({ name, score: scores[i] }));
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

  function handleEndSession() {
    gameTimer.stop();
    goToSummary();
  }

  function handleTiebreakResolved(winner, shared, tiebreak) {
    setResult({ ranked: pendingRanked, winner: finalizeWinner(winner), shared, tiebreak });
    setPhase("summary");
  }

  function handlePlayAgain() {
    usedIndices.reset();
    setScores(names.map(() => 0));
    setTurnIndex(0);
    setRoundsPlayed(0);
    setPhase("play");
    startTurn();
  }

  function handleNewGame() {
    setPhase("setup");
  }

  return (
    <GameShell title="TWO TRUTHS AND A LIE" titleIcon={Fingerprint}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Two Truths and a Lie</ScreenTitle>
        <ScreenSub>No host needed — the turn, the statements, and the voting all rotate through the app automatically.</ScreenSub>

        <HowToPlay
          steps={[
            <>Add your players, then tap <strong>Start</strong>.</>,
            "Each turn, one player either writes 3 statements about themselves (2 true, 1 false) or grabs a ready-made prompt.",
            "Everyone reads the 3 statements — only the storyteller knows which is the lie.",
            "Every other player votes on which one they think is false.",
            "The app reveals the answer and tallies who guessed right, then passes the turn to the next player."
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

        <SetupBlock label="Timer">
          <TimerSetup
            unitLabel="for discussion & voting"
            recommended={60}
            presets={[30, 45, 60, 90]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button onClick={handleStart}>Start →</Button>
      </Screen>

      <Screen active={phase === "play"}>
        <TurnBanner>🎙️ {names[turnIndex]}'s turn</TurnBanner>

        {view === "compose" && (
          <>
            <div className={styles.card}>
              <p className={styles.instructions}>
                Write 3 statements about yourself — two true, one false — or grab a ready-made prompt.
              </p>
              <Button onClick={handleModeWrite}>✍️ Write My Own</Button>
              <div className={styles.secondaryGap}>
                <Button variant="secondary" onClick={handleModeQuick}>🎲 Use a Quick Prompt</Button>
              </div>
            </div>

            {showWriteForm && (
              <div className={styles.card}>
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <label className={styles.label}>Statement {i + 1}</label>
                    <input
                      type="text"
                      className={styles.input}
                      maxLength={120}
                      placeholder="Something true or false about you..."
                      value={inputs[i]}
                      onChange={(e) => handleInputChange(i, e.target.value)}
                    />
                  </div>
                ))}
                <p className={styles.label} style={{ marginTop: "1rem" }}>
                  Which one is the lie? <span className={styles.optional}>(only you should look)</span>
                </p>
                <ButtonRow cols={3}>
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.lieBtn} ${selectedLieIndex === i ? styles.lieBtnSelected : ""}`.trim()}
                      onClick={() => setSelectedLieIndex(i)}
                    >
                      #{i + 1} is the lie
                    </button>
                  ))}
                </ButtonRow>
                <div style={{ marginTop: "1.2rem" }}>
                  <Button disabled={!writeFormValid} onClick={handleSubmitWrite}>
                    Ready — Show the Group →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {view === "statements" && (
          <>
            <ScreenSub>Read these three out loud. Which one's the lie?</ScreenSub>
            <StatementList>
              {statements.map((text, i) => (
                <StatementCard key={i} index={i} text={text} />
              ))}
            </StatementList>
            <Button onClick={handleStartVoting}>🗳️ Start Voting</Button>
          </>
        )}

        {view === "voting" && (
          <>
            <TurnBanner>🗳️ {names[voterOrder[voterPos]]}, which one is the lie?</TurnBanner>
            {timerSetup.enabled && <GameTimer timer={gameTimer} />}
            <StatementList>
              {statements.map((text, i) => (
                <StatementCard key={i} index={i} text={text} onClick={() => castVote(i)} />
              ))}
            </StatementList>
          </>
        )}

        {view === "results" && (
          <>
            <ScreenSub>The lie was...</ScreenSub>
            <StatementList>
              {statements.map((text, i) => (
                <StatementCard key={i} index={i} text={text} variant={i === lieIndex ? "lie" : "truth"} />
              ))}
            </StatementList>
            <p className={styles.tally}>
              {roundSummary.correctCount} of {roundSummary.totalVoters} player
              {roundSummary.totalVoters === 1 ? "" : "s"} spotted the lie. {names[turnIndex]} fooled{" "}
              {roundSummary.fooledCount}.
            </p>
            <Scoreboard entries={names.map((name, i) => ({ name, score: scores[i] }))} />
            <Button onClick={handleNextTurn}>Next Player's Turn →</Button>
          </>
        )}

        <div className={styles.endWrap}>
          <Button variant="secondary" onClick={handleEndSession}>🏁 End Session</Button>
        </div>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Session Complete!</ScreenTitle>
        <ScreenSub>You played {roundsPlayed} round{roundsPlayed === 1 ? "" : "s"}.</ScreenSub>
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
