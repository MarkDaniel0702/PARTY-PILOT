import { Stepper } from "./Stepper";
import styles from "./roster.module.css";

// Player-count stepper + name inputs. Pair with hooks/useRoster.js.
export function Roster({ count, names, min, max, onCountChange, onNameChange, hint }) {
  return (
    <div>
      <Stepper value={count} min={min} max={max} onChange={onCountChange} hint={hint} />
      <div className={styles.namesGrid}>
        {Array.from({ length: count }, (_, i) => (
          <input
            key={i}
            type="text"
            className={styles.nameInput}
            maxLength={18}
            placeholder={`Player ${i + 1}`}
            value={names[i] || ""}
            onChange={(e) => onNameChange(i, e.target.value)}
          />
        ))}
      </div>
    </div>
  );
}
