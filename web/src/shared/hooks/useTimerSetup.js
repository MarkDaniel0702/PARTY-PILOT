import { useCallback, useState } from "react";

// Holds the pre-game timer config (on/off + duration) that <TimerSetup>
// renders. A game reads .enabled/.seconds at start time — real React state,
// so unlike the original's pull-based getSeconds()/isEnabled() it's always
// current without needing to "read" anything.
export function useTimerSetup({ recommended, defaultEnabled = true }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [seconds, setSecondsRaw] = useState(recommended);

  const setSeconds = useCallback((s) => {
    if (!Number.isFinite(s)) return;
    setSecondsRaw(Math.max(5, Math.min(600, Math.round(s))));
  }, []);

  return { enabled, setEnabled, seconds, setSeconds };
}
