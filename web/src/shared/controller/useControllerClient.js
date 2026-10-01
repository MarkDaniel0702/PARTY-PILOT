import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROTOCOL_VERSION, HOST_MSG, join, pong } from "./protocol";

// How long the host may stay silent before the link is presumed dead. The host
// pings every few seconds, so a longer gap means the connection is gone even
// if WebRTC hasn't noticed yet (a phone waking from sleep, a Wi-Fi handover).
const SILENCE_LIMIT_MS = 11000;
const WATCHDOG_MS = 3000;
// Gentle backoff between redial attempts; the last value repeats.
const RETRY_DELAYS_MS = [700, 1500, 3000, 5000];
const MAX_REDIALS = 25;

const ERROR_TEXT = {
  "version-mismatch": "This page is out of date — please refresh it.",
  "lobby-full": "This session is full."
};

// The phone-side half of a pairing session. Reads the session code from the
// URL hash (not a query param, so it stays out of referrers and survives
// vite.config.js's relative `base`). The phone never runs game logic — it
// only renders whatever `view` the host last pushed.
//
// A link that drops AFTER a successful join is treated as routine, not an
// error: the last `view` is kept on screen, status becomes "reconnecting", and
// the hook redials on its own (and the instant the page becomes visible again).
// Only a failed FIRST join, a fatal host error, or giving up after many redials
// surfaces as status "error".
export function useControllerClient() {
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | reconnecting | error | no-code
  const [error, setError] = useState(null);
  const [view, setView] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [teamId, setTeamId] = useState(null);
  // A fresh object each time, not just a boolean — the host almost always
  // pushes a new `view` right after this (next round's BUZZ, or an IDLE
  // "watch the main screen"), so the result can't be shown by keying off
  // the current view. A plain boolean would also fail to re-fire an effect
  // when the same outcome (e.g. two misses in a row) repeats.
  const [lastBuzzResult, setLastBuzzResult] = useState(null);
  // Host events that aren't view changes (Tetris garbage, match end). A new
  // object each time so repeated identical events still fire an effect.
  const [lastEvent, setLastEvent] = useState(null);

  const code = useMemo(() => {
    const raw = window.location.hash.replace("#", "").trim().toUpperCase();
    return raw || null;
  }, []);

  const storageKey = code ? `br-controller-${code}` : null;

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const genRef = useRef(0);
  const nameRef = useRef(null);
  const everConnectedRef = useRef(false);
  const fatalRef = useRef(false);
  const redialsRef = useRef(0);
  const retryTimerRef = useRef(null);
  const lastHeardRef = useRef(0);
  const statusRef = useRef("idle");
  statusRef.current = status;
  const dialRef = useRef(null);

  const readStored = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }, [storageKey]);

  // Closes whatever connection/peer is currently held, without touching state.
  const dropTransport = useCallback(() => {
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
    const conn = connRef.current;
    const peer = peerRef.current;
    connRef.current = null;
    peerRef.current = null;
    try {
      conn?.close();
    } catch {
      // already closed
    }
    try {
      peer?.destroy();
    } catch {
      // already destroyed
    }
  }, []);

  const scheduleRedial = useCallback(() => {
    clearTimeout(retryTimerRef.current);
    if (redialsRef.current >= MAX_REDIALS) {
      setStatus("error");
      setError("Lost the connection to the main screen.");
      return;
    }
    setStatus("reconnecting");
    const delay = RETRY_DELAYS_MS[Math.min(redialsRef.current, RETRY_DELAYS_MS.length - 1)];
    redialsRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      if (nameRef.current) dialRef.current?.(nameRef.current);
    }, delay);
  }, []);

  const dial = useCallback(
    async (name) => {
      if (!code) {
        setStatus("no-code");
        return;
      }
      nameRef.current = name;
      const myGen = ++genRef.current;
      dropTransport();
      fatalRef.current = false;
      setStatus(everConnectedRef.current ? "reconnecting" : "connecting");
      setError(null);

      const { default: Peer } = await import("peerjs");
      if (myGen !== genRef.current) return;

      // One place decides what a lost link means, so every failure path
      // (peer error, conn error, conn close) behaves identically.
      let handled = false;
      const lost = (reason) => {
        if (myGen !== genRef.current || handled || fatalRef.current) return;
        handled = true;
        if (!everConnectedRef.current) {
          setStatus("error");
          setError(
            reason === "peer-unavailable"
              ? "Couldn't find that session. Check the code on the main screen."
              : "Couldn't connect. Check you're on the same Wi-Fi and try again."
          );
          return;
        }
        scheduleRedial();
      };

      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", () => {
        if (myGen !== genRef.current) {
          peer.destroy();
          return;
        }
        const conn = peer.connect(`brot-${code}`, { reliable: true });
        connRef.current = conn;

        conn.on("open", () => {
          const stored = readStored();
          conn.send(join(name, stored?.teamId ?? null, stored?.playerId ?? null));
        });

        conn.on("data", (msg) => {
          if (myGen !== genRef.current || !msg) return;
          lastHeardRef.current = performance.now();
          // An error is understood whatever protocol version it carries — it
          // is how a host tells an out-of-date phone to refresh.
          if (msg.t === HOST_MSG.ERROR || msg.v !== PROTOCOL_VERSION) {
            // Nothing a redial can fix — surface it and stop.
            fatalRef.current = true;
            setStatus("error");
            const reason = msg.t === HOST_MSG.ERROR ? msg.reason : "version-mismatch";
            setError(ERROR_TEXT[reason] || reason);
            return;
          }
          if (msg.t === HOST_MSG.WELCOME) {
            everConnectedRef.current = true;
            redialsRef.current = 0;
            setPlayerId(msg.playerId);
            setTeamId(msg.teamId);
            setStatus("connected");
            setError(null);
            try {
              localStorage.setItem(
                storageKey,
                JSON.stringify({ playerId: msg.playerId, teamId: msg.teamId, name })
              );
            } catch {
              // storage unavailable (private mode) — reconnect just won't be seamless
            }
          } else if (msg.t === HOST_MSG.VIEW) {
            setView(msg);
          } else if (msg.t === HOST_MSG.BUZZ_RESULT) {
            setLastBuzzResult({ won: msg.won });
          } else if (msg.t === HOST_MSG.EVENT) {
            setLastEvent({ kind: msg.kind, payload: msg.payload, at: performance.now() });
          } else if (msg.t === HOST_MSG.PING) {
            conn.send(pong());
          }
        });

        conn.on("close", () => lost("closed"));
        conn.on("error", () => lost("conn-error"));
      });

      // PeerJS also reports trouble with its signalling socket here. Once the
      // data channel is open that doesn't matter — redialling would tear down
      // a perfectly good link — so only an error before it opens counts.
      peer.on("error", (err) => {
        if (connRef.current?.open) return;
        lost(err?.type || "peer-error");
      });
    },
    [code, storageKey, dropTransport, readStored, scheduleRedial]
  );
  dialRef.current = dial;

  const joinWithName = useCallback(
    (name) => {
      everConnectedRef.current = false;
      redialsRef.current = 0;
      return dial(name);
    },
    [dial]
  );

  useEffect(() => {
    if (!code) {
      setStatus("no-code");
      return undefined;
    }
    const stored = readStored();
    if (stored?.name) joinWithName(stored.name);

    return () => {
      genRef.current++;
      dropTransport();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Waking a phone: redial right away instead of waiting out the backoff, and
  // treat a long silence as a dead link even if WebRTC hasn't reported it.
  useEffect(() => {
    const revive = () => {
      if (!everConnectedRef.current || !nameRef.current || fatalRef.current) return;
      const s = statusRef.current;
      const stale = performance.now() - lastHeardRef.current > SILENCE_LIMIT_MS;
      if (s === "reconnecting" || s === "error" || (s === "connected" && stale)) {
        redialsRef.current = 0;
        dialRef.current?.(nameRef.current);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") revive();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", revive);
    window.addEventListener("pageshow", revive);

    const watchdog = setInterval(() => {
      if (statusRef.current !== "connected") return;
      // A hidden tab is throttled and can't be expected to answer pings; the
      // visibility handler covers it when it comes back.
      if (document.visibilityState !== "visible") return;
      if (performance.now() - lastHeardRef.current > SILENCE_LIMIT_MS) scheduleRedial();
    }, WATCHDOG_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", revive);
      window.removeEventListener("pageshow", revive);
      clearInterval(watchdog);
    };
  }, [scheduleRedial]);

  const send = useCallback((msg) => {
    if (connRef.current?.open) connRef.current.send(msg);
  }, []);

  const retry = useCallback(() => {
    if (!nameRef.current) return;
    redialsRef.current = 0;
    dial(nameRef.current);
  }, [dial]);

  return { status, error, code, view, playerId, teamId, lastBuzzResult, lastEvent, joinWithName, send, retry };
}
