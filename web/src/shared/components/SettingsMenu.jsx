import { useEffect, useId, useRef, useState } from "react";
import { Settings2, Sun, Moon, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "../theme/useTheme";
import { useSound } from "../audio/useSound";
import styles from "./settingsMenu.module.css";

// Global, always-on-screen controls: light/dark theme + sound mute/volume.
// Rendered once by GameShell (so it appears on every game) and once on the
// homepage. Fixed to the bottom-right so it never collides with a game's
// topbar, timer HUD, or content.
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();
  const { active, setThemePref } = useTheme();
  const { muted, volume, toggleMuted, setVolume, play } = useSound();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const chooseTheme = (next) => {
    setThemePref(next);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      {open && (
        <div className={styles.panel} id={panelId} role="dialog" aria-label="Site settings">
          <div className={styles.header}>
            <span className={styles.heading}>Settings</span>
            <button
              type="button"
              className={styles.close}
              aria-label="Close settings"
              onClick={() => setOpen(false)}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Theme</span>
            <div className={styles.segmented} role="group" aria-label="Theme">
              <button
                type="button"
                className={`${styles.segBtn} ${active === "light" ? styles.segOn : ""}`.trim()}
                aria-pressed={active === "light"}
                onClick={() => chooseTheme("light")}
              >
                <Sun size={14} strokeWidth={2.5} aria-hidden="true" />
                Light
              </button>
              <button
                type="button"
                className={`${styles.segBtn} ${active === "dark" ? styles.segOn : ""}`.trim()}
                aria-pressed={active === "dark"}
                onClick={() => chooseTheme("dark")}
              >
                <Moon size={14} strokeWidth={2.5} aria-hidden="true" />
                Dark
              </button>
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.label}>Sound</span>
            <button
              type="button"
              className={styles.soundToggle}
              aria-pressed={!muted}
              onClick={() => {
                const wasMuted = muted;
                toggleMuted();
                if (wasMuted) play("timerStart");
              }}
            >
              {muted ? (
                <VolumeX size={15} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Volume2 size={15} strokeWidth={2.5} aria-hidden="true" />
              )}
              {muted ? "Sound off" : "Sound on"}
            </button>
            <label className={styles.volumeRow}>
              <span className={styles.srOnly}>Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                disabled={muted}
                aria-label="Sound volume"
                onChange={(e) => setVolume(Number(e.target.value))}
                onPointerUp={() => !muted && play("timerStart")}
              />
            </label>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Settings: theme and sound"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings2 size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
