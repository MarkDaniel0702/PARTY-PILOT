import { useRef, useState } from "react";
import { VenetianMask } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Roster } from "../../shared/components/Roster";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { PassCard } from "../../shared/components/PassCard";
import { RevealCard, ProgressDots } from "../../shared/components/RevealCard";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { pickRandom, groupKeys } from "../../shared/utils/random";
import layoutStyles from "../../shared/components/layout.module.css";
import { SPY_THEMES, SPY_THEME_ICONS, SPY_THEME_GROUPS } from "./data";
import styles from "./spy.module.css";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

const GROUPED_THEME_ITEMS = Object.fromEntries(
  Object.entries(groupKeys(Object.keys(SPY_THEMES), SPY_THEME_GROUPS)).map(([groupName, themeNames]) => [
    groupName,
    themeNames.map((name) => ({ key: name, name, icon: SPY_THEME_ICONS[name] || "🎲" }))
  ])
);

// Randomly picks a Spy index, excluding the previous round's Spy whenever
// more than one player is available so the role rotates fairly.
function pickSpyIndex(playerCount, prevSpyIndex) {
  if (playerCount <= 1) return 0;
  const candidates = [];
  for (let i = 0; i < playerCount; i++) {
    if (i !== prevSpyIndex) candidates.push(i);
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [theme, setTheme] = useState(null);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const timerSetup = useTimerSetup({ recommended: 60, defaultEnabled: true });
  const [urgent, setUrgent] = useState(false);
  const discussTimer = useGameTimer({ onExpire: () => setUrgent(true) });
  const prevSpyIndexRef = useRef(-1);

  const [names, setNames] = useState([]);
  const [words, setWords] = useState([]);
  const [mainWord, setMainWord] = useState("");
  const [spyWord, setSpyWord] = useState("");
  const [spyIndex, setSpyIndex] = useState(-1);
  const [revealIndex, setRevealIndex] = useState(0);

  function dealWords() {
    const pair = pickRandom(SPY_THEMES[theme]);
    const idx = pickSpyIndex(roster.count, prevSpyIndexRef.current);
    prevSpyIndexRef.current = idx;

    const resolved = roster.getNames();
    setNames(resolved);
    setMainWord(pair.main);
    setSpyWord(pair.spy);
    setSpyIndex(idx);
    setWords(
      resolved.map((name, i) => ({
        name,
        word: i === idx ? pair.spy : pair.main,
        isSpy: i === idx
      }))
    );
    setRevealIndex(0);
  }

  function handleStart() {
    dealWords();
    setPhase("pass");
  }

  function handleReveal() {
    setPhase("word");
  }

  function startDiscussionTimer() {
    discussTimer.stop();
    setUrgent(false);
    if (timerSetup.enabled) discussTimer.start(timerSetup.seconds);
  }

  function handleHide() {
    const next = revealIndex + 1;
    if (next >= words.length) {
      setPhase("discuss");
      startDiscussionTimer();
    } else {
      setRevealIndex(next);
      setPhase("pass");
    }
  }

  function handleRevealSpy() {
    discussTimer.stop();
    setPhase("spyreveal");
  }

  function handlePlayAgain() {
    dealWords();
    setPhase("pass");
  }

  function handleNewGame() {
    setTheme(null);
    prevSpyIndexRef.current = -1;
    setPhase("setup");
  }

  const currentPassPlayer = words[revealIndex];
  const spy = words[spyIndex];

  return (
    <>
      <div className={styles.vignette} />
      <div className={styles.spotlight} />
      <GameShell title="SPY WORD" titleIcon={VenetianMask}>
        <Screen active={phase === "setup"}>
          <ScreenTitle>Set Up the Round</ScreenTitle>
          <ScreenSub>
            Choose a theme, add your players, and pass the device around. No dedicated host needed — whoever's
            holding the phone just taps through their own turn.
          </ScreenSub>

          <HowToPlay
            steps={[
              <>Pick a theme and player count below, then tap <strong>Deal the Words</strong>.</>,
              "The device gets passed around — each player privately taps to reveal their word, then hides it before passing it on.",
              "Almost everyone gets the same word. One random player — the Spy — gets a different, related word.",
              "Once everyone's seen their word, the group discusses out loud and tries to spot who's bluffing.",
              <>Anyone can tap <strong>Reveal the Spy</strong> when the group is ready to vote.</>
            ]}
          />

          <SetupBlock label="1. Choose a theme" wide>
            <GroupedPicker groups={GROUPED_THEME_ITEMS} value={theme} onChange={setTheme} />
          </SetupBlock>

          <SetupBlock
            label={
              <>
                2. Who's playing? <span className={layoutStyles.optional}>(names optional)</span>
              </>
            }
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

          <SetupBlock label="3. Timer">
            <TimerSetup
              unitLabel="for discussion"
              recommended={60}
              presets={[30, 45, 60, 90]}
              enabled={timerSetup.enabled}
              onEnabledChange={timerSetup.setEnabled}
              seconds={timerSetup.seconds}
              onSecondsChange={timerSetup.setSeconds}
            />
          </SetupBlock>

          <Button disabled={!theme} onClick={handleStart}>
            Deal the Words →
          </Button>
        </Screen>

        <Screen active={phase === "pass"}>
          <ProgressDots current={revealIndex} total={words.length} />
          <PassCard
            icon="🤫"
            title="Pass the device to"
            name={currentPassPlayer?.name}
            hint="Make sure no one else is looking at the screen."
            buttonLabel="Tap to Reveal My Word"
            onReveal={handleReveal}
          />
        </Screen>

        <Screen active={phase === "word"}>
          <RevealCard
            label="YOUR WORD IS"
            text={currentPassPlayer?.word}
            footnote="Remember it. Don't say it out loud."
            textClassName={styles.typewriter}
          />
          <Button onClick={handleHide}>I've Seen It — Hide Word</Button>
        </Screen>

        <Screen active={phase === "discuss"}>
          <BigIcon>🗣️</BigIcon>
          <ScreenTitle>Everyone Has Their Word</ScreenTitle>
          <ScreenSub>
            Take turns describing your word without saying it. Discuss and vote — who sounds like they don't
            actually know it?
          </ScreenSub>
          {timerSetup.enabled && <GameTimer timer={discussTimer} />}
          <Button className={urgent ? styles.urgent : ""} onClick={handleRevealSpy}>
            Reveal the Spy
          </Button>
        </Screen>

        <Screen active={phase === "spyreveal"}>
          <BigIcon>🎭</BigIcon>
          <ScreenTitle>The Spy Was...</ScreenTitle>
          <p className={styles.spyName}>{spy?.name}</p>
          <ScreenSub>
            The real word was <strong>{mainWord}</strong>. The Spy had <strong>{spyWord}</strong>.
          </ScreenSub>
          <ButtonRow>
            <Button onClick={handlePlayAgain}>Play Again</Button>
            <Button variant="secondary" onClick={handleNewGame}>New Game</Button>
          </ButtonRow>
        </Screen>
      </GameShell>
    </>
  );
}
