import { useEffect, useMemo, useRef, useState } from "react";
import { Brush, Flag, ArrowRight, Undo2, Trash2 } from "lucide-react";
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
import { QRPairing } from "../../shared/components/QRPairing";
import { useRoster } from "../../shared/hooks/useRoster";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useUsedIndices } from "../../shared/hooks/useUsedIndices";
import { resolveStanding } from "../../shared/utils/resolveStanding";
import { useHostSession } from "../../shared/controller/useHostSession";
import { useSeats, seatsMode } from "../../shared/controller/useSeats";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { StrokeCanvas } from "../../shared/draw/StrokeCanvas";
import { PALETTE, WIDTHS, createStroke, appendPoint, appendPoints } from "../../shared/draw/strokes";
import { playSound } from "../../shared/audio/sounds";
import {
  RESULT,
  judgeGuess,
  feedEntry,
  maskWord,
  hintCount,
  guessPoints,
  drawerPoints
} from "./guessMatch";
import {
  DRAWGUESS_CATEGORIES,
  DRAWGUESS_CATEGORY_ICONS,
  CUSTOM_CATEGORY,
  MIN_CUSTOM_WORDS,
  parseCustomWords
} from "./data";
import styles from "./drawguess.module.css";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const EMPTY_BOARD = { strokes: [], live: null };

const CATEGORY_ITEMS = Object.keys(DRAWGUESS_CATEGORIES).map((name) => ({
  key: name,
  name,
  icon: DRAWGUESS_CATEGORY_ICONS[name] || "🎨"
}));

