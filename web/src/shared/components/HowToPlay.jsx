import { useState } from "react";
import { HelpCircle } from "lucide-react";
import styles from "./layout.module.css";

// Ports the <details class="how-to-play"> rules block that's identical
// across every game's setup screen. Pass `steps` for the common numbered-
// list case, or `children` for anything more custom.
//
// Onboarding: the rules start OPEN the first time someone visits a given
// game on this device, then stay collapsed once they've been seen.
const SEEN_PREFIX = "howtoplay-seen:";

function firstVisit() {
  try {
    const key = SEEN_PREFIX + location.pathname;
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, "1");
    return true;
  } catch {
    return false; // storage blocked: stay collapsed, never break the page
  }
}

export function HowToPlay({ steps, summary = "How does this work?", children }) {
  const [open] = useState(firstVisit);
  return (
    <details className={styles.howToPlay} open={open || undefined}>
      <summary>
        <HelpCircle size={14} strokeWidth={2.5} aria-hidden="true" style={{ verticalAlign: "-0.15em" }} />{" "}
        {summary}
      </summary>
      {steps ? (
        <ol>
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ) : (
        children
      )}
    </details>
  );
}
