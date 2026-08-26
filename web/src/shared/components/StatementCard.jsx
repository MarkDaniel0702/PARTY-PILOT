import styles from "./statementCard.module.css";

// One "truths and a lie"-style statement row. `variant`: "plain" (read-only,
// shown before voting), "lie"/"truth" (revealed after voting). Pass `onClick`
// to make it an interactive voting button instead (ignores `variant`).
export function StatementCard({ index, text, variant = "plain", onClick }) {
  if (onClick) {
    return (
      <button type="button" className={`${styles.card} ${styles.clickable}`} onClick={onClick}>
        <span className={styles.num}>#{index + 1}</span>
        <span>{text}</span>
      </button>
    );
  }
  const cls = `${styles.card} ${variant === "lie" ? styles.isLie : ""} ${variant === "truth" ? styles.isTruth : ""}`.trim();
  const icon = variant === "lie" ? "❌" : variant === "truth" ? "✅" : `#${index + 1}`;
  return (
    <div className={cls}>
      <span className={styles.num}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export function StatementList({ children }) {
  return <div className={styles.list}>{children}</div>;
}
