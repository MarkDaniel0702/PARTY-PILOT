import { COLS, cellIndex } from "./engine";
import styles from "./connect4.module.css";

// The two players' disc colours. DISC_VAR follows the page theme and is what
// the host screen uses; DISC_HEX is sent to phones, whose page doesn't define
// the game's palette, and handed back to <Board colours> so both look alike.
export const DISC_VAR = ["var(--p0)", "var(--p1)"];
export const DISC_HEX = ["#ff4d5e", "#ffd23f"];

// The one board renderer — the TV's big board and the phone's miniature are
// the same component, sized by whatever container they sit in.
//
// Three stacked layers keep the drop animation honest: the discs sit at the
// back, a blue "face" with circular holes cut in it sits in front of them, and
// a row of column buttons sits on top. A falling disc therefore really does
// pass behind the board and show through the holes on the way down.
//
// `onColumn` makes the columns tappable; `legal` greys out full ones. Leave
// `onColumn` off for a read-only board (the TV while players use phones).
export function Board({
  board,
  lastMove = null,
  line = null,
  onColumn,
  legal,
  disabled = false,
  hoverPlayer = 0,
  colours = null,
  className = "",
  label = "Connect Four board"
}) {
  const winning = new Set((line || []).map(([r, c]) => cellIndex(r, c)));
  const legalSet = legal ? new Set(legal) : null;

  return (
    <div
      className={`${styles.board} ${className}`.trim()}
      style={{
        "--ghost": hoverPlayer === 1 ? "var(--p1, #ffd23f)" : "var(--p0, #ff4d5e)",
        ...(colours ? { "--p0": colours[0], "--p1": colours[1] } : null)
      }}
      role="group"
      aria-label={label}
    >
      <div className={styles.discs}>
        {board.map((owner, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const isNew = !!lastMove && lastMove.row === row && lastMove.col === col;
          return (
            <span key={i} className={styles.slot}>
              {owner !== null && (
                <span
                  // Keyed on the move so a rematch's first disc in the same
                  // cell as the last game's remounts and animates again.
                  key={isNew ? `new-${lastMove.row}-${lastMove.col}-${lastMove.player}` : "old"}
                  className={[
                    styles.disc,
                    owner === 0 ? styles.p0 : styles.p1,
                    isNew ? styles.drop : "",
                    winning.has(i) ? styles.win : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={isNew ? { "--row": row } : undefined}
                />
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.face} aria-hidden="true" />

      {onColumn && (
        <div className={styles.columns}>
          {Array.from({ length: COLS }, (_, col) => (
            <button
              key={col}
              type="button"
              className={styles.column}
              disabled={disabled || (legalSet ? !legalSet.has(col) : false)}
              aria-label={`Drop a disc in column ${col + 1} of ${COLS}`}
              onClick={() => onColumn(col)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
