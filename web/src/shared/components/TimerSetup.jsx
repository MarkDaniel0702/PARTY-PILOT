import { useMemo } from "react";
import styles from "./timer.module.css";

// Ports createTimerSetup(): on/off switch + preset chips + custom input.
// Pair with hooks/useTimerSetup.js.
export function TimerSetup({ unitLabel, recommended, presets, enabled, onEnabledChange, seconds, onSecondsChange }) {
  const presetList = useMemo(() => {
    const list = presets && presets.length ? presets : [recommended];
    return list.filter((v, i, a) => a.indexOf(v) === i);
  }, [presets, recommended]);

  return (
    <div className={styles.setup}>
      <div className={styles.setupHead}>
        <label className={styles.switch}>
          <input type="checkbox" checked={enabled} onChange={(e) => onEnabledChange(e.target.checked)} />
          <span className={styles.track}>
            <span className={styles.thumb} />
          </span>
          <span className={styles.switchLabel}>⏱️ Timer</span>
        </label>
        <span className={styles.recommended}>
          Recommended: {recommended}s {unitLabel}
        </span>
      </div>
      {enabled && (
        <div className={styles.body}>
          <div className={styles.presets}>
            {presetList.map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.preset} ${p === seconds ? styles.selected : ""}`.trim()}
                onClick={() => onSecondsChange(p)}
              >
                {p}s
              </button>
            ))}
          </div>
          <label className={styles.custom}>
            Custom
            <input
              type="number"
              className={styles.customInput}
              min={5}
              max={600}
              step={5}
              value={seconds}
              onChange={(e) => e.target.value !== "" && onSecondsChange(Number(e.target.value))}
            />
            <span>seconds</span>
          </label>
        </div>
      )}
    </div>
  );
}
