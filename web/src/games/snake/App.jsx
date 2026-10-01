import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Worm, Flag, ArrowRight, Keyboard, Skull, WifiOff, Timer, Hourglass } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker, SelectPillRow } from "../../shared/components/GroupedPicker";
import { QRPairing } from "../../shared/components/QRPairing";
import { OfflineBanner } from "../../shared/components/OfflineBanner";
import { ResultsList } from "../../shared/components/ResultsList";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { ArenaCanvas } from "./ArenaCanvas";
import {
  MAX_SNAKES,
  createGame,
  queueTurn,
  step,
  snakeById,
  standings,
  tickMs,
  secondsLeft
} from "./engine";
import styles from "./snake.module.css";

// One neon colour per seat; they have to be tellable apart across a room.
const SEAT_COLOURS = ["#3dff9a", "#ffe14a", "#ff5d73", "#4ea8ff", "#c084fc", "#ff9f43", "#2ee6d6", "#ff7ac8"];

const KEY_SEATS = [
  { seatId: "kb1", name: "Keyboard 1", hint: "W A S D" },
  { seatId: "kb2", name: "Keyboard 2", hint: "Arrow keys" }
];
// With a single keyboard seat both key sets steer it, so a lone player can use
// whichever hand they prefer.
const KEYMAP_WASD = { w: "up", a: "left", s: "down", d: "right" };
const KEYMAP_ARROWS = { ArrowUp: "up", ArrowLeft: "left", ArrowDown: "down", ArrowRight: "right" };

