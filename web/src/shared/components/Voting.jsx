import styles from "./voting.module.css";

// A/B vote buttons (Would You Rather?). Distinct accent/accent-2 coloring
// per side is baked into voting.module.css so any game gets it for free.
export function BinaryVoteButtons({ optionA, optionB, onVote, disabled }) {
  return (
    <div className={styles.voteRow}>
      <button
        type="button"
        className={`${styles.voteBtn} ${styles.voteBtnA}`}
        disabled={disabled}
        onClick={() => onVote("a")}
      >
        <span className={styles.voteLetter}>A</span>
        {optionA}
      </button>
      <button
        type="button"
        className={`${styles.voteBtn} ${styles.voteBtnB}`}
        disabled={disabled}
        onClick={() => onVote("b")}
      >
        <span className={styles.voteLetter}>B</span>
        {optionB}
      </button>
    </div>
  );
}

// Percentage bar reveal — pairs with BinaryVoteButtons' results view, but
// generic enough for any A/B or ranked tally.
export function VoteBar({ label, pct, count }) {
  return (
    <div className={styles.resultOption}>
      <span className={styles.resultOptionLabel}>{label}</span>
      <span className={styles.barTrack}>
        <span className={styles.barFill} style={{ width: `${pct}%` }} />
      </span>
      <span className={styles.resultOptionCount}>{count}</span>
    </div>
  );
}

export function VoteBarRow({ children }) {
  return <div className={styles.voteRow}>{children}</div>;
}

// "Pick a player" grid (Most Likely To's vote target picker, generalized).
export function PlayerPickerGrid({ players, onPick, disabledIndex }) {
  return (
    <div className={styles.playerGrid}>
      {players.map((name, i) => (
        <button
          key={i}
          type="button"
          className={styles.playerBtn}
          disabled={i === disabledIndex}
          onClick={() => onPick(i)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

// Two Truths and a Lie's statement card, in its three DOM-identical
// variants: plain display, clickable/votable, and revealed (✅/❌).
export function StatementCard({ index, text, variant = "plain", revealState, onClick }) {
  const stateClass =
    revealState === "truth" ? styles.isTruth : revealState === "lie" ? styles.isLie : "";
  const className = `${styles.statementCard} ${stateClass}`.trim();
  const marker = revealState === "truth" ? "✅" : revealState === "lie" ? "❌" : `#${index + 1}`;

  if (variant === "selectable") {
    return (
      <button type="button" className={className} onClick={onClick}>
        <span className={styles.statementNum}>{marker}</span>
        <span>{text}</span>
      </button>
    );
  }
  return (
    <div className={className}>
      <span className={styles.statementNum}>{marker}</span>
      <span>{text}</span>
    </div>
  );
}

export function StatementList({ children }) {
  return <div className={styles.statementList}>{children}</div>;
}
