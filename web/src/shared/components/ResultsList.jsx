import { useEffect } from "react";
import { playSound } from "../audio/sounds";
import styles from "./results.module.css";

const MEDALS = ["🥇", "🥈", "🥉"];

// Final-scores screen. `result` is the { ranked, winner, shared, tiebreak }
// shape produced by utils/resolveStanding.js (+ TieBreakerScreen's callback
// for the tied case) — winner is matched by object identity against
// `ranked`, exactly like the original (see TieBreakerScreen.jsx's comment
// on why entrant objects are never cloned).
export function ResultsList({ result, unit = "pts", unitSingular, showSwatch = false }) {
  const { ranked, winner, shared, tiebreak } = result;

  // Final scores just came up — play the completion fanfare once. Every
  // game that ends on a <ResultsList> gets this for free.
  useEffect(() => {
    playSound("complete");
  }, []);

  return (
    <div>
      <div className={styles.list}>
        {ranked.map((entry, i) => (
          <div
            key={`${entry.name}-${i}`}
            className={`${styles.row} ${winner === entry ? styles.winner : ""}`.trim()}
          >
            <span className={styles.medal}>{MEDALS[i] || "🎗️"}</span>
            {showSwatch && entry.color && (
              <span className={styles.swatch} style={{ background: entry.color }} />
            )}
            <span className={styles.name}>{entry.name}</span>
            <span className={styles.score}>
              {entry.score} {entry.score === 1 && unitSingular ? unitSingular : unit}
            </span>
          </div>
        ))}
      </div>
      {tiebreak && (
        <p className={styles.footnote}>
          {shared
            ? "The tie held — the group agreed to share the win."
            : `Tie-breaker settled it in ${tiebreak.rounds} round${tiebreak.rounds === 1 ? "" : "s"}.`}
        </p>
      )}
    </div>
  );
}
