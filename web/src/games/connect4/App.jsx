import { useCallback, useEffect, useRef, useState } from "react";
import { CircleDot, Flag, ArrowRight } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, BigIcon, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { GroupedPicker } from "../../shared/components/GroupedPicker";
import { TimerSetup } from "../../shared/components/TimerSetup";
import { GameTimer } from "../../shared/components/GameTimer";
import { QRPairing } from "../../shared/components/QRPairing";
import { OfflineBanner } from "../../shared/components/OfflineBanner";
import { ResultsList } from "../../shared/components/ResultsList";
import { useTimerSetup } from "../../shared/hooks/useTimerSetup";
import { useGameTimer } from "../../shared/hooks/useGameTimer";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { Board, DISC_HEX, DISC_VAR } from "./Board";
import {
  COLS,
  createGame,
  dropDisc,
  legalColumns,
  pickFallbackColumn,
  encodeBoard,
  seriesWinner
} from "./engine";
import styles from "./connect4.module.css";

const SERIES_ITEMS = [
  { key: "1", name: "Single game", icon: "1️⃣", meta: "One game, winner takes it" },
  { key: "3", name: "Best of 3", icon: "3️⃣", meta: "First to 2 game wins" },
  { key: "5", name: "Best of 5", icon: "5️⃣", meta: "First to 3 game wins" }
];

