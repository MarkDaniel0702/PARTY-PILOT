import { BOARD_SIZE, colLabel, rowLabel } from "./engine";
import styles from "./boardGrid.module.css";

// The one grid renderer for every Battleship board on the site — the TV's
// two fog-of-war panes, and a phone's own-fleet board and target board.
// It knows nothing about game rules: the caller hands it a `cellRenderer`
// that turns (row, col) into { content, className, ariaLabel, onClick }, so
// each context's very different cell logic (ship hulls vs. fog-of-war vs.
// tap-to-fire) never has to live in more than one place.
export function BoardGrid({ size = BOARD_SIZE, cellRenderer, ariaLabel, className = "" }) {
  const cols = Array.from({ length: size }, (_, i) => i);
  const rows = Array.from({ length: size }, (_, i) => i);

  return (
    <div
      className={`${styles.grid} ${className}`.trim()}
      style={{ "--size": size }}
      role="grid"
      aria-label={ariaLabel}
    >
      <span className={styles.corner} aria-hidden="true" />
      {cols.map((c) => (
        <span key={`h-${c}`} className={styles.colHead} aria-hidden="true">
          {colLabel(c)}
        </span>
      ))}
      {rows.flatMap((r) => [
        <span key={`r-${r}`} className={styles.rowHead} aria-hidden="true">
          {rowLabel(r)}
        </span>,
        ...cols.map((c) => {
          const info = cellRenderer(r, c) || {};
          const clickable = typeof info.onClick === "function";
          return (
            <button
              key={`c-${r}-${c}`}
              type="button"
              role="gridcell"
              className={`${styles.cell} ${info.className || ""}`.trim()}
              style={info.style}
              disabled={!clickable}
              onClick={clickable ? info.onClick : undefined}
              aria-label={info.ariaLabel || `${colLabel(c)}${rowLabel(r)}`}
            >
              {info.content}
            </button>
          );
        })
      ])}
    </div>
  );
}
