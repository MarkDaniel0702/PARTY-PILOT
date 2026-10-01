import { WifiOff } from "lucide-react";
import styles from "./offlineBanner.module.css";

// Main-screen notice that one or more paired phones have dropped off the
// network. The phone redials on its own and picks its screen straight back up,
// so the default message just says who is missing and that waiting is fine.
//
// `waitingOn` names the seat the game is currently stuck on (the player whose
// turn it is). When the game also offers a way past a seat that isn't coming
// back, pass `onSkip` and it renders as a button.
export function OfflineBanner({ names, waitingOn, onSkip, skipLabel = "Skip their turn" }) {
  if (!names || names.length === 0) return null;
  const who = names.join(", ");
  return (
    <div className={styles.banner} role="status">
      <WifiOff size={16} strokeWidth={2.5} aria-hidden="true" className={styles.icon} />
      <span className={styles.text}>
        <strong>{who}</strong> lost connection
        {waitingOn ? <> — waiting on <strong>{waitingOn}</strong> to rejoin.</> : " — they can rejoin by reopening the controller."}
      </span>
      {onSkip && (
        <button type="button" className={styles.skip} onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}
