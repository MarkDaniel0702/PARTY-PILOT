import { useEffect } from "react";
import styles from "./layout.module.css";

// Ports party.css's .screen / .screen.active toggle + fadeIn keyframe.
// React equivalent of createScreenManager: instead of toggling a class on a
// permanently-mounted section, an inactive screen simply isn't rendered —
// mounting fresh each time it becomes active naturally replays the fade-in.
// Also ports createScreenManager's window.scrollTo(top, smooth) on every
// screen change, so a long setup/results screen doesn't leave the next
// screen scrolled halfway down.
export function Screen({ active, children }) {
  useEffect(() => {
    if (active) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);
  if (!active) return null;
  return <section className={styles.screen}>{children}</section>;
}

export function ScreenTitle({ children }) {
  return <h1 className={styles.screenTitle}>{children}</h1>;
}

export function ScreenSub({ children }) {
  return <p className={styles.screenSub}>{children}</p>;
}

export function BigIcon({ children }) {
  return <span className={styles.bigIcon}>{children}</span>;
}

// A labeled setup section (e.g. "1. Choose a theme"). `wide` drops the
// 640px max-width for content that needs the full column, like a board.
export function SetupBlock({ label, wide, children }) {
  return (
    <div className={`${styles.block} ${wide ? styles.blockWide : ""}`.trim()}>
      {label && <h2 className={styles.blockLabel}>{label}</h2>}
      {children}
    </div>
  );
}
