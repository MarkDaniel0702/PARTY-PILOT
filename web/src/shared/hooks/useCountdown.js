import { useCallback, useEffect, useRef, useState } from "react";

// Low-level start/stop/pause/resume countdown — a behavioral port of
// js/shared.js's createTimer(). pause()/resume() preserve remaining time
// (unlike stop()+start(), which resets it). onExpire fires exactly once
// when the countdown reaches zero on its own.
//
// IMPORTANT: onExpire is fired from a post-commit effect, never from inside
// the setRemaining updater. Game onExpire handlers flip phase, start other
// timers, update scores, etc. — running those setState calls from within a
// state-updater executes them during React's render phase, which throws
// ("Cannot access X before initialization" / "Cannot update a component
// while rendering") and unmounts the whole tree. Deferring by one commit
// keeps the updater pure and the handler running as a normal callback.
export function useCountdown({ onExpire } = {}) {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  // Guards onExpire to a single call per countdown run — set true when a
  // run reaches zero, reset to false by start().
  const expiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    // A manual stop is not an expiry — don't let the effect fire onExpire
    // if this happened to land on 0.
    expiredRef.current = true;
    setRunning(false);
  }, [clearTimer]);

  const tick = useCallback(() => {
    // Pure updater: only decrements. Reaching zero is detected by the
    // effect below, which then fires onExpire after the commit.
    setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
  }, []);

  const start = useCallback(
    (seconds) => {
      clearTimer();
      expiredRef.current = false;
      setRemaining(Math.max(0, Math.floor(seconds) || 0));
      setRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    },
    [clearTimer, tick]
  );

  const pause = useCallback(() => {
    clearTimer();
    setRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setRemaining((r) => {
      if (!intervalRef.current && r > 0 && !expiredRef.current) {
        intervalRef.current = setInterval(tick, 1000);
        setRunning(true);
      }
      return r;
    });
  }, [tick]);

  // Fire onExpire once, after commit, when a running countdown has reached
  // zero on its own.
  useEffect(() => {
    if (running && remaining === 0 && !expiredRef.current) {
      expiredRef.current = true;
      clearTimer();
      setRunning(false);
      if (onExpireRef.current) onExpireRef.current();
    }
  }, [running, remaining, clearTimer]);

  // Unmount cleanup — a React component can unmount mid-countdown (e.g.
  // navigating screens), so this prevents a leaked interval.
  useEffect(() => clearTimer, [clearTimer]);

  return { remaining, running, start, stop, pause, resume };
}
