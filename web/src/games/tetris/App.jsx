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
import { BoardView } from "./BoardView";
import styles from "./tetris.module.css";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const RACE_SECONDS = 180;

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

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const connected = sessionPlayers.filter((p) => p.connected);
  const canStart = connected.length >= MIN_PLAYERS;

  const ref = useRef();
  ref.current = { phase, mode, boards, order, knockouts };

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
        return;
      }

      if (msg.kind === ACTION.TETRIS_OVER) {
        setBoards((b) => (b[id] ? { ...b, [id]: { ...b[id], ...msg.payload, over: true } } : b));
        setKnockouts((k) => (k.includes(id) ? k : [...k, id]));
      }
    });
  }, [onMessage, sendTo]);

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
        players.map((p) => [p.playerId, { name: p.name, snap: null, over: false, score: 0, lines: 0 }])
      )
    );
    setKnockouts([]);
    setClock(mode === "race" ? raceSeconds * 60 : 0);
    setPhase("play");
    players.forEach((p) => {
      sendTo(p.playerId, viewMsg({ view: VIEW.TETRIS, seed: s, mode }));
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
        <div className={styles.matchBar}>
          <span className={styles.modeTag}>{mode === "race" ? "🏁 Line Race" : "💥 Battle"}</span>
          <span className={styles.clock}>
            {mode === "race"
              ? `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, "0")}`
              : `${order.filter((id) => !boards[id]?.over).length} still standing`}
          </span>
        </div>

        <div className={styles.grid} style={{ "--cols": Math.min(order.length, 2) }}>
          {order.map((id) => {
            const b = boards[id] || {};
            return (
              <div key={id} className={`${styles.pane} ${b.over ? styles.paneOut : ""}`.trim()}>
                <div className={styles.paneHead}>
                  <span className={styles.paneName}>{b.name}</span>
                  <span className={styles.paneScore}>{b.lines || 0} lines</span>
                </div>
                <BoardView cells={b.cells} dimmed={b.over} label={`${b.name}'s board`} />
                {b.over && <span className={styles.koTag}>KNOCKED OUT</span>}
              </div>
            );
          })}
        </div>

        <div className={styles.endWrap}>
          <Button variant="secondary" onClick={handleNewMatch}>
            <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End match
          </Button>
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