const MODE_ITEMS = [
  { key: "survival", name: "Survival", icon: "🐍", meta: "Last snake standing wins · the arena closes in" },
  { key: "timed", name: "Timed", icon: "⏱️", meta: "Most points when the clock runs out · you respawn" }
];
const WALL_ITEMS = [
  { key: "solid", name: "Solid walls", icon: "🧱", meta: "Hit the edge and you're out" },
  { key: "wrap", name: "Wrap-around", icon: "🌀", meta: "Leave one side, come back on the other" }
];
const SPEED_ITEMS = [
  { key: "chill", name: "Chill", icon: "🐢", meta: "Slower, easier to steer" },
  { key: "normal", name: "Normal", icon: "🐍", meta: "The standard pace" },
  { key: "fast", name: "Fast", icon: "⚡", meta: "Twitchy — good luck" }
];
const BASE_MS = { chill: 160, normal: 135, fast: 105 };
const TIMED_LENGTHS = [
  { value: 60, label: "1 min" },
  { value: 90, label: "1½ min" },
  { value: 120, label: "2 min" }
];

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | countdown | play | over
  const [mode, setMode] = useState("survival");
  const [walls, setWalls] = useState("solid");
  const [speed, setSpeed] = useState("normal");
  const [timedSeconds, setTimedSeconds] = useState(90);
  const [keyboardCount, setKeyboardCount] = useState(0);

  const [game, setGame] = useState(null);
  const [count, setCount] = useState(3);
  const [activeSeats, setActiveSeats] = useState([]);

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;
  const connected = sessionPlayers.filter((p) => p.connected);

  // The live game is held in a ref and advanced by the tick loop; React state
  // only mirrors it for drawing. Steering writes straight to the ref so a turn
  // is never lost to a render, and it is NOT re-synced from state on render for
  // the same reason (a stale render would erase a queued turn).
  const gameRef = useRef(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const seatsRef = useRef([]);
  seatsRef.current = activeSeats;
  const baseMs = BASE_MS[speed];
  const baseMsRef = useRef(baseMs);
  baseMsRef.current = baseMs;

  // ---------- who is playing ----------
  const keyboardSeats = KEY_SEATS.slice(0, keyboardCount).map((k) => ({ ...k, source: "keyboard", playerId: null }));
  const phoneSeats = connected.slice(0, MAX_SNAKES - keyboardSeats.length).map((p) => ({
    seatId: p.playerId,
    name: p.name,
    source: "phone",
    playerId: p.playerId
  }));
  const seats = [...phoneSeats, ...keyboardSeats];
  const canStart = seats.length >= 1;

  const colourOf = useMemo(
    () => Object.fromEntries(activeSeats.map((s, i) => [s.seatId, SEAT_COLOURS[i % SEAT_COLOURS.length]])),
    [activeSeats]
  );
  const nameOf = useMemo(() => Object.fromEntries(activeSeats.map((s) => [s.seatId, s.name])), [activeSeats]);
  const offline = activeSeats.filter((s) => s.source === "phone" && !connected.some((c) => c.playerId === s.playerId));

  // ---------- steering ----------
  const steer = useCallback((seatId, dir) => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "play") return;
    const next = queueTurn(g, seatId, dir);
    if (next !== g) gameRef.current = next;
  }, []);

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION || msg.kind !== ACTION.TURN) return;
      steer(msg.playerId, msg.payload?.dir);
    });
  }, [onMessage, steer]);

  useEffect(() => {
    if (phase !== "play" && phase !== "countdown") return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const lower = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const seatsNow = seatsRef.current;
      const kb1 = seatsNow.find((s) => s.seatId === "kb1");
      const kb2 = seatsNow.find((s) => s.seatId === "kb2");
      let handled = false;
      if (KEYMAP_WASD[lower] && kb1) {
        steer("kb1", KEYMAP_WASD[lower]);
        handled = true;
      }
      if (KEYMAP_ARROWS[e.key]) {
        const target = kb2 || kb1;
        if (target) steer(target.seatId, KEYMAP_ARROWS[e.key]);
        // Arrow keys scroll the page; never let them while steering.
        handled = true;
      }
      if (handled) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, steer]);

  // ---------- countdown, then the tick loop ----------
  useEffect(() => {
    if (phase !== "countdown") return undefined;
    setCount(3);
    playSound("tick");
    let n = 3;
    const id = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCount(n);
        playSound("tick");
      } else {
        clearInterval(id);
        playSound("go");
        setPhase("play");
      }
    }, 800);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return undefined;
    let timer;
    const loop = () => {
      const g = gameRef.current;
      if (!g || g.over) return;
      const next = step(g);
      gameRef.current = next;
      setGame(next);
      // One sound per tick, the most dramatic one: eight snakes eating at once
      // would otherwise be a wall of noise.
      if (next.events.some((e) => e.type === "die")) playSound("crash");
      else if (next.events.some((e) => e.type === "eat")) playSound("eat");
      if (next.over) {
        setPhase("over");
        return;
      }
      timer = setTimeout(loop, tickMs(next, baseMsRef.current));
    };
    timer = setTimeout(loop, tickMs(gameRef.current, baseMsRef.current));
    return () => clearTimeout(timer);
  }, [phase]);

  // ---------- phones: each gets its own snake's status ----------
  const lastSig = useRef({});
  useEffect(() => {
    if (phase === "setup") {
      lastSig.current = {};
      connected.forEach((p) =>
        sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to start." }))
      );
      return;
    }
    if (!game) return;
    const status = phase === "countdown" ? "countdown" : phase === "over" ? "over" : "playing";
    activeSeats.forEach((seat) => {
      if (!seat.playerId) return;
      const s = snakeById(game, seat.seatId);
      if (!s) return;
      const respawnIn = !s.alive && s.respawnAt ? Math.max(1, Math.ceil(((s.respawnAt - game.tick) * baseMs) / 1000)) : 0;
      const winner = game.over && game.winnerId === seat.seatId;
      // Only send when something the phone shows has changed — the game ticks
      // ~8 times a second and the phone doesn't need all of them.
      const sig = [status, s.alive, s.body.length, s.score, respawnIn, winner].join("|");
      if (lastSig.current[seat.playerId] === sig) return;
      lastSig.current[seat.playerId] = sig;
      sendTo(
        seat.playerId,
        viewMsg({
          view: VIEW.SNAKE,
          colour: colourOf[seat.seatId],
          name: seat.name,
          status,
          alive: s.alive,
          length: s.body.length,
          score: s.score,
          respawnIn,
          winner
        })
      );
    });
    // Phones that joined after the deal just watch.
    connected.forEach((p) => {
      if (activeSeats.some((s) => s.playerId === p.playerId)) return;
      const sig = `watch|${phase}`;
      if (lastSig.current[p.playerId] === sig) return;
      lastSig.current[p.playerId] = sig;
      sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "Spectating", subtitle: "This match is already full — watch the big screen." }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, phase, activeSeats, sessionPlayers, sendTo, colourOf, baseMs]);

  // ---------- match flow ----------
  function begin(seatList) {
    const base = BASE_MS[speed];
    const g = createGame(
      seatList.map((s) => ({ id: s.seatId })),
      {
        mode,
        wrap: walls === "wrap",
        seed: Math.floor(Math.random() * 1e9),
        durationTicks: Math.round((timedSeconds * 1000) / base)
      }
    );
    gameRef.current = g;
    lastSig.current = {};
    setActiveSeats(seatList);
    setGame(g);
    setPhase("countdown");
  }

  function handleStart() {
    begin(seats);
  }

  function handleRematch() {
    begin(activeSeats);
  }

  function handleNewMatch() {
    gameRef.current = null;
    setGame(null);
    setActiveSeats([]);
    setPhase("setup");
  }

  const ranked = useMemo(() => {
    if (!game || !game.over) return [];
    return standings(game).map((s) => ({
      name: nameOf[s.id] || "Snake",
      score: s.score,
      color: colourOf[s.id],
      id: s.id
    }));
  }, [game, nameOf, colourOf]);
  const winnerEntry = ranked.find((r) => r.id === game?.winnerId) || null;
  const result = { ranked, winner: winnerEntry, shared: false, tiebreak: null };

  const board = game ? standings(game) : [];
  const timedLeft = game && game.mode === "timed" ? secondsLeft(game, baseMs) : null;
  const fmt = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;

  return (
    <GameShell title="SNAKE BATTLE" titleIcon={Worm}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Snake Battle</ScreenTitle>
        <ScreenSub>
          Everyone steers their own snake in the same arena at the same time. Eat, grow, and trap your
          friends against a wall — or each other.
        </ScreenSub>

        <HowToPlay
          steps={[
            "Pair a phone per player — it becomes your steering pad (swipe anywhere, or tap the arrows). You can also add up to two players on this keyboard.",
            "Every snake moves on its own. You only choose the turns. Eat the glowing food to grow; golden food is worth triple.",
            <>Hit a wall, yourself, or another snake's <strong>body</strong> and you crash. If two heads meet, both crash. The snake whose body you hit gets a kill bonus.</>,
            "A crashed snake's body turns into food for everyone else.",
            <><strong>Survival:</strong> last snake alive wins, and the arena slowly closes in so it always ends. <strong>Timed:</strong> most points when the clock runs out — crashed snakes come back after a moment.</>
          ]}
        />

        <SetupBlock label="1. Mode" wide>
          <GroupedPicker groups={{ "Pick one": MODE_ITEMS }} value={mode} onChange={setMode} />
        </SetupBlock>

        {mode === "timed" && (
          <SetupBlock label="Match length">
            <SelectPillRow
              options={TIMED_LENGTHS}
              value={timedSeconds}
              onChange={setTimedSeconds}
              cols={3}
            />
          </SetupBlock>
        )}

        <SetupBlock label="2. Walls" wide>
          <GroupedPicker groups={{ "Pick one": WALL_ITEMS }} value={walls} onChange={setWalls} />
        </SetupBlock>

        <SetupBlock label="3. Speed" wide>
          <GroupedPicker groups={{ "Pick one": SPEED_ITEMS }} value={speed} onChange={setSpeed} />
        </SetupBlock>

        <SetupBlock label="4. Players" wide>
          <QRPairing
            session={session}
            teams={[]}
            description="Each player scans a QR code — their phone becomes the steering pad."
          />
          <div className={styles.kbRow}>
            <span className={styles.kbLabel}>
              <Keyboard size={16} strokeWidth={2.25} aria-hidden="true" /> Players on this keyboard
            </span>
            <SelectPillRow
              options={[
                { value: 0, label: "None" },
                { value: 1, label: "1" },
                { value: 2, label: "2" }
              ]}
              value={keyboardCount}
              onChange={setKeyboardCount}
              cols={3}
            />
          </div>
          {seats.length > 0 && (
            <div className={styles.seatStrip}>
              {seats.map((s, i) => (
                <span key={s.seatId} className={styles.seatChip} style={{ "--seat": SEAT_COLOURS[i % SEAT_COLOURS.length] }}>
                  <span className={styles.seatDot} />
                  {s.name}
                  {s.source === "keyboard" ? <em className={styles.seatHint}>{s.hint}</em> : null}
                </span>
              ))}
            </div>
          )}
          <p className={styles.modeNote}>
            {seats.length === 0
              ? "Pair a phone or add a keyboard player to begin."
              : seats.length === 1
              ? "One player — a solo practice run. Add another for a real match."
              : `${seats.length} players ready${connected.length > MAX_SNAKES - keyboardSeats.length ? ` (first ${MAX_SNAKES} play)` : ""}.`}
          </p>
        </SetupBlock>

        <Button disabled={!canStart} onClick={handleStart}>
          Start <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
        {!canStart && <p className={styles.startHint}>Needs at least one player.</p>}
      </Screen>

      <Screen active={phase === "countdown" || phase === "play"}>
        {game && (
          <div className={styles.arena}>
            <div className={styles.matchBar}>
              <span className={styles.modeTag}>{game.mode === "timed" ? "⏱️ Timed" : "🐍 Survival"}</span>
              {timedLeft !== null ? (
                <span className={styles.clock}>
                  <Timer size={15} strokeWidth={2.5} aria-hidden="true" /> {fmt(timedLeft)}
                </span>
              ) : (
                <span className={styles.clock}>
                  {game.inset > 0 ? "⚠ The walls are closing in" : `${board.filter((s) => s.alive).length} alive`}
                </span>
              )}
              <Button variant="secondary" className={styles.endBtn} onClick={handleNewMatch}>
                <Flag size={13} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End match
              </Button>
            </div>

            <div className={styles.layout}>
              <div className={styles.field}>
                <ArenaCanvas game={game} colours={colourOf} names={nameOf} label="The arena" />
                {phase === "countdown" && (
                  <div className={styles.countdown} aria-live="assertive">
                    <span key={count} className={styles.countNum}>
                      {count}
                    </span>
                    <span className={styles.countHint}>Get ready…</span>
                  </div>
                )}
              </div>

              <aside className={styles.scores} aria-label="Scoreboard">
                {board.map((s) => {
                  const isOffline = offline.some((o) => o.seatId === s.id);
                  const waiting = !s.alive && s.respawnAt ? Math.max(1, Math.ceil(((s.respawnAt - game.tick) * baseMs) / 1000)) : 0;
                  return (
                    <div
                      key={s.id}
                      className={`${styles.scoreRow} ${s.alive ? "" : styles.scoreDead}`.trim()}
                      style={{ "--seat": colourOf[s.id] }}
                    >
                      <span className={styles.seatDot} />
                      <span className={styles.scoreName}>{nameOf[s.id]}</span>
                      {isOffline && <WifiOff size={13} strokeWidth={2.5} className={styles.offlineIcon} aria-label="offline" />}
                      {!s.alive &&
                        (waiting ? (
                          <span className={styles.status} title={`Back in ${waiting}s`}>
                            <Hourglass size={13} strokeWidth={2.5} aria-hidden="true" />
                            {waiting}
                          </span>
                        ) : (
                          <Skull size={14} strokeWidth={2.5} className={styles.status} aria-label="crashed" />
                        ))}
                      <span className={styles.scoreLen} title="Length">
                        {s.alive ? s.body.length : "—"}
                      </span>
                      <span className={styles.scoreVal}>{s.score}</span>
                    </div>
                  );
                })}
                <div className={styles.legend}>
                  <span>name</span>
                  <span>len · pts</span>
                </div>
              </aside>
            </div>

            <OfflineBanner names={offline.map((s) => s.name)} />
          </div>
        )}
      </Screen>

      <Screen active={phase === "over"}>
        <BigIcon>{winnerEntry ? "🏆" : "🤝"}</BigIcon>
        <ScreenTitle>{winnerEntry ? `${winnerEntry.name} wins!` : "It's a draw!"}</ScreenTitle>
        <ScreenSub>
          {game?.mode === "timed" ? "Most points when time ran out." : "The last snake standing."}
        </ScreenSub>
        {ranked.length > 0 && <ResultsList result={result} unit="pts" unitSingular="pt" showSwatch />}
        <ButtonRow>
          <Button onClick={handleRematch}>Rematch</Button>
          <Button variant="secondary" onClick={handleNewMatch}>New Match</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
