import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import styles from "./timer.module.css";

// In-game countdown HUD. Pass the object returned by hooks/useGameTimer.js.
// Rendered conditionally by the caller (e.g. only while a question/turn is
// active) — this replaces the original's imperative show()/hide().
export function GameTimer({ timer, showControls = true }) {
  const [paused, setPaused] = useState(false);

  const handlePause = () => {
    timer.pause();
    setPaused(true);
  };
  const handleResume = () => {
    timer.resume();
    setPaused(false);
  };
  const handleReset = () => {
    timer.reset();
    setPaused(false);
  };

  const stageClass = timer.stage === "urgent" ? styles.urgent : timer.stage === "warn" ? styles.warn : "";

  return (
    <div className={styles.mount}>
      <div className={`${styles.hud} ${stageClass}`.trim()}>
        <span>⏱️ {timer.remaining}s</span>
        {showControls && (
          <span className={styles.controls}>
            {!paused ? (
              <button type="button" className={styles.ctrl} aria-label="Pause timer" onClick={handlePause}>
                <Pause size={12} strokeWidth={2.5} />
              </button>
            ) : (
              <button type="button" className={styles.ctrl} aria-label="Resume timer" onClick={handleResume}>
                <Play size={12} strokeWidth={2.5} />
              </button>
            )}
            <button type="button" className={styles.ctrl} aria-label="Reset timer" onClick={handleReset}>
              <RotateCcw size={12} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
