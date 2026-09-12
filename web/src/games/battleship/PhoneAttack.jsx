import { useEffect, useRef, useState } from "react";
import { Crosshair, Shield } from "lucide-react";
import { BoardGrid } from "./BoardGrid";
import { ACTION, action } from "../../shared/controller/protocol";
import { playSound } from "../../shared/audio/sounds";
import { BOARD_SIZE, cellLabel, shipDef } from "./engine";
import gridStyles from "./boardGrid.module.css";
import styles from "./phoneBattleship.module.css";

function targetCellInfo(target, row, col, canFire, onFire) {
  const cell = target.cells[row * BOARD_SIZE + col];
  let className = gridStyles.water;
  let content = "";
  if (cell.shot === "hit") {
    className = cell.sunk ? gridStyles.sunk : gridStyles.hit;
    content = cell.sunk ? "☠️" : "🔥";
  } else if (cell.shot === "miss") {
    className = gridStyles.miss;
    content = "•";
  }
  const clickable = canFire && !cell.shot;
  return {
    className,
    content,
    ariaLabel: `${cellLabel(row, col)}${cell.shot ? `, ${cell.shot}` : ""}`,
    onClick: clickable ? () => onFire(row, col) : undefined
  };
}

function ownCellInfo(own, row, col) {
  const cell = own.cells[row * BOARD_SIZE + col];
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
  return {
    className,
    style,
    content,
    ariaLabel: `${cellLabel(row, col)}${cell.shipId ? `, ${shipDef(cell.shipId)?.name}` : ""}${
      cell.shot ? `, ${cell.shot}` : ""
    }`
  };
}

// The battle-phase screen: a tab switches between the interactive target
// grid (only tappable on your turn) and a read-only view of your own fleet,
// so waiting for the other captain still lets you check what they've hit.
export function PhoneAttack({ view, send }) {
  const [tab, setTab] = useState(view.myTurn ? "attack" : "fleet");
  const [flash, setFlash] = useState(null);
  const seenShotRef = useRef(null);

  useEffect(() => {
    setTab(view.myTurn ? "attack" : "fleet");
  }, [view.myTurn]);

  useEffect(() => {
    const shot = view.lastShot;
    if (!shot) return undefined;
    const shotKey = `${shot.row}-${shot.col}-${shot.mine}`;
    if (seenShotRef.current === shotKey) return undefined;
    seenShotRef.current = shotKey;

    const text = shot.mine
      ? shot.sunk
        ? `You sank their ${shot.shipName}!`
        : shot.result === "hit"
        ? "Direct hit!"
        : "Miss."
      : shot.sunk
      ? `They sank your ${shot.shipName}!`
      : shot.result === "hit"
      ? "You've been hit!"
      : `${view.opponentName || "They"} missed.`;

    playSound(shot.result === "hit" ? (shot.sunk ? "bonus" : "correct") : "incorrect");
    setFlash({ text, kind: shot.result });
    const t = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.lastShot]);

  function handleFire(row, col) {
    if (!view.myTurn) return;
    send(action(ACTION.FIRE, { row, col }));
  }

  return (
    <div className={styles.attackWrap}>
      <p className={styles.lead}>
        {view.myTurn ? "Your turn — Fire!" : `Waiting for ${view.opponentName || "the other captain"}…`}
      </p>
      {flash && (
        <p className={`${styles.flashLine} ${flash.kind === "hit" ? styles.flashHit : styles.flashMiss}`.trim()}>
          {flash.text}
        </p>
      )}

      <div className={styles.scoreRow}>
        <span className={styles.scoreChip}>You: {view.scores?.me ?? 0}</span>
        <span className={styles.scoreChip}>{view.opponentName || "Opponent"}: {view.scores?.opponent ?? 0}</span>
      </div>

      <div className={styles.tabRow}>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === "attack" ? styles.tabOn : ""}`.trim()}
          onClick={() => setTab("attack")}
        >
          <Crosshair size={14} strokeWidth={2.5} /> Attack
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${tab === "fleet" ? styles.tabOn : ""}`.trim()}
          onClick={() => setTab("fleet")}
        >
          <Shield size={14} strokeWidth={2.5} /> My Fleet
        </button>
      </div>

      {tab === "attack" ? (
        <>
          <p className={styles.sub}>
            {view.myTurn ? `Tap a cell in ${view.opponentName ? `${view.opponentName}'s` : "their"} waters.` : "Watching — not your turn."}
          </p>
          <BoardGrid
            ariaLabel={`${view.opponentName || "Opponent"}'s waters`}
            cellRenderer={(r, c) => targetCellInfo(view.target, r, c, view.myTurn, handleFire)}
          />
        </>
      ) : (
        <>
          <p className={styles.sub}>Your ships — hits from {view.opponentName || "them"} show here.</p>
          <BoardGrid ariaLabel="Your fleet" cellRenderer={(r, c) => ownCellInfo(view.own, r, c)} />
        </>
      )}
    </div>
  );
}