export default function App() {
  const [phase, setPhase] = useState("setup"); // setup | play | over
  const [bestOf, setBestOf] = useState("3");
  const [localNames, setLocalNames] = useState(["", ""]);
  const timerSetup = useTimerSetup({ recommended: 20, defaultEnabled: false });

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;
  const connected = sessionPlayers.filter((p) => p.connected);

  // The match. `players` and `playMode` are frozen when it starts, so a phone
  // dropping off mid-game can't turn a phone match into a shared-screen one.
  const [players, setPlayers] = useState([]); // [{ name, playerId | null }]
  const [playMode, setPlayMode] = useState("local"); // local | phone
  const [game, setGame] = useState(null);
  const [wins, setWins] = useState([0, 0]);
  const [gameNo, setGameNo] = useState(1);
  const [ready, setReady] = useState([false, false]); // phones that tapped "next game"

  const target = Math.ceil(Number(bestOf) / 2);
  const seriesOver = seriesWinner(wins, target) !== null;

  // Everything the long-lived message listener and the turn clock need is read
  // through this ref, so neither is re-registered on every state change.
  const ref = useRef({});
  ref.current = { game, players, phase, playMode };

  const gameTimer = useGameTimer({
    onExpire: () => {
      const g = ref.current.game;
      if (g && g.winner === null) move(g.turn, pickFallbackColumn(g));
    }
  });

  // One entry point for every way a disc can be dropped (a tap on the board, a
  // phone, a number key, the turn clock). The ref is advanced immediately so a
  // second message arriving before React re-renders sees the new position.
  const move = useCallback((player, col) => {
    const st = ref.current;
    if (!st.game || st.phase !== "play") return;
    const next = dropDisc(st.game, player, col);
    if (next === st.game) return;
    ref.current = { ...st, game: next };
    setGame(next);
    if (next.winner === "draw") {
      playSound("incorrect");
    } else if (next.winner !== null) {
      playSound("bonus");
      setWins((w) => w.map((n, i) => (i === next.winner ? n + 1 : n)));
    } else {
      playSound("drop");
    }
  }, []);

  // ---------- phones ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const st = ref.current;
      const idx = st.players.findIndex((p) => p.playerId && p.playerId === msg.playerId);
      if (idx === -1 || st.phase !== "play") return;
      if (msg.kind === ACTION.DROP_DISC) move(idx, msg.payload?.col);
      else if (msg.kind === ACTION.READY && st.game && st.game.winner !== null) {
        setReady((r) => r.map((v, i) => (i === idx ? true : v)));
      }
    });
  }, [onMessage, move]);

  // Push every phone its own view; a third phone just watches.
  useEffect(() => {
    connected.forEach((sp) => {
      if (phase === "setup" || !game) {
        sendTo(sp.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the host to start." }));
        return;
      }
      const idx = players.findIndex((p) => p.playerId === sp.playerId);
      if (idx === -1 || playMode !== "phone") {
        sendTo(
          sp.playerId,
          viewMsg({
            view: VIEW.LOBBY,
            title: playMode === "phone" ? "Spectating" : "Watch the board",
            subtitle: playMode === "phone" ? "This match is already full — watch the big screen." : "This one is played on the big screen."
          })
        );
        return;
      }
      sendTo(
        sp.playerId,
        viewMsg({
          view: VIEW.CONNECT4,
          you: idx,
          names: players.map((p) => p.name),
          colours: DISC_HEX,
          myTurn: game.winner === null && game.turn === idx,
          board: encodeBoard(game.board),
          legal: legalColumns(game),
          lastMove: game.lastMove,
          line: game.line,
          winner: game.winner,
          wins,
          gameNo,
          target,
          seriesOver,
          ready: ready[idx]
        })
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, game, players, playMode, wins, gameNo, ready, sessionPlayers, sendTo]);

  // ---------- the turn clock ----------
  useEffect(() => {
    gameTimer.stop();
    if (phase !== "play" || !game || game.winner !== null) return;
    if (timerSetup.enabled) gameTimer.start(timerSetup.seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, game?.moves, game?.winner, gameNo]);

  // ---------- keyboard (shared-screen play) ----------
  useEffect(() => {
    if (phase !== "play" || playMode !== "local") return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= COLS) {
        const st = ref.current;
        if (st.game) move(st.game.turn, n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, playMode, move]);

  // ---------- match flow ----------
  function beginGame(first) {
    setGame(createGame({ first }));
    setGameNo((n) => n + 1);
    setReady([false, false]);
  }

  function nextGame() {
    if (!game || game.winner === null) return;
    beginGame(1 - game.first);
  }

  // Both phones tapping "ready" starts the next game without anyone having to
  // reach for the big screen.
  useEffect(() => {
    if (phase === "play" && game && game.winner !== null && !seriesOver && ready[0] && ready[1]) {
      setGame(createGame({ first: 1 - game.first }));
      setGameNo((n) => n + 1);
      setReady([false, false]);
    }
  }, [phase, game, seriesOver, ready]);

  function resetSeries(firstMover) {
    setWins([0, 0]);
    setGameNo(1);
    setReady([false, false]);
    setGame(createGame({ first: firstMover }));
    setPhase("play");
  }

  function startMatch() {
    const phones = connected.slice(0, 2);
    const mode = phones.length >= 2 ? "phone" : "local";
    setPlayers(
      mode === "phone"
        ? phones.map((p) => ({ name: p.name, playerId: p.playerId }))
        : localNames.map((n, i) => ({ name: n.trim() || `Player ${i + 1}`, playerId: null }))
    );
    setPlayMode(mode);
    resetSeries(0);
  }

  // Same two players, same seats — the other one opens the new series.
  function handleRematch() {
    resetSeries(1 - (game?.first ?? 0));
  }

  function handleNewMatch() {
    gameTimer.stop();
    setGame(null);
    setPhase("setup");
  }

  function seeResults() {
    gameTimer.stop();
    setPhase("over");
  }

  const nameOf = (i) => players[i]?.name || `Player ${i + 1}`;
  const ranked = players
    .map((p, i) => ({ name: p.name, score: wins[i] }))
    .sort((a, b) => b.score - a.score);
  const result = { ranked, winner: ranked[0] || null, shared: false, tiebreak: null };

  const turn = game?.turn ?? 0;
  const finished = game && game.winner !== null;
  const winnerIndex = finished && game.winner !== "draw" ? game.winner : null;
  const offline = players
    .map((p, i) => ({ ...p, i }))
    .filter((p) => p.playerId && !connected.some((c) => c.playerId === p.playerId));
  const turnOffline = playMode === "phone" && game && !finished && offline.some((p) => p.i === turn);

  const phoneCount = Math.min(2, connected.length);

  return (
    <GameShell title="CONNECT FOUR" titleIcon={CircleDot}>
      <Screen active={phase === "setup"}>
        <ScreenTitle>Connect Four</ScreenTitle>
        <ScreenSub>
          Drop discs, block your rival, and line up four before they do. Play on the shared screen —
          or pair two phones and each player drops from their own.
        </ScreenSub>

        <HowToPlay
          steps={[
            "Players take turns dropping a disc into one of the seven columns. It falls to the lowest free spot.",
            <>The first to line up <strong>four discs</strong> in a row — across, down or diagonally — wins the game.</>,
            "A full board with no line is a draw. Pick a series length for a proper showdown; the starting player swaps every game.",
            <>On the shared screen, <strong>tap a column</strong> or press <strong>1–7</strong>. With phones paired, the big screen just shows the board.</>,
            "Optional turn timer: if it runs out, a disc is dropped for you."
          ]}
        />

        <SetupBlock label="1. Series">
          <GroupedPicker groups={{ "Pick one": SERIES_ITEMS }} value={bestOf} onChange={setBestOf} />
        </SetupBlock>

        <SetupBlock label="2. Players">
          <div className={styles.namesGrid}>
            {[0, 1].map((i) => (
              <label key={i} className={styles.nameField}>
                <span className={i === 0 ? styles.disc0 : styles.disc1} aria-hidden="true" />
                <input
                  type="text"
                  className={styles.nameInput}
                  maxLength={16}
                  placeholder={`Player ${i + 1}`}
                  aria-label={`Player ${i + 1} name`}
                  value={localNames[i]}
                  onChange={(e) => setLocalNames((prev) => prev.map((n, k) => (k === i ? e.target.value : n)))}
                />
              </label>
            ))}
          </div>
          <p className={styles.modeNote}>
            {phoneCount >= 2
              ? "Two phones paired — the first two play from their phones. The names above are ignored."
              : phoneCount === 1
              ? "1 phone paired — pair one more to play on phones, or ignore it and play on this screen."
              : "No phones paired — you'll play on this screen, taking turns."}
          </p>
        </SetupBlock>

        <SetupBlock label="3. Phone controllers">
          <QRPairing
            session={session}
            teams={[]}
            description="Each player scans a QR code and drops discs from their own phone."
          />
          {connected.length > 0 && (
            <div className={styles.seatStrip}>
              {connected.map((p, i) => (
                <span key={p.playerId} className={styles.seatChip}>
                  <span className={i === 0 ? styles.disc0 : i === 1 ? styles.disc1 : ""} aria-hidden="true" />
                  {p.name}
                  {i > 1 ? " (watching)" : ""}
                </span>
              ))}
            </div>
          )}
        </SetupBlock>

        <SetupBlock label="4. Turn timer">
          <TimerSetup
            unitLabel="per move"
            recommended={20}
            presets={[10, 15, 20, 30]}
            enabled={timerSetup.enabled}
            onEnabledChange={timerSetup.setEnabled}
            seconds={timerSetup.seconds}
            onSecondsChange={timerSetup.setSeconds}
          />
        </SetupBlock>

        <Button onClick={startMatch}>
          Start <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
      </Screen>

      <Screen active={phase === "play"}>
        {game && (
          <div className={styles.stage}>
            <div className={styles.seriesBar}>
              <PlayerSide index={0} name={nameOf(0)} wins={wins[0]} target={target} active={!finished && turn === 0} />
              <div className={styles.midInfo}>
                <strong>Game {gameNo}</strong>
                {Number(bestOf) === 1 ? "Single game" : `First to ${target}`}
              </div>
              <PlayerSide index={1} name={nameOf(1)} wins={wins[1]} target={target} active={!finished && turn === 1} />
            </div>

            {finished ? (
              <p className={styles.banner} style={{ "--chip": winnerIndex !== null ? DISC_VAR[winnerIndex] : "var(--accent)" }}>
                {winnerIndex !== null ? `🏆 ${nameOf(winnerIndex)} wins${seriesOver ? " the match!" : " this game!"}` : "🤝 A draw — the board is full."}
              </p>
            ) : (
              <p className={styles.turnPill} style={{ "--chip": DISC_VAR[turn] }}>
                <span className={styles.chipDisc} />
                {nameOf(turn)}'s turn
                {playMode === "phone" && <span className={styles.turnDim}>· on their phone</span>}
              </p>
            )}

            {timerSetup.enabled && !finished && (
              <div className={styles.timerRow}>
                <GameTimer timer={gameTimer} showControls={false} />
              </div>
            )}

            <div className={styles.boardWrap}>
              <Board
                board={game.board}
                lastMove={game.lastMove}
                line={game.line}
                hoverPlayer={turn}
                legal={legalColumns(game)}
                onColumn={playMode === "local" && !finished ? (col) => move(game.turn, col) : undefined}
              />
            </div>

            {playMode === "phone" && (
              <OfflineBanner
                names={offline.map((p) => p.name)}
                waitingOn={turnOffline ? nameOf(turn) : null}
                onSkip={turnOffline ? () => move(turn, pickFallbackColumn(game)) : undefined}
                skipLabel="Play a move for them"
              />
            )}

            {playMode === "local" && !finished && (
              <p className={styles.keys}>
                Tap a column<span className={styles.kbHint}>, or press 1–7</span>.
              </p>
            )}

            <div className={styles.actions}>
              {finished &&
                (seriesOver ? (
                  <Button onClick={seeResults}>See results</Button>
                ) : (
                  <Button onClick={nextGame}>Next game <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} /></Button>
                ))}
              {finished && playMode === "phone" && !seriesOver && (
                <p className={styles.keys}>
                  Or both players tap Ready on their phones{ready[0] || ready[1] ? ` (${ready.filter(Boolean).length}/2)` : ""}.
                </p>
              )}
              <Button variant="secondary" onClick={handleNewMatch}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End match
              </Button>
            </div>
          </div>
        )}
      </Screen>

      <Screen active={phase === "over"}>
        <BigIcon>🏆</BigIcon>
        <ScreenTitle>{ranked[0] ? `${ranked[0].name} wins the match!` : "Match over"}</ScreenTitle>
        <ScreenSub>
          {Number(bestOf) === 1 ? "A single game, decided." : `Won the best of ${bestOf}.`}
        </ScreenSub>
        <ResultsList result={result} unit="wins" unitSingular="win" />
        <ButtonRow>
          <Button onClick={handleRematch}>Rematch</Button>
          <Button variant="secondary" onClick={handleNewMatch}>New Match</Button>
        </ButtonRow>
      </Screen>
    </GameShell>
  );
}

function PlayerSide({ index, name, wins, target, active }) {
  return (
    <div
      className={[styles.side, index === 1 ? styles.sideRight : "", active ? styles.sideActive : ""].filter(Boolean).join(" ")}
      style={{ "--chip": DISC_VAR[index] }}
    >
      <span className={styles.chipDisc} />
      <span className={styles.sideText}>
        <span className={styles.sideName}>{name}</span>
        <span className={styles.pips} role="img" aria-label={`${wins} of ${target} game wins`}>
          {Array.from({ length: target }, (_, k) => (
            <span key={k} className={`${styles.pip} ${k < wins ? styles.pipOn : ""}`.trim()} />
          ))}
        </span>
      </span>
    </div>
  );
}
