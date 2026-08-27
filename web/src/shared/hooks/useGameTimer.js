import { useCallback, useEffect, useRef } from "react";
import { useCountdown } from "./useCountdown";
import { playSound } from "../audio/sounds";

// Seconds-remaining at which the "about to run out" warning beep fires
// (spec: warn 5s before the end). Only used when the timer was started with
// more than this many seconds.
const WARNING_AT = 5;

// In-game timer HUD logic — ports createGameTimer()'s warn/urgent staging
// (fractions of the *started* duration, so thresholds scale with whatever
// custom length the player picked) on top of useCountdown. Pass the result
// to <GameTimer timer={...} /> to render it.
//
// Sound: a short chirp on start, one warning beep at 5s left, and a buzzer
// at zero — all routed through the shared, mutable sound engine so they
// respect the global mute/volume and never touch the countdown's timing.
// `timerSound: "soft"` is for games where the countdown just advances a
// clue/blur step rather than ending a turn (guess-the-song, picture-guess):
// it drops the warning beep and uses a gentle tone instead of the buzzer.
export function useGameTimer({ warnFrac = 0.5, urgentFrac = 0.25, onExpire, timerSound = "buzzer" } = {}) {
  const soft = timerSound === "soft";
  const softRef = useRef(soft);
  softRef.current = soft;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const countdown = useCountdown({
    onExpire: () => {
      playSound(softRef.current ? "timerEndSoft" : "timerEnd");
      if (onExpireRef.current) onExpireRef.current();
    },
  });

  const lastSecondsRef = useRef(0);
  const prevRemainingRef = useRef(0);
  const warnedRef = useRef(false);

  const start = useCallback(
    (seconds) => {
      lastSecondsRef.current = seconds;
      prevRemainingRef.current = seconds;
      warnedRef.current = false;
      // In "soft" mode the countdown auto-restarts every clue step, so a
      // start chirp each time would just be noise — the soft expiry tone
      // already marks every transition.
      if (!soft) playSound("timerStart");
      countdown.start(seconds);
    },
    [countdown, soft]
  );

  const reset = useCallback(() => start(lastSecondsRef.current), [start]);

  // One warning beep as the countdown crosses the 5s mark. Guarded so it
  // can't repeat and won't fire for timers that start at/below the
  // threshold, or in the "soft" (clue-advance) mode.
  useEffect(() => {
    const remaining = countdown.remaining;
    const prev = prevRemainingRef.current;
    prevRemainingRef.current = remaining;
    if (soft || warnedRef.current) return;
    if (lastSecondsRef.current > WARNING_AT && prev > WARNING_AT && remaining <= WARNING_AT && remaining > 0) {
      warnedRef.current = true;
      playSound("timerWarning");
    }
  }, [countdown.remaining, soft]);

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
