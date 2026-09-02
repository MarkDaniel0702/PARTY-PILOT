import { useCallback, useEffect, useRef, useState } from "react";
import { BoardView, PiecePreview } from "./BoardView";
import {
  createGame,
  move,
  rotate,
  softDrop,
  hardDrop,
  holdPiece,
  stepGravity,
  queueGarbage,
  snapshot,
  nextQueue,
  dropIntervalMs
} from "./engine";
import styles from "./tetris.module.css";

// The board runs *here*, on the player's own phone.
//
// That's the whole point of the architecture: your eyes are on this screen,
// so input and response never cross the network and the game feels instant
// regardless of Wi-Fi. The host only receives snapshots to draw on the TV,
// and latency there is harmless because nobody is playing off the TV.
//
// Auto-repeat (DAS/ARR) is handled locally too, so a dropped packet can
// never turn a held direction into a stutter.
const DAS_MS = 170; // delay before a held direction starts repeating
const ARR_MS = 45; // repeat interval once it does
const SNAPSHOT_MS = 80; // ~12 board updates a second to the TV

// A short tick on a hard drop. Feature-detected because iOS Safari has no
// vibration API at all, and a thrown error mid-drop would be a real bug.
function thud() {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* nothing to do — haptics are a nicety */
  }
}

export function PhoneTetris({ seed, mode, colour, garbageEvent, onState, onGarbage, onOver }) {
  const [game, setGame] = useState(() => createGame({ seed, mode }));
  const gameRef = useRef(game);
  gameRef.current = game;

  const repeatRef = useRef(null);
  const sentGarbageRef = useRef(0);
  const overSentRef = useRef(false);

  const apply = useCallback((fn) => {
    setGame((g) => (g.over ? g : fn(g)));
  }, []);

  // Gravity, re-armed whenever the level changes so the speed curve applies.
  useEffect(() => {
    if (game.over) return undefined;
    const id = setInterval(() => setGame((g) => (g.over ? g : stepGravity(g))), dropIntervalMs(game.level));
    return () => clearInterval(id);
  }, [game.level, game.over]);

  // Stream snapshots to the host for the TV.
  useEffect(() => {
    const id = setInterval(() => {
      const g = gameRef.current;
      onState?.(snapshot(g));
    }, SNAPSHOT_MS);
    return () => clearInterval(id);
  }, [onState]);

  // Report garbage as it's generated, and the top-out exactly once.
  useEffect(() => {
    if (game.garbageSent > sentGarbageRef.current) {
      const rows = game.garbageSent - sentGarbageRef.current;
      sentGarbageRef.current = game.garbageSent;
      onGarbage?.(rows);
    }
  }, [game.garbageSent, onGarbage]);

  useEffect(() => {
    if (game.over && !overSentRef.current) {
      overSentRef.current = true;
      onState?.(snapshot(game));
      onOver?.({ score: game.score, lines: game.lines });
    }
  }, [game.over, game.score, game.lines, onState, onOver]);

  // Garbage sent by an opponent. Queued rather than applied immediately —
  // it only lands once the current piece locks, which is what gives you a
  // chance to cancel it with a clear of your own.
  useEffect(() => {
    if (!garbageEvent || !garbageEvent.rows) return;
    setGame((g) => (g.over ? g : queueGarbage(g, garbageEvent.rows)));
  }, [garbageEvent]);

  const stopRepeat = useCallback(() => {
    if (repeatRef.current) {
      clearTimeout(repeatRef.current.delay);
      clearInterval(repeatRef.current.timer);
      repeatRef.current = null;
    }
  }, []);

  const startRepeat = useCallback(
    (dir) => {
      stopRepeat();
      apply((g) => move(g, dir));
      const delay = setTimeout(() => {
        const timer = setInterval(() => apply((g) => move(g, dir)), ARR_MS);
        repeatRef.current = { delay, timer };
      }, DAS_MS);
      repeatRef.current = { delay, timer: null };
    },
    [apply, stopRepeat]
  );

  useEffect(() => stopRepeat, [stopRepeat]);

  // Physical keyboards work too, for anyone pairing a laptop.
  useEffect(() => {
    const down = (e) => {
      const k = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "Shift"].includes(k)) e.preventDefault();
      if (k === "ArrowLeft") apply((g) => move(g, -1));
      else if (k === "ArrowRight") apply((g) => move(g, 1));
      else if (k === "ArrowDown") apply(softDrop);
      else if (k === "ArrowUp" || k === "x") apply((g) => rotate(g, 1));
      else if (k === "z") apply((g) => rotate(g, -1));
      else if (k === " ") apply(hardDrop);
      else if (k === "Shift" || k === "c") apply(holdPiece);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [apply]);

  const snap = snapshot(game);
  const queue = nextQueue(game, 3);

  const hold = (dir) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      startRepeat(dir);
    },
    onPointerUp: stopRepeat,
    onPointerCancel: stopRepeat,
    onPointerLeave: stopRepeat
  });

  return (
    <div className={styles.phoneWrap} style={colour ? { "--seat": colour } : undefined}>
      <div className={styles.phoneStats}>
        <span className={styles.phoneScore}>{game.score}</span>
        <span className={styles.phoneLines}>{game.lines} lines · lv {game.level}</span>
        {game.pendingGarbage > 0 && <span className={styles.incoming}>▲ {game.pendingGarbage}</span>}
      </div>

      <div className={styles.phoneBoardRow}>
        <BoardView
          cells={snap.cells}
          piece={snap.piece}
          dimmed={game.over}
          label="Your board"
          className={styles.phoneBoard}
        />
        {/* Hold and the queue as actual shapes: a bare letter is a lookup
            table, and you don't have time for one mid-drop. */}
        <div className={styles.phoneRail}>
          <span className={styles.metaLabel}>Hold</span>
          <PiecePreview type={game.hold} size={28} faded={!game.canHold} />
          <span className={styles.metaLabel}>Next</span>
          {queue.map((t, i) => (
            <PiecePreview key={i} type={t} size={i === 0 ? 28 : 22} />
          ))}
        </div>
      </div>

      {game.over ? (
        <p className={styles.phoneOver}>Topped out — watch the big screen!</p>
      ) : (
        <div className={styles.pad}>
          <button type="button" className={styles.padBtn} aria-label="Move left" {...hold(-1)}>
            ←
          </button>
          <button
            type="button"
            className={styles.padBtn}
            aria-label="Rotate"
            onPointerDown={(e) => {
              e.preventDefault();
              apply((g) => rotate(g, 1));
            }}
          >
            ⟳
          </button>
          <button type="button" className={styles.padBtn} aria-label="Move right" {...hold(1)}>
            →
          </button>
          <button
            type="button"
            className={styles.padBtn}
            aria-label="Hold piece"
            onPointerDown={(e) => {
              e.preventDefault();
              apply(holdPiece);
            }}
          >
            <span className={styles.padWord}>HOLD</span>
          </button>
          <button
            type="button"
            className={styles.padBtn}
            aria-label="Soft drop"
            onPointerDown={(e) => {
              e.preventDefault();
              apply(softDrop);
            }}
          >
            ↓
            <span className={styles.padSub}>Soft</span>
          </button>
          <button
            type="button"
            className={`${styles.padBtn} ${styles.padDrop}`}
            aria-label="Hard drop"
            onPointerDown={(e) => {
              e.preventDefault();
              thud();
              apply(hardDrop);
            }}
          >
            DROP
            <span className={styles.padSub}>Hard</span>
          </button>
        </div>
      )}
    </div>
  );
}

export { queueGarbage };
