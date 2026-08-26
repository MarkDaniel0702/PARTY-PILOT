import styles from "./ingame.module.css";

// The secret/answer display card (word, character, category content).
// `textClassName` lets a game layer its own font/style on top (e.g. Spy
// Word's typewriter face) without forking the component.
export function RevealCard({ label, text, footnote, textClassName = "" }) {
  return (
    <div className={styles.revealCard}>
      {label && <span className={styles.revealLabel}>{label}</span>}
      <p className={`${styles.revealText} ${textClassName}`.trim()}>{text}</p>
      {footnote && <p className={styles.revealFootnote}>{footnote}</p>}
    </div>
  );
}

export function TurnBanner({ children }) {
  if (!children) return null;
  return <p className={styles.turnBanner}>{children}</p>;
}

export function CategoryBanner({ children }) {
  return <p className={styles.catBanner}>{children}</p>;
}

export function ProgressDots({ current, total }) {
  return (
    <div className={styles.progressDots}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`${styles.dot} ${i < current ? styles.done : ""} ${i === current ? styles.current : ""}`.trim()}
        />
      ))}
    </div>
  );
}

export function AnswerBlock({ label = "Answer", text }) {
  return (
    <div className={styles.answerBlock}>
      <span className={styles.answerLabel}>{label}</span>
      <p className={styles.answerText}>{text}</p>
    </div>
  );
}

// One button per team: "+{points} {team.name}" — Guess the Song, Picture
// Guess, Quiz Night's classic (non-turn-based) award flow.
export function AwardRow({ teams, points, onAward, doubleTeamIndex }) {
  return (
    <div className={styles.awardRow}>
      {teams.map((team, i) => {
        const pts = i === doubleTeamIndex ? points * 2 : points;
        return (
          <button key={i} type="button" className={styles.awardBtn} onClick={() => onAward(i, pts)}>
            <span className={styles.awardSwatch} style={{ background: team.color }} />+{pts} {team.name}
            {i === doubleTeamIndex ? " (2x!)" : ""}
          </button>
        );
      })}
    </div>
  );
}
