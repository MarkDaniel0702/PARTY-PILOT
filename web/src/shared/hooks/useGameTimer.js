import { useCallback, useRef } from "react";
import { useCountdown } from "./useCountdown";

// In-game timer HUD logic — ports createGameTimer()'s warn/urgent staging
// (fractions of the *started* duration, so thresholds scale with whatever
// custom length the player picked) on top of useCountdown. Pass the result
// to <GameTimer timer={...} /> to render it.
export function useGameTimer({ warnFrac = 0.5, urgentFrac = 0.25, onExpire } = {}) {
  const countdown = useCountdown({ onExpire });
  const lastSecondsRef = useRef(0);

  const start = useCallback(
    (seconds) => {
      lastSecondsRef.current = seconds;
      countdown.start(seconds);
    },
    [countdown]
  );

  const reset = useCallback(() => start(lastSecondsRef.current), [start]);

  const urgentAt = Math.max(2, Math.round(lastSecondsRef.current * urgentFrac));
  const warnAt = Math.max(urgentAt + 1, Math.round(lastSecondsRef.current * warnFrac));
  const stage =
    countdown.remaining > 0 && countdown.remaining <= urgentAt
      ? "urgent"
      : countdown.remaining > 0 && countdown.remaining <= warnAt
      ? "warn"
      : "normal";

  return { ...countdown, start, reset, stage };
}
