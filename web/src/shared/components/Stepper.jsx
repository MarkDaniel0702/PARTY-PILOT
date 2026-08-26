import { Minus, Plus } from "lucide-react";
import styles from "./picker.module.css";

// Generic +/- counter — replaces 3+ hand-rolled copies of the same pattern
// (player count, Password's clue count, Word Grid's guess count).
export function Stepper({ value, min, max, onChange, hint }) {
  return (
    <div>
      <div className={styles.stepper}>
        <button
          type="button"
          className={styles.stepperBtn}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label="Decrease"
        >
          <Minus size={18} strokeWidth={3} />
        </button>
        <span className={styles.stepperCount}>{value}</span>
        <button
          type="button"
          className={styles.stepperBtn}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label="Increase"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
      {hint && <p className={styles.stepperHint}>{hint}</p>}
    </div>
  );
}
