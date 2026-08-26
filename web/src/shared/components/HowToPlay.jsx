import styles from "./layout.module.css";

// Ports the <details class="how-to-play"> rules block that's identical
// across every game's setup screen. Pass `steps` for the common numbered-
// list case, or `children` for anything more custom.
export function HowToPlay({ steps, summary = "How does this work?", children }) {
  return (
    <details className={styles.howToPlay}>
      <summary>❓ {summary}</summary>
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
