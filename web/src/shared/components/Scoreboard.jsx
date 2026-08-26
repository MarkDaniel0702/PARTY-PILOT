import styles from "./scoreboard.module.css";

// Live in-game score chips (name + running total), shown mid-session before
// final ranking is known. Ports party.css's .scoreboard/.score-chip.
export function Scoreboard({ entries }) {
  return (
    <div className={styles.board}>
      {entries.map((e, i) => (
        <div className={styles.chip} key={i}>
          <span className={styles.name}>{e.name}</span>
          <span className={styles.value}>{e.score}</span>
        </div>
      ))}
    </div>
  );
}