function finalizeWinner(winner) {
  return winner && winner.score > 0 ? winner : null;
}

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | pass | draw | reveal | summary | tiebreak
  const [category, setCategory] = useState(null);
  const [customText, setCustomText] = useState("");
  const [rounds, setRounds] = useState(2);

  const roster = useRoster({ min: MIN_PLAYERS, max: MAX_PLAYERS, initialCount: 4 });
  const rosterNames = useMemo(() => roster.getNames(), [roster.getNames]);
  const timerSetup = useTimerSetup({ recommended: 60, defaultEnabled: true });
  const usedIndices = useUsedIndices();

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;
  const seats = useSeats({ sessionPlayers, rosterNames });
  const mode = seatsMode(seats);

  const [activeSeats, setActiveSeats] = useState([]);
  const [scores, setScores] = useState({});
  const [roundIndex, setRoundIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [feed, setFeed] = useState([]);
  const [correctIds, setCorrectIds] = useState([]);
  const [lastResult, setLastResult] = useState("");
  const [colour, setColour] = useState(PALETTE[0]);
  const [width, setWidth] = useState(WIDTHS[1]);

  const [pendingTied, setPendingTied] = useState([]);
  const [pendingRanked, setPendingRanked] = useState([]);
  const [result, setResult] = useState(null);

  const gameTimer = useGameTimer({ onExpire: () => endTurn(null) });

  const seatById = useMemo(() => {
    const m = {};
    activeSeats.forEach((s) => {
      m[s.seatId] = s;
    });
    return m;
  }, [activeSeats]);

  const drawer = activeSeats[turnIndex] || null;
  const guessers = activeSeats.filter((s) => s.seatId !== drawer?.seatId);

  const customWords = useMemo(() => parseCustomWords(customText), [customText]);
  const pickerItems = useMemo(() => {
    const items = [...CATEGORY_ITEMS];
    if (customWords.length >= MIN_CUSTOM_WORDS) {
      items.push({ key: CUSTOM_CATEGORY, name: CUSTOM_CATEGORY, icon: "✏️", meta: `${customWords.length} words` });
    }
    return items;
  }, [customWords]);

  const elapsedFraction =
    timerSetup.enabled && timerSetup.seconds > 0
      ? 1 - gameTimer.remaining / timerSetup.seconds
      : 0;
  const revealed = hintCount(currentWord, elapsedFraction);
  const masked = maskWord(currentWord, revealed);

  // Message handlers read through a ref so the listener registers once.
  const stateRef = useRef();
  stateRef.current = {
    phase,
    drawerId: drawer?.seatId ?? null,
    currentWord,
    correctIds,
    seatById,
    remainingFraction:
      timerSetup.enabled && timerSetup.seconds > 0
        ? Math.max(0, gameTimer.remaining / timerSetup.seconds)
        : 1
  };

  // ---------- phone input ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const st = stateRef.current;
      if (st.phase !== "draw") return;
      const from = msg.playerId;
      const isDrawer = from === st.drawerId;

      // Only the drawer may touch the canvas.
      if (isDrawer) {
        const p = msg.payload || {};
        if (msg.kind === ACTION.STROKE_START) {
          setBoard((b) => ({ ...b, live: createStroke(p.id, p.colour, p.width, p.x, p.y) }));
        } else if (msg.kind === ACTION.STROKE_POINTS) {
          setBoard((b) => (b.live && b.live.id === p.id ? { ...b, live: appendPoints(b.live, p.pts) } : b));
        } else if (msg.kind === ACTION.STROKE_END) {
          setBoard((b) => (b.live ? { strokes: [...b.strokes, b.live], live: null } : b));
        } else if (msg.kind === ACTION.UNDO) {
          setBoard((b) => ({ ...b, strokes: b.strokes.slice(0, -1) }));
        } else if (msg.kind === ACTION.CLEAR) {
          setBoard(EMPTY_BOARD);
        }
        return;
      }

      if (msg.kind === ACTION.GUESS) submitGuess(from, msg.payload?.text || "");
    });
  }, [onMessage]);

  // Push each phone its own view. DRAW carries the word and goes only to the
  // drawer; GUESS carries the masked word, so the answer never reaches anyone
  // who is meant to be guessing it.
  useEffect(() => {
    if (mode !== "phone" || sessionPlayers.length === 0) return;

    if (phase === "setup") {
      sessionPlayers.forEach((p) => {
        if (p.connected) {
          sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to start." }));
        }
      });
      return;
    }

    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      if (phase !== "draw") {
        sendTo(
          seat.playerId,
          viewMsg({ view: VIEW.WAIT, title: "Hold tight", subtitle: "Watch the main screen." })
        );
        return;
      }
      if (seat.seatId === drawer?.seatId) {
        sendTo(
          seat.playerId,
          viewMsg({
            view: VIEW.DRAW,
            title: "Draw this",
            word: currentWord,
            colours: PALETTE,
            widths: WIDTHS
          })
        );
      } else {
        sendTo(
          seat.playerId,
          viewMsg({
            view: VIEW.GUESS,
            title: correctIds.includes(seat.seatId) ? "You got it!" : "What is it?",
            hint: masked,
            locked: correctIds.includes(seat.seatId),
            feed: feed.slice(-6)
          })
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, phase, activeSeats, drawer, currentWord, masked, feed, correctIds, sessionPlayers, sendTo]);

  // ---------- turn flow ----------
  function wordPool() {
    return category === CUSTOM_CATEGORY ? customWords : DRAWGUESS_CATEGORIES[category] || [];
  }

  function beginTurn(seatsArg, idx, roundArg) {
    const { item } = usedIndices.pickUnused(wordPool());
    setCurrentWord(item);
    setBoard(EMPTY_BOARD);
    setFeed([]);
    setCorrectIds([]);
    setTurnIndex(idx);
    setRoundIndex(roundArg);
    // With phones the drawer reads the word privately on their own screen, so
    // there is nothing to pass — go straight to drawing.
    if (seatsMode(seatsArg) === "phone") {
      setPhase("draw");
      if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
    } else {
      setPhase("pass");
    }
  }

  function handleStart() {
    const dealt = seats.slice(0, MAX_PLAYERS);
    usedIndices.reset();
    setActiveSeats(dealt);
    setScores(Object.fromEntries(dealt.map((s) => [s.seatId, 0])));
    setLastResult("");
    beginTurn(dealt, 0, 0);
  }

  // Local mode only: the drawer has seen the word and is ready to draw.
  function handleLocalReveal() {
    setPhase("draw");
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
  }

  function submitGuess(seatId, text) {
    const st = stateRef.current;
    const verdict = judgeGuess(text, st.currentWord, {
      isDrawer: seatId === st.drawerId,
      alreadyCorrect: st.correctIds.includes(seatId)
    });
    if (verdict === RESULT.IGNORED) return;

    const name = st.seatById[seatId]?.name || "Player";

    if (verdict === RESULT.CORRECT) {
      playSound("correct");
      const pts = guessPoints(st.remainingFraction);
      setScores((prev) => ({ ...prev, [seatId]: (prev[seatId] || 0) + pts }));
      setCorrectIds((prev) => [...prev, seatId]);
      setFeed((prev) => [...prev, feedEntry(name, text, RESULT.CORRECT)]);
      return;
    }

    // A near miss is told only to the guesser — the shared feed shows it as an
    // ordinary wrong guess, or the whole room learns they're one letter away.
    if (verdict === RESULT.CLOSE) {
      const seat = st.seatById[seatId];
      if (seat?.playerId) {
        sendTo(
          seat.playerId,
          viewMsg({
            view: VIEW.GUESS,
            title: "So close!",
            hint: maskWord(st.currentWord, hintCount(st.currentWord, 1 - st.remainingFraction)),
            close: true,
            feed: []
          })
        );
      }
    }
    setFeed((prev) => [...prev, feedEntry(name, text, RESULT.WRONG)]);
  }

  // Local mode: the group shouts and someone taps who got it.
  function handleLocalCorrect(seatId) {
    submitGuess(seatId, currentWord);
  }

  // Everyone guessed — end the turn as soon as the last one lands.
  useEffect(() => {
    if (phase !== "draw" || guessers.length === 0) return;
    if (correctIds.length >= guessers.length) endTurn(correctIds.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctIds, phase, guessers.length]);

  function endTurn(correctCount) {
    gameTimer.stop();
    const n = correctCount ?? stateRef.current.correctIds.length;
    const drawerId = stateRef.current.drawerId;
    const pts = drawerPoints(n);
    if (pts > 0 && drawerId) {
      setScores((prev) => ({ ...prev, [drawerId]: (prev[drawerId] || 0) + pts }));
    }
    setLastResult(
      n > 0
        ? `${n} ${n === 1 ? "player" : "players"} got it — ${seatById[drawerId]?.name || "the drawer"} scores ${pts}.`
        : `Nobody got "${stateRef.current.currentWord}".`
    );
    setPhase("reveal");
  }

  function handleNextTurn() {
    const nextIdx = turnIndex + 1;
    if (nextIdx < activeSeats.length) {
      beginTurn(activeSeats, nextIdx, roundIndex);
      return;
    }
    const nextRound = roundIndex + 1;
    if (nextRound < rounds) {
      beginTurn(activeSeats, 0, nextRound);
      return;
    }
    showSummary();
  }

  function showSummary() {
    const entrants = activeSeats.map((s) => ({ name: s.name, score: scores[s.seatId] || 0 }));
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
    setScores(Object.fromEntries(activeSeats.map((s) => [s.seatId, 0])));
    setLastResult("");
    beginTurn(activeSeats, 0, 0);
  }

  function handleNewGame() {
    gameTimer.stop();
    setCategory(null);
    setActiveSeats([]);
    setPhase("setup");
  }

  // ---------- local drawing on the shared screen ----------
  const localSeqRef = useRef(0);
  function localStart(nx, ny, c, w) {
    const id = `l${localSeqRef.current++}`;
    setBoard((b) => ({ ...b, live: createStroke(id, c, w, nx, ny) }));
  }
  function localPoint(nx, ny) {
    setBoard((b) => (b.live ? { ...b, live: appendPoint(b.live, nx, ny) } : b));
  }
  function localEnd() {
    setBoard((b) => (b.live ? { strokes: [...b.strokes, b.live], live: null } : b));
  }

  const canStart =
    seats.length >= MIN_PLAYERS &&
    !!category &&
    (category !== CUSTOM_CATEGORY || customWords.length >= MIN_CUSTOM_WORDS);

  return (
    <GameShell title="DRAW & GUESS" titleIcon={Brush}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Draw &amp; Guess</ScreenTitle>
        <ScreenSub>
          One player draws, everyone else guesses. Sketch on your own phone and it appears on the big
          screen — or pass one device around if nobody's pairing.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Pick a category and add players, then tap <strong>Start</strong>. Pair phones so everyone can type guesses, or skip it and shout them out.</>,
            "Each turn one player secretly gets a word and draws it — no letters, no numbers, no talking.",
            "Everyone else guesses. The faster you get it, the more points you score.",
            "The drawer scores too, for every player who guesses it — so draw clearly!",
            <>Stuck? Letters start appearing as the clock runs down.</>
          ]}
        />

        <SetupBlock label="1. Choose a category" wide>
          <GroupedPicker groups={{ "Pick one": pickerItems }} value={category} onChange={setCategory} />
        </SetupBlock>

        <SetupBlock label="2. Your own words (optional)">
          <textarea
            className={styles.customInput}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Add your own words, separated by commas or new lines — inside jokes welcome"
          />
          <p className={styles.customHint}>
            {customWords.length === 0
              ? `Add at least ${MIN_CUSTOM_WORDS} words to unlock "${CUSTOM_CATEGORY}".`
              : customWords.length < MIN_CUSTOM_WORDS
              ? `${customWords.length} of ${MIN_CUSTOM_WORDS} words — add ${MIN_CUSTOM_WORDS - customWords.length} more.`
              : `${customWords.length} words ready — pick "${CUSTOM_CATEGORY}" above to use them.`}
          </p>
        </SetupBlock>

        <SetupBlock label="3. Players">
          <Roster
            count={roster.count}
            names={roster.names}
            min={roster.min}
            max={roster.max}
            onCountChange={roster.setCount}
            onNameChange={roster.setName}
            hint={`${MIN_PLAYERS}–${MAX_PLAYERS} players`}
          />
          <p className={styles.modeNote}>
            {mode === "phone"
              ? `${seats.length} phone${seats.length === 1 ? "" : "s"} paired — these players are the game, and guesses are typed. The list above is ignored.`
              : "No phones paired — the device gets passed to each drawer, and everyone shouts their guesses."}
          </p>
        </SetupBlock>

        <SetupBlock label="4. Phone controllers">
          <QRPairing session={session} teams={[]} />
        </SetupBlock>

        <SetupBlock label="5. Rounds">
          <div className={styles.roundsRow}>
            <span>How many times does everyone draw?</span>
            <Stepper value={rounds} min={1} max={3} onChange={setRounds} />
          </div>
        </SetupBlock>

        <SetupBlock label="6. Timer">
          <TimerSetup
            unitLabel="per drawing"
            recommended={60}
            presets={[45, 60, 90, 120]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button disabled={!canStart} onClick={handleStart}>
          Start <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
        {!canStart && (
          <p className={styles.startHint}>
            Needs a category and at least {MIN_PLAYERS} players — add more, or pair another phone.
          </p>
        )}
      </Screen>

      <Screen active={phase === "pass"}>
        <TurnBanner>{lastResult}</TurnBanner>
        <PassCard
          icon="🎨"
          title="Pass the device to"
          name={drawer?.name || ""}
          hint="Nobody else look — your word is about to show."
          buttonLabel="Show my word"
          onReveal={handleLocalReveal}
        />
      </Screen>

      <Screen active={phase === "draw"}>
        <div className={styles.roundBar}>
          <span>
            Round {roundIndex + 1} of {rounds}
          </span>
          <span className={styles.drawerName}>✏️ {drawer?.name} is drawing</span>
        </div>

        {timerSetup.enabled && <GameTimer timer={gameTimer} />}

        <p className={styles.maskedWord} aria-label="word so far">
          {masked.split("").map((c, i) => (
            <span key={i} className={c === "_" ? styles.blank : styles.letter}>
              {c === "_" ? "_" : c}
            </span>
          ))}
        </p>

        {/* Local mode shows the word to whoever is holding the device — they
            already revealed it deliberately via the pass card. */}
        {mode === "local" && <p className={styles.localWord}>Your word: <strong>{currentWord}</strong></p>}

        <StrokeCanvas
          strokes={board.strokes}
          liveStroke={board.live}
          interactive={mode === "local"}
          colour={colour}
          width={width}
          onStrokeStart={localStart}
          onStrokePoint={localPoint}
          onStrokeEnd={localEnd}
          label={`${drawer?.name || "Someone"}'s drawing`}
        />

        {mode === "local" && (
          <div className={styles.tools}>
            <div className={styles.swatches}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`colour ${c}`}
                  className={`${styles.swatch} ${c === colour ? styles.swatchOn : ""}`.trim()}
                  style={{ background: c }}
                  onClick={() => setColour(c)}
                />
              ))}
            </div>
            <div className={styles.widths}>
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  type="button"
                  aria-label={`brush ${w}`}
                  className={`${styles.widthBtn} ${w === width ? styles.widthOn : ""}`.trim()}
                  onClick={() => setWidth(w)}
                >
                  <span style={{ width: w / 2 + 4, height: w / 2 + 4 }} />
                </button>
              ))}
            </div>
            <div className={styles.toolActions}>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={() => setBoard((b) => ({ ...b, strokes: b.strokes.slice(0, -1) }))}
              >
                <Undo2 size={15} strokeWidth={2.5} /> Undo
              </button>
              <button type="button" className={styles.toolBtn} onClick={() => setBoard(EMPTY_BOARD)}>
                <Trash2 size={15} strokeWidth={2.5} /> Clear
              </button>
            </div>
          </div>
        )}

        {mode === "phone" ? (
          <div className={styles.feed}>
            {feed.length === 0 && <p className={styles.feedEmpty}>Guesses will appear here…</p>}
            {feed.slice(-8).map((f, i) => (
              <p key={i} className={f.correct ? styles.feedHit : styles.feedLine}>
                <strong>{f.name}</strong> {f.correct ? "got it!" : f.text}
              </p>
            ))}
          </div>
        ) : (
          <div className={styles.awardRow}>
            <p className={styles.awardHint}>Someone shouted it? Tap who got it:</p>
            {guessers.map((s) => (
              <button
                key={s.seatId}
                type="button"
                className={styles.awardBtn}
                disabled={correctIds.includes(s.seatId)}
                onClick={() => handleLocalCorrect(s.seatId)}
              >
                {correctIds.includes(s.seatId) ? "✅ " : ""}
                {s.name} got it!
              </button>
            ))}
          </div>
        )}

        <div className={styles.endWrap}>
          <Button variant="secondary" onClick={() => endTurn(null)}>
            <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End turn
          </Button>
        </div>
      </Screen>

      <Screen active={phase === "reveal"}>
        <BigIcon>🖼️</BigIcon>
        <ScreenTitle>It was &ldquo;{currentWord}&rdquo;</ScreenTitle>
        <ScreenSub>{lastResult}</ScreenSub>
        <StrokeCanvas strokes={board.strokes} label="the finished drawing" />
        <ul className={styles.scoreList}>
          {activeSeats.map((s) => (
            <li key={s.seatId} className={styles.scoreRow}>
              <span>
                {s.seatId === drawer?.seatId ? "✏️ " : ""}
                {s.name}
              </span>
              <span className={styles.scoreVal}>{scores[s.seatId] || 0}</span>
            </li>
          ))}
        </ul>
        <Button onClick={handleNextTurn}>Next turn →</Button>
      </Screen>

      <Screen active={phase === "summary"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>Pens down!</ScreenTitle>
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
