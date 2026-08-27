import { HelpCircle } from "lucide-react";
import styles from "./layout.module.css";

// Ports the <details class="how-to-play"> rules block that's identical
// across every game's setup screen. Pass `steps` for the common numbered-
// list case, or `children` for anything more custom.
export function HowToPlay({ steps, summary = "How does this work?", children }) {
  return (
    <details className={styles.howToPlay}>
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
