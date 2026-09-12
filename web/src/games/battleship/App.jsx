import { useEffect, useRef, useState } from "react";
import { Anchor, Flag, ArrowRight, Crosshair } from "lucide-react";
import { GameShell } from "../../shared/components/GameShell";
import { Screen, ScreenTitle, ScreenSub, SetupBlock } from "../../shared/components/Screen";
import { HowToPlay } from "../../shared/components/HowToPlay";
import { Button, ButtonRow } from "../../shared/components/Button";
import { QRPairing } from "../../shared/components/QRPairing";
import { ResultsList } from "../../shared/components/ResultsList";
import { useHostSession } from "../../shared/controller/useHostSession";
import { VIEW, MSG, ACTION, view as viewMsg } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { BoardGrid } from "./BoardGrid";
import {
  BOARD_SIZE,
  SHIP_DEFS,
  HIT_POINTS,
  SINK_BONUS,
  WIN_BONUS,
  createMatch,
  placeShip,
  removeShip,
  randomizeFleet,
  isFleetComplete,
  confirmFleet,
  fireAt,
  ownBoardView,
  publicBoardView,
  opponentIndexOf,
  shipDef,
  cellLabel
} from "./engine";
import gridStyles from "./boardGrid.module.css";
import styles from "./battleship.module.css";

const IMPACT_MS = 900;
const BANNER_MS = 2600;

