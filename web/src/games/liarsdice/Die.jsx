import styles from "./die.module.css";

// Pip positions on a 3x3 grid, numbered 1-9 left to right, top to bottom.
const PIPS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
};

// One die. `hidden` draws the back of a die (nobody else's dice are ever shown
// face up until a challenge); `mark` tints a die in the reveal — "match" for a
// die that counts towards the bid, "wild" for a one that counts as a wild.
export function Die({ value, size = "md", hidden = false, mark = null, rolling = false, dim = false, className = "" }) {
  const cls = [
    styles.die,
    styles[size],
    hidden ? styles.hidden : "",
    mark === "match" ? styles.match : "",
    mark === "wild" ? styles.wild : "",
    rolling ? styles.rolling : "",
    dim ? styles.dim : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} role="img" aria-label={hidden ? "a hidden die" : `a die showing ${value}`}>
      {!hidden &&
        (PIPS[value] || []).map((pos) => (
          <span
            key={pos}
            className={styles.pip}
            style={{ gridRow: Math.ceil(pos / 3), gridColumn: ((pos - 1) % 3) + 1 }}
          />
        ))}
    </span>
  );
}

// A little row of face-down dice — a seat's remaining dice, count only.
export function DiceBack({ count, size = "sm" }) {
  return (
    <span className={styles.row} aria-label={`${count} ${count === 1 ? "die" : "dice"}`} role="img">
      {Array.from({ length: count }, (_, i) => (
        <Die key={i} hidden size={size} />
      ))}
    </span>
  );
}
