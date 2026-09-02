import { useCallback, useEffect, useRef, useState } from "react";
import { Grid3x3, Flag, ArrowRight } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { Stepper } from "../../shared/components/Stepper";
import { QRPairing } from "../../shared/components/QRPairing";
import { ResultsList } from "../../shared/components/ResultsList";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg, event as eventMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { BoardView, PiecePreview } from "./BoardView";
import styles from "./tetris.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

// One accent per seat. Everything that belongs to a player — pane rim, name,
// garbage tracer, their own phone — wears the same colour, which is the only
// way four boards on one screen stay tellable apart at a glance.
const SEAT_COLOURS = ["#31d0e0", "#e8c31d", "#e8434f", "#7ee06a"];

const TRACER_MS = 850;
const CLEAR_LABELS = { 1: "SINGLE", 2: "DOUBLE", 3: "TRIPLE", 4: "TETRIS!" };

const MODE_ITEMS = [
  { key: "battle", name: "Battle", icon: "💥", meta: "Clears send garbage · last board standing wins" },
  { key: "race", name: "Line Race", icon: "🏁", meta: "No garbage · most lines in 3 minutes wins" }
];

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | play | over
  const [mode, setMode] = useState("battle");
  const [raceSeconds, setRaceSeconds] = useState(3);
  const [seed, setSeed] = useState(1);
  // playerId -> { name, snap, over, score, lines }
  const [boards, setBoards] = useState({});
  const [order, setOrder] = useState([]);
  const [knockouts, setKnockouts] = useState([]);
  const [clock, setClock] = useState(0);

  // Presentation-only: none of it can change the outcome of a match.
  const [attacks, setAttacks] = useState([]);
  const [hits, setHits] = useState({});
  const [bursts, setBursts] = useState({});
  const arenaRef = useRef(null);
  const paneRefs = useRef({});
  const seenRef = useRef({});

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const connected = sessionPlayers.filter((p) => p.connected);
  const canStart = connected.length >= MIN_PLAYERS;

  const ref = useRef();
  ref.current = { phase, mode, boards, order, knockouts };

  // A garbage attack, drawn as a shell flying from the attacker's pane to
  // each victim's. Positions are measured at the moment it fires, so the
  // tracer stays right whatever the layout is doing.
  const spawnAttacks = useCallback((from, targets, rows) => {
    const arena = arenaRef.current;
    const src = paneRefs.current[from];
    if (!arena || !src) return;
    const ab = arena.getBoundingClientRect();
    const sb = src.getBoundingClientRect();
    const made = targets
      .map((pid) => {
        const el = paneRefs.current[pid];
        if (!el) return null;
        const tb = el.getBoundingClientRect();
        return {
          id: from + "-" + pid + "-" + Date.now() + "-" + Math.random(),
          rows,
          x0: sb.left - ab.left + sb.width / 2,
          y0: sb.top - ab.top + sb.height / 2,
          x1: tb.left - ab.left + tb.width / 2,
          y1: tb.top - ab.top + tb.height / 2
        };
      })
      .filter(Boolean);
    if (made.length === 0) return;
    setAttacks((a) => [...a, ...made]);
    const ids = new Set(made.map((m) => m.id));
    setTimeout(() => setAttacks((a) => a.filter((x) => !ids.has(x.id))), TRACER_MS + 120);
    setTimeout(() => {
      const at = Date.now();
      setHits((h) => {
        const next = { ...h };
        targets.forEach((pid) => {
          next[pid] = { rows, at };
        });
        return next;
      });
    }, TRACER_MS * 0.7);
  }, []);

  // ---------- messages from the phones ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const st = ref.current;
      if (st.phase !== "play") return;
      const id = msg.playerId;

      if (msg.kind === ACTION.TETRIS_STATE) {
        setBoards((b) => (b[id] ? { ...b, [id]: { ...b[id], ...msg.payload } } : b));
        return;
      }

      if (msg.kind === ACTION.TETRIS_GARBAGE) {
        // Spread garbage across everyone still alive, so a strong player
        // pressures the whole table rather than picking on one victim.
        const targets = st.order.filter((pid) => pid !== id && !st.boards[pid]?.over);
        if (targets.length === 0) return;
        const rows = msg.payload?.rows || 0;
        targets.forEach((pid) => sendTo(pid, eventMsg("garbage", { rows, at: Date.now() })));
        playSound("steal");
        spawnAttacks(id, targets, rows);
        return;
      }

      if (msg.kind === ACTION.TETRIS_OVER) {
        setBoards((b) => (b[id] ? { ...b, [id]: { ...b[id], ...msg.payload, over: true } } : b));
        setKnockouts((k) => (k.includes(id) ? k : [...k, id]));
      }
    });
  }, [onMessage, sendTo, spawnAttacks]);

  // ---------- match lifecycle ----------
  const startMatch = useCallback(() => {
    const players = sessionPlayers.filter((p) => p.connected).slice(0, MAX_PLAYERS);
    if (players.length < MIN_PLAYERS) return;
    // One shared seed: everybody gets the same piece sequence, so a loss is
    // never down to a worse bag.
    const s = Math.floor(Math.random() * 1e9);
    setSeed(s);
    setOrder(players.map((p) => p.playerId));
    setBoards(
      Object.fromEntries(
        players.map((p) => [p.playerId, { name: p.name, snap: null, over: false, score: 0, lines: 0, level: 1 }])
      )
    );
    setKnockouts([]);
    setAttacks([]);
    setHits({});
    setBursts({});
    seenRef.current = {};
    setClock(mode === "race" ? raceSeconds * 60 : 0);
    setPhase("play");
    players.forEach((p, i) => {
      sendTo(p.playerId, viewMsg({ view: VIEW.TETRIS, seed: s, mode, colour: SEAT_COLOURS[i % SEAT_COLOURS.length] }));
    });
  }, [sessionPlayers, mode, raceSeconds, sendTo]);

  // Lobby view while setting up.
  useEffect(() => {
    if (phase !== "setup") return;
    connected.forEach((p) =>
      sendTo(p.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to start." }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sessionPlayers, sendTo]);

  // Clock: counts down in race mode, up in battle (just for interest).
  useEffect(() => {
    if (phase !== "play") return undefined;
    const id = setInterval(() => {
      setClock((c) => {
        if (mode !== "race") return c + 1;
        if (c <= 1) return 0;
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, mode]);

  // Line clears and level-ups, spotted by diffing successive snapshots. The
  // engine clears lines the instant a piece locks, so without `clearId` in
  // the snapshot a clear can happen entirely between two samples and the TV
  // would never know it had anything to celebrate.
  useEffect(() => {
    if (phase !== "play") return;
    const fresh = {};
    let changed = false;
    order.forEach((id) => {
      const b = boards[id];
      if (!b) return;
      const seen = seenRef.current[id] || { clearId: 0, level: 1 };
      const clearId = b.clearId ?? 0;
      const level = b.level ?? 1;
      if (clearId > seen.clearId && b.clear > 0) {
        fresh[id] = { kind: "clear", n: b.clear, at: Date.now() };
        changed = true;
      } else if (level > seen.level) {
        fresh[id] = { kind: "level", n: level, at: Date.now() };
        changed = true;
      }
      seenRef.current[id] = { clearId, level };
    });
    if (changed) setBursts((prev) => ({ ...prev, ...fresh }));
  }, [boards, order, phase]);

  // End conditions.
  useEffect(() => {
    if (phase !== "play" || order.length === 0) return;
    const alive = order.filter((id) => !boards[id]?.over);
    const finished = mode === "race" ? clock <= 0 : alive.length <= 1;
    if (!finished) return;
    playSound("complete");
    order.forEach((id) => sendTo(id, eventMsg("end", {})));
    order.forEach((id) =>
      sendTo(id, viewMsg({ view: VIEW.WAIT, title: "Match over", subtitle: "Check the big screen." }))
    );
    setPhase("over");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, boards, order, clock, mode]);

  function handleNewMatch() {
    setPhase("setup");
    setBoards({});
    setOrder([]);
  }

  // Standings: in battle, survival order decides it (last knocked out is
  // highest); in race, it's simply lines cleared.
  const ranked = order
    .map((id) => {
      const b = boards[id] || {};
      const koIndex = knockouts.indexOf(id);
      return {
        name: b.name || "Player",
        score: mode === "race" ? b.lines || 0 : b.over ? koIndex : order.length,
        lines: b.lines || 0,
        points: b.score || 0
      };
    })
    .sort((a, b) => b.score - a.score || b.points - a.points);

  const result = { ranked, winner: ranked[0] || null, shared: false, tiebreak: null };

  const aliveCount = order.filter((id) => !boards[id]?.over).length;
  const topLines = Math.max(1, ...order.map((id) => boards[id]?.lines || 0));
  const leaderId = order.reduce((best, id) => {
    if (boards[id]?.over) return best;
    if (!best) return id;
    return (boards[id]?.lines || 0) > (boards[best]?.lines || 0) ? id : best;
  }, null);

  return (
    <GameShell title="TETRIS BATTLE" titleIcon={Grid3x3}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Tetris Battle</ScreenTitle>
        <ScreenSub>
          Everyone plays at once on their own phone, and every board shows up here on the big screen.
          Clear lines to bury your friends in garbage.
        </ScreenSub>

        <HowToPlay
          steps={[
            <>Everyone pairs a phone — that's your board and your controls, so there's <strong>no input lag</strong>.</>,
            "This screen shows everybody's board side by side, plus scores and knockouts.",
            <>In <strong>Battle</strong>, clearing 2+ lines at once sends garbage rows to everyone else. A clear of your own cancels incoming garbage first.</>,
            <>In <strong>Line Race</strong>, nobody sends garbage — most lines cleared before the clock runs out wins.</>,
            "Everyone gets exactly the same sequence of pieces, so it's pure skill."
          ]}
        />

        <SetupBlock label="1. Mode" wide>
          <GroupedPicker groups={{ "Pick one": MODE_ITEMS }} value={mode} onChange={setMode} />
        </SetupBlock>

        {mode === "race" && (
          <SetupBlock label="2. Race length">
            <div className={styles.row}>
              <span>Minutes</span>
              <Stepper value={raceSeconds} min={1} max={5} onChange={setRaceSeconds} />
            </div>
          </SetupBlock>
        )}

        <SetupBlock label={mode === "race" ? "3. Players" : "2. Players"}>
          <QRPairing session={session} teams={[]} />
          {connected.length > 0 && (
            <div className={styles.seatStrip}>
              {connected.slice(0, MAX_PLAYERS).map((p, i) => (
                <span key={p.playerId} className={styles.seatChip} style={{ "--seat": SEAT_COLOURS[i] }}>
                  <span className={styles.seatDot} />
                  {p.name}
                </span>
              ))}
            </div>
          )}
          <p className={styles.modeNote}>
            {connected.length === 0
              ? `Everyone needs a phone for this one — pair at least ${MIN_PLAYERS}.`
              : `${connected.length} paired${connected.length > MAX_PLAYERS ? ` (first ${MAX_PLAYERS} play)` : ""}.`}
          </p>
        </SetupBlock>

        <Button disabled={!canStart} onClick={startMatch}>
          Start Match <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
        {!canStart && (
          <p className={styles.startHint}>
            Needs at least {MIN_PLAYERS} paired phones — this is the one game that can't be played on the shared screen alone.
          </p>
        )}
      </Screen>

      <Screen active={phase === "play"}>
        {/* Breaks out of the shared 1000px column: four wells on a TV need the
            whole width, and their height is what decides how big they can be. */}
        <div className={styles.arena} ref={arenaRef}>
          <div className={styles.matchBar}>
            <span className={styles.modeTag}>{mode === "race" ? "🏁 Line Race" : "💥 Battle"}</span>
            <span className={styles.clock}>
              {mode === "race"
                ? `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, "0")}`
                : `${aliveCount} still standing`}
            </span>
            <Button variant="secondary" className={styles.endBtn} onClick={handleNewMatch}>
              <Flag size={13} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End match
            </Button>
          </div>

          <div className={styles.grid} style={{ "--cols": Math.max(1, order.length) }}>
            {order.map((id, i) => {
              const b = boards[id] || {};
              const seat = SEAT_COLOURS[i % SEAT_COLOURS.length];
              const burst = bursts[id];
              const hit = hits[id];
              const place = b.over ? order.length - knockouts.indexOf(id) : null;
              return (
                <div
                  key={id}
                  ref={(el) => {
                    paneRefs.current[id] = el;
                  }}
                  className={`${styles.pane} ${b.over ? styles.paneOut : ""}`.trim()}
                  style={{ "--seat": seat }}
                >
                  <div className={styles.paneHead}>
                    <span className={styles.seatDot} />
                    <span className={styles.paneName}>{b.name}</span>
                    {id === leaderId && order.length > 1 && (
                      <span className={styles.crown} title="Most lines">👑</span>
                    )}
                    <span className={styles.paneScore}>
                      {b.lines || 0}
                      <span className={styles.paneScoreUnit}>lines</span>
                    </span>
                  </div>

                  <div className={styles.paneBody}>
                    <div className={styles.rail}>
                      <span className={styles.railLabel}>Hold</span>
                      <PiecePreview type={b.hold} size={26} faded />
                      <span className={styles.railLabel}>Next</span>
                      {(b.next || []).slice(0, 3).map((t, n) => (
                        <PiecePreview key={n} type={t} size={n === 0 ? 26 : 20} />
                      ))}
                      <span className={styles.railSpacer} />
                      <span className={styles.railLabel}>Lv</span>
                      <span className={styles.railValue}>{b.level || 1}</span>
                    </div>

                    <div className={styles.boardWrap}>
                      <BoardView cells={b.cells} piece={b.piece} dimmed={b.over} label={`${b.name}'s board`} />
                      {b.pending > 0 && !b.over && (
                        <span
                          className={styles.warnBar}
                          style={{ "--fill": `${Math.min(100, (b.pending / 10) * 100)}%` }}
                          title={`${b.pending} garbage rows incoming`}
                        />
                      )}
                      {hit && (
                        <span key={hit.at} className={styles.hitBadge}>
                          +{hit.rows}
                        </span>
                      )}
                      {burst && !b.over && (
                        <span
                          key={burst.at}
                          className={
                            burst.kind === "level"
                              ? styles.levelFlare
                              : `${styles.clearBurst} ${burst.n === 4 ? styles.clearBurstBig : ""}`.trim()
                          }
                        >
                          {burst.kind === "level" ? `LEVEL ${burst.n} · SPEED UP` : CLEAR_LABELS[burst.n]}
                        </span>
                      )}
                      {b.over && (
                        <span className={styles.koStamp}>
                          Knocked out
                          <em>#{place}</em>
                        </span>
                      )}
                    </div>
                  </div>

                  {mode === "race" && (
                    <span className={styles.raceTrack}>
                      <span
                        className={styles.raceFill}
                        style={{ width: `${Math.min(100, ((b.lines || 0) / topLines) * 100)}%` }}
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {attacks.map((a) => (
            <span
              key={a.id}
              className={styles.tracer}
              style={{
                "--x0": `${a.x0}px`,
                "--y0": `${a.y0}px`,
                "--x1": `${a.x1}px`,
                "--y1": `${a.y1}px`
              }}
            >
              +{a.rows}
            </span>
          ))}
        </div>
      </Screen>

      <Screen active={phase === "over"}>
        <BigIcon>🏁</BigIcon>
        <ScreenTitle>{ranked[0] ? `${ranked[0].name} wins!` : "Match over"}</ScreenTitle>
        <ScreenSub>{mode === "race" ? "Most lines cleared." : "Last board standing."}</ScreenSub>
        <ResultsList result={result} unit={mode === "race" ? "lines" : "pts"} unitSingular="line" />
        <ButtonRow>
          <Button onClick={startMatch}>Rematch</Button>
          <Button variant="secondary" onClick={handleNewMatch}>New Match</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}