export default function App() {
  const [match, setMatch] = useState(null);
  const [impact, setImpact] = useState(null); // { playerIndex, row, col, key }
  const [banner, setBanner] = useState(null); // { text, kind, key }

  const session = useHostSession([]);
  const { onMessage, sendTo, players: sessionPlayers } = session;

  const screen = !match ? "setup" : match.phase; // setup | placement | battle | over
  const connected = sessionPlayers.filter((p) => p.connected);
  const canStart = connected.length >= 2;

  const ref = useRef();
  ref.current = { match };

  // ---------- phone actions -> engine ----------
  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type !== MSG.ACTION) return;
      const m = ref.current.match;
      if (!m) return;
      const playerIndex = m.players.findIndex((p) => p.playerId === msg.playerId);
      if (playerIndex === -1) return;
      const payload = msg.payload || {};

      if (msg.kind === ACTION.PLACE_SHIP) {
        const res = placeShip(m, playerIndex, payload.shipId, payload.row, payload.col, payload.orientation);
        if (res.ok) setMatch(res.match);
        return;
      }
      if (msg.kind === ACTION.REMOVE_SHIP) {
        const res = removeShip(m, playerIndex, payload.shipId);
        if (res.ok) setMatch(res.match);
        return;
      }
      if (msg.kind === ACTION.RANDOM_FLEET) {
        const res = randomizeFleet(m, playerIndex);
        if (res.ok) setMatch(res.match);
        return;
      }
      if (msg.kind === ACTION.CONFIRM_FLEET) {
        const res = confirmFleet(m, playerIndex);
        if (!res.ok) return;
        if (res.match.phase === "battle" && m.phase !== "battle") playSound("complete");
        setMatch(res.match);
        return;
      }
      if (msg.kind === ACTION.FIRE) {
        const res = fireAt(m, playerIndex, payload.row, payload.col);
        if (!res.ok) return;
        const shot = res.match.lastShot;
        playSound(shot.result === "hit" ? (shot.sunk ? "bonus" : "correct") : "incorrect");
        setMatch(res.match);
      }
    });
  }, [onMessage]);

  // ---------- push a view to every connected phone ----------
  useEffect(() => {
    connected.forEach((sp) => {
      if (!match) {
        sendTo(sp.playerId, viewMsg({ view: VIEW.LOBBY, title: "You're in!", subtitle: "Waiting for the other captain." }));
        return;
      }
      const idx = match.players.findIndex((p) => p.playerId === sp.playerId);
      if (idx === -1) {
        sendTo(
          sp.playerId,
          viewMsg({ view: VIEW.LOBBY, title: "Spectating", subtitle: "This battle's already crewed — watch the big screen." })
        );
        return;
      }
      const me = match.players[idx];
      const opp = match.players[opponentIndexOf(idx)];

      if (match.phase === "placement") {
        if (me.ready) {
          sendTo(
            sp.playerId,
            viewMsg({ view: VIEW.WAIT, title: "Fleet ready ⚓", subtitle: `Waiting for ${opp.name} to finish placing ships…` })
          );
        } else {
          sendTo(
            sp.playerId,
            viewMsg({
              view: VIEW.PLACEMENT,
              title: "Place your fleet",
              ships: SHIP_DEFS,
              placed: me.fleet.map((s) => ({ shipId: s.shipId, cells: s.cells })),
              allPlaced: isFleetComplete(me)
            })
          );
        }
        return;
      }

      if (match.phase === "battle") {
        sendTo(
          sp.playerId,
          viewMsg({
            view: VIEW.BATTLE,
            myTurn: match.turnIndex === idx,
            opponentName: opp.name,
            own: ownBoardView(me),
            target: publicBoardView(opp),
            scores: { me: me.score, opponent: opp.score },
            lastShot: match.lastShot
              ? {
                  row: match.lastShot.row,
                  col: match.lastShot.col,
                  result: match.lastShot.result,
                  sunk: match.lastShot.sunk,
                  shipName: match.lastShot.shipId ? shipDef(match.lastShot.shipId)?.name : null,
                  mine: match.lastShot.by === idx
                }
              : null
          })
        );
        return;
      }

      if (match.phase === "over") {
        const won = match.winnerIndex === idx;
        sendTo(
          sp.playerId,
          viewMsg({ view: VIEW.WAIT, title: won ? "Victory! 🏆" : "Defeat", subtitle: "Check the big screen for final scores." })
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match, sessionPlayers, sendTo]);

  // ---------- TV impact flash + banner, keyed off match.lastShot ----------
  const lastShotKeyRef = useRef(null);
  useEffect(() => {
    if (!match || match.phase === "placement" || !match.lastShot) return undefined;
    const shot = match.lastShot;
    const shotKey = `${shot.by}-${shot.row}-${shot.col}`;
    if (lastShotKeyRef.current === shotKey) return undefined;
    lastShotKeyRef.current = shotKey;

    const attacker = match.players[shot.by];
    const defender = match.players[opponentIndexOf(shot.by)];
    const text = shot.sunk
      ? `${attacker.name} sank ${defender.name}'s ${shipDef(shot.shipId)?.name}!`
      : shot.result === "hit"
      ? `${attacker.name} hit ${defender.name}'s waters at ${cellLabel(shot.row, shot.col)}!`
      : `${attacker.name} missed at ${cellLabel(shot.row, shot.col)}.`;

    setImpact({ playerIndex: opponentIndexOf(shot.by), row: shot.row, col: shot.col, key: shotKey });
    setBanner({ text, kind: shot.result, key: shotKey });
    const t1 = setTimeout(() => setImpact(null), IMPACT_MS);
    const t2 = setTimeout(() => setBanner(null), BANNER_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [match]);

  function handleStart() {
    const two = connected.slice(0, 2);
    if (two.length < 2) return;
    setMatch(createMatch(two.map((p) => ({ playerId: p.playerId, name: p.name }))));
    setImpact(null);
    setBanner(null);
    lastShotKeyRef.current = null;
  }

  function handleRematch() {
    if (!match) return;
    setMatch(createMatch(match.players.map((p) => ({ playerId: p.playerId, name: p.name }))));
    setImpact(null);
    setBanner(null);
    lastShotKeyRef.current = null;
  }

  function handleNewGame() {
    setMatch(null);
    setImpact(null);
    setBanner(null);
  }

  function fleetCellRenderer(view, row, col) {
    const cell = view.cells[row * BOARD_SIZE + col];
    let className = gridStyles.water;
    let content = "";
    if (cell.shot === "hit") {
      className = cell.sunk ? gridStyles.sunk : gridStyles.hit;
      content = cell.sunk ? "☠️" : "🔥";
    } else if (cell.shot === "miss") {
      className = gridStyles.miss;
      content = "•";
    }
    return { className, content, ariaLabel: `${cellLabel(row, col)}${cell.shot ? `, ${cell.shot}` : ""}` };
  }

  function revealCellRenderer(view, row, col) {
    const cell = view.cells[row * BOARD_SIZE + col];
    let className = gridStyles.water;
    let content = "";
    let style;
    if (cell.shipId) {
      const def = shipDef(cell.shipId);
      className = gridStyles.ship;
      content = def?.emoji || "🚢";
      style = def ? { "--ship": def.color } : undefined;
    }
    if (cell.shot === "hit") {
      className = cell.sunk ? gridStyles.sunk : gridStyles.hit;
      content = cell.sunk ? "☠️" : "🔥";
    } else if (cell.shot === "miss") {
      className = gridStyles.miss;
      content = "•";
    }
    return { className, style, content, ariaLabel: cellLabel(row, col) };
  }

  const attackerIdx = match?.turnIndex ?? null;
  const defenderIdx = attackerIdx !== null ? opponentIndexOf(attackerIdx) : null;

  // Only meaningful once match.phase === "over" — winnerIndex is null the
  // rest of the time, so these stay null rather than indexing players[null].
  const winner = match?.winnerIndex != null ? match.players[match.winnerIndex] : null;
  const loser = match?.winnerIndex != null ? match.players[opponentIndexOf(match.winnerIndex)] : null;
  const ranked = winner && loser ? [{ name: winner.name, score: winner.score }, { name: loser.name, score: loser.score }] : [];
  const result = { ranked, winner: ranked[0] || null, shared: false, tiebreak: null };

  return (
    <GameShell title="BATTLESHIP" titleIcon={Anchor}>
      <Screen active={screen === "setup"}>
        <ScreenTitle>Battleship</ScreenTitle>
        <ScreenSub>
          Classic naval combat for two captains. Deploy your fleet in private on your phone, then take
          turns calling shots at the enemy waters shown up here.
        </ScreenSub>

        <HowToPlay
          steps={[
            "Two captains pair a phone — that's where your fleet lives, and no one else ever sees it.",
            <>Each captain secretly places <strong>5 ships</strong> (Carrier, Battleship, Cruiser, Submarine, Destroyer) on a 10×10 board.</>,
            "Once both fleets are confirmed, captains alternate calling a shot on their phone.",
            "This screen shows both waters as fog of war — hits and misses only. A ship's full outline only appears once every one of its cells has been hit.",
            <>Hits score <strong>{HIT_POINTS} pts</strong>, sinking a ship adds a <strong>{SINK_BONUS} pt</strong> bonus, and the winner banks a <strong>{WIN_BONUS} pt</strong> victory bonus.</>,
            "Sink the enemy's whole fleet first to win."
          ]}
        />

        <SetupBlock label="Phone controllers" wide>
          <QRPairing session={session} teams={[]} />
          {connected.length > 0 && (
            <div className={styles.seatStrip}>
              {connected.slice(0, 2).map((p) => (
                <span key={p.playerId} className={styles.seatChip}>
                  <Anchor size={13} strokeWidth={2.5} /> {p.name}
                </span>
              ))}
            </div>
          )}
          <p className={styles.modeNote}>
            {connected.length === 0
              ? "Both captains need a phone for this one — pair exactly 2."
              : connected.length === 1
              ? "1 paired — waiting on a second captain."
              : connected.length > 2
              ? "Ready — first 2 play, extra phones can spectate."
              : "Ready — tap Start Battle."}
          </p>
        </SetupBlock>

        <Button disabled={!canStart} onClick={handleStart}>
          Start Battle <ArrowRight size={15} strokeWidth={2.5} style={{ verticalAlign: "-0.15em" }} />
        </Button>
      </Screen>

      <Screen active={screen === "placement"}>
        {match && (
          <>
            <ScreenTitle>Deploying fleets…</ScreenTitle>
            <ScreenSub>Both captains are placing ships privately on their phones.</ScreenSub>
            <div className={styles.placementCards}>
              {match.players.map((p, i) => (
                <div key={p.playerId} className={`${styles.placementCard} ${p.ready ? styles.placementReady : ""}`.trim()}>
                  <span className={styles.placementName}>{p.name}</span>
                  <div className={styles.shipDots}>
                    {SHIP_DEFS.map((def) => (
                      <span
                        key={def.id}
                        className={styles.shipDot}
                        style={{ "--ship": def.color }}
                        data-filled={p.fleet.some((s) => s.shipId === def.id)}
                        title={def.name}
                      />
                    ))}
                  </div>
                  <span className={styles.placementStatus}>
                    {p.ready ? "✓ Fleet ready" : `${p.fleet.length}/${SHIP_DEFS.length} ships placed`}
                  </span>
                </div>
              ))}
            </div>
            <ButtonRow cols={1}>
              <Button variant="secondary" onClick={handleNewGame}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> Cancel
              </Button>
            </ButtonRow>
          </>
        )}
      </Screen>

      <Screen active={screen === "battle"}>
        {match && (
          <>
            <div className={styles.turnBar}>
              <Crosshair size={16} strokeWidth={2.5} aria-hidden="true" />
              <span>
                <strong>{match.players[attackerIdx].name}</strong>'s turn — targeting{" "}
                <strong>{match.players[defenderIdx].name}</strong>'s waters
              </span>
            </div>

            {banner && (
              <p key={banner.key} className={`${styles.shotBanner} ${banner.kind === "hit" ? styles.shotHit : styles.shotMiss}`.trim()}>
                {banner.text}
              </p>
            )}

            <div className={styles.boardsRow}>
              {match.players.map((p, i) => {
                const view = publicBoardView(p);
                return (
                  <div key={p.playerId} className={`${styles.boardCol} ${i === defenderIdx ? styles.boardTargeted : ""}`.trim()}>
                    <div className={styles.boardHead}>
                      <span className={styles.boardName}>{p.name}'s Waters</span>
                      <span className={styles.boardShipsLeft}>
                        {SHIP_DEFS.length - view.sunkCount}/{SHIP_DEFS.length} ships afloat
                      </span>
                    </div>
                    <BoardGrid
                      ariaLabel={`${p.name}'s waters`}
                      cellRenderer={(r, c) => {
                        const info = fleetCellRenderer(view, r, c);
                        if (impact && impact.playerIndex === i && impact.row === r && impact.col === c) {
                          info.className = `${info.className} ${gridStyles.justFired}`.trim();
                        }
                        return info;
                      }}
                    />
                    <span className={styles.boardScore}>{p.score} pts</span>
                  </div>
                );
              })}
            </div>

            <ButtonRow cols={1}>
              <Button variant="secondary" onClick={handleNewGame}>
                <Flag size={14} strokeWidth={2.5} style={{ verticalAlign: "-0.1em" }} /> End battle
              </Button>
            </ButtonRow>
          </>
        )}
      </Screen>

      <Screen active={screen === "over"}>
        {match && winner && loser && (
          <>
            <span className={styles.winnerEmoji}>🏆</span>
            <ScreenTitle>{winner.name} wins!</ScreenTitle>
            <ScreenSub>Every ship in {loser.name}'s fleet was sunk.</ScreenSub>

            <ResultsList result={result} unit="pts" />

            <div className={styles.boardsRow}>
              {match.players.map((p, i) => {
                const view = ownBoardView(p);
                return (
                  <div key={p.playerId} className={styles.boardCol}>
                    <div className={styles.boardHead}>
                      <span className={styles.boardName}>
                        {p.name}'s Fleet {i === match.winnerIndex ? "👑" : ""}
                      </span>
                    </div>
                    <BoardGrid ariaLabel={`${p.name}'s revealed fleet`} cellRenderer={(r, c) => revealCellRenderer(view, r, c)} />
                  </div>
                );
              })}
            </div>

            <ButtonRow>
              <Button onClick={handleRematch}>Rematch</Button>
              <Button variant="secondary" onClick={handleNewGame}>New Battle</Button>
            </ButtonRow>
          </>
        )}
      </Screen>
    </GameShell>
  );
}
