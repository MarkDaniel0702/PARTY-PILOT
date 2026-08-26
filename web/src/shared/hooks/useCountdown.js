import { useCallback, useEffect, useRef, useState } from "react";

// Low-level start/stop/pause/resume countdown — a direct behavioral port of
// js/shared.js's createTimer(). pause()/resume() preserve remaining time
// (unlike stop()+start(), which resets it). onExpire fires once when the
// countdown hits zero.
export function useCountdown({ onExpire } = {}) {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setRunning(false);
        if (onExpireRef.current) onExpireRef.current();
        return 0;
      }
      return next;
    });
  }, []);

  const start = useCallback(
    (seconds) => {
      stop();
      setRemaining(seconds);
      setRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    },
    [stop, tick]
  );

  const pause = useCallback(() => stop(), [stop]);

  const resume = useCallback(() => {
    setRemaining((r) => {
      if (!intervalRef.current && r > 0) {
        intervalRef.current = setInterval(tick, 1000);
        setRunning(true);
      }
      return r;
    });
  }, [tick]);

  // Unmount cleanup — the original had no such concept (plain DOM helpers
  // live for the page's lifetime), but a React component can unmount
  // mid-countdown (e.g. navigating screens), so this prevents a leaked
  // interval from calling setState on an unmounted component.
  useEffect(() => stop, [stop]);

  return { remaining, running, start, stop, pause, resume };
}
