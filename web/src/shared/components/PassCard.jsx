import { Button } from "./Button";
import styles from "./ingame.module.css";

// Pass-the-device interstitial (Spy Word, Who Am I?, Password, Word Grid,
// Charades). `hint` is a full React node, not a string, so callers that
// need the player's name to appear more than once (Who Am I?'s "look away,
// <Name>." — the name shows in .passName AND inside the hint sentence)
// don't need a special case.
export function PassCard({ icon = "📱", title = "Pass the device to", name, hint, buttonLabel = "I'm Ready — Reveal", onReveal }) {
  return (
    <div className={styles.passCard}>
      <span className={styles.passIcon} aria-hidden="true">{icon}</span>
      <p className={styles.passTitle}>{title}</p>
      <p className={styles.passName}>{name}</p>
      {hint && <p className={styles.passHint}>{hint}</p>}
      <Button onClick={onReveal}>{buttonLabel}</Button>
    </div>
  );
}
