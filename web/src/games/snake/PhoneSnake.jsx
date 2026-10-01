import { useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { ACTION, action } from "../../shared/controller/protocol";
import styles from "./phoneSnake.module.css";

// How far a finger must travel before it counts as a swipe.
const SWIPE_PX = 22;

// A short tick on every turn. Feature-detected because iOS Safari has no
// vibration API at all, and a thrown error mid-game would be a real bug.
function tick() {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* haptics are a nicety */
  }
}

const KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right"
};

// The Snake steering screen. The host runs the whole game; this only reports
// which way to turn, as fast as it can — buttons fire on pointer*down* (not
// click) and a swipe anywhere on the pad works too, so steering never waits
// for a finger to lift. `view` is the SNAKE descriptor the host pushed.
export function PhoneSnake({ view, send }) {
  const startRef = useRef(null);
  const sendRef = useRef(send);
  sendRef.current = send;

  const turn = (dir) => {
    tick();
    sendRef.current(action(ACTION.TURN, { dir }));
  };

  // Keyboard, for anyone using a laptop as a controller.
  useEffect(() => {
    const onKey = (e) => {
      const dir = KEYS[e.key] || KEYS[e.key?.toLowerCase?.()];
      if (!dir) return;
      e.preventDefault();
      sendRef.current(action(ACTION.TURN, { dir }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e) => {
    startRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    const s = startRef.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    // Re-anchor so a long drag can chain several turns.
    startRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerEnd = () => {
    startRef.current = null;
  };

  const pressing = (dir) => ({
    onPointerDown: (e) => {
      e.stopPropagation(); // a tap on a key is a turn, not the start of a swipe
      turn(dir);
    }
  });

  let banner;
  let tone = "";
  if (view.status === "countdown") {
    banner = "Get ready…";
  } else if (view.status === "over") {
    banner = view.winner ? "You won! 🏆" : "Match over — check the big screen";
    tone = view.winner ? styles.good : "";
  } else if (!view.alive) {
    banner = view.respawnIn ? `💥 Crashed — back in ${view.respawnIn}s` : "💥 You crashed — watch the screen";
    tone = styles.bad;
  } else {
    banner = "Steer! Swipe or tap";
  }

  const live = view.status === "playing" && view.alive;

  return (
    <div className={styles.wrap} style={{ "--snake": view.colour || "var(--accent)" }}>
      <div className={styles.head}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.name}>{view.name}</span>
        <span className={styles.stats}>
          <strong>{view.length}</strong> long · <strong>{view.score}</strong> pts
        </span>
      </div>

      <p className={`${styles.banner} ${tone}`.trim()} role="status">
        {banner}
      </p>

      <div
        className={`${styles.pad} ${live ? "" : styles.padIdle}`.trim()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
        aria-label="Steering pad — swipe anywhere, or use the arrow keys"
      >
        <button type="button" className={`${styles.key} ${styles.up}`} aria-label="Turn up" {...pressing("up")}>
          <ArrowUp size={44} strokeWidth={3} />
        </button>
        <button type="button" className={`${styles.key} ${styles.left}`} aria-label="Turn left" {...pressing("left")}>
          <ArrowLeft size={44} strokeWidth={3} />
        </button>
        <span className={styles.hub} aria-hidden="true" />
        <button type="button" className={`${styles.key} ${styles.right}`} aria-label="Turn right" {...pressing("right")}>
          <ArrowRight size={44} strokeWidth={3} />
        </button>
        <button type="button" className={`${styles.key} ${styles.down}`} aria-label="Turn down" {...pressing("down")}>
          <ArrowDown size={44} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
