import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROTOCOL_VERSION, HOST_MSG, join, pong } from "./protocol";

// The phone-side half of a pairing session. Reads the session code from the
// URL hash (not a query param, so it stays out of referrers and survives
// vite.config.js's relative `base`). The phone never runs game logic — it
// only renders whatever `view` the host last pushed.
export function useControllerClient() {
  const [status, setStatus] = useState("idle"); // idle | connecting | connected | error | no-code
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

  const joinWithName = useCallback(
    async (name) => {
      if (!code) {
        setStatus("no-code");
        return;
      }
      nameRef.current = name;
      const myGen = ++genRef.current;
      setStatus("connecting");
      setError(null);

      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem(storageKey) || "null");
      } catch {
        stored = null;
      }

      const { default: Peer } = await import("peerjs");
      if (myGen !== genRef.current) return;

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
          conn.send(join(name, stored?.teamId ?? null, stored?.playerId ?? null));
        });

        conn.on("data", (msg) => {
          if (!msg || msg.v !== PROTOCOL_VERSION) return;
          if (msg.t === HOST_MSG.WELCOME) {
            setPlayerId(msg.playerId);
            setTeamId(msg.teamId);
            setStatus("connected");
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
          } else if (msg.t === HOST_MSG.ERROR) {
            setStatus("error");
            setError(msg.reason === "version-mismatch" ? "Please refresh this page." : msg.reason);
          }
        });

        conn.on("close", () => {
          if (myGen === genRef.current) setStatus("error");
        });
        conn.on("error", () => {
          if (myGen === genRef.current) setStatus("error");
        });
      });

      peer.on("error", () => {
        if (myGen !== genRef.current) return;
        setStatus("error");
        setError("Couldn't connect. Check you're on the same Wi-Fi and try again.");
      });
    },
    [code, storageKey]
  );

  useEffect(() => {
    if (!code) {
      setStatus("no-code");
      return undefined;
    }
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      stored = null;
    }
    if (stored?.name) joinWithName(stored.name);

    return () => {
      genRef.current++;
      connRef.current?.close();
      peerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback((msg) => {
    if (connRef.current?.open) connRef.current.send(msg);
  }, []);

  const retry = useCallback(() => {
    if (nameRef.current) joinWithName(nameRef.current);
  }, [joinWithName]);

  return { status, error, code, view, playerId, teamId, lastBuzzResult, lastEvent, joinWithName, send, retry };
}
