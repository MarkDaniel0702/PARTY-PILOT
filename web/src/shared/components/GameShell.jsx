import { ArrowLeft } from "lucide-react";
import styles from "./layout.module.css";

// Topbar (back link + game title) + content wrap — every game's outer
// shell. `titleIcon` is a lucide-react component, kept consistent with the
// icon already assigned to this game on the homepage's card grid.
export function GameShell({ title, titleIcon: TitleIcon, backHref = "./index.html", children }) {
  return (
    <>
      <header className={styles.topbar}>
        <a className={styles.backLink} href={backHref}>
          <ArrowLeft size={14} strokeWidth={2.5} aria-hidden="true" />
          B-Rotation
        </a>
        <span className={styles.topbarTitle}>
          {TitleIcon && (
            <TitleIcon
              size={14}
              strokeWidth={2.5}
              aria-hidden="true"
              style={{ verticalAlign: "-2px", marginRight: "0.4em" }}
            />
          )}
          {title}
        </span>
      </header>
      <main className={styles.wrap}>{children}</main>
    </>
  );
}
