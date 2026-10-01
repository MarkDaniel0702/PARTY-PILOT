import { useCallback, useMemo, useRef, useState } from "react";
import { PROTOCOL_VERSION, MAX_PLAYERS, MSG, HOST_MSG, welcome, ping, errorMsg } from "./protocol";

// No ambiguous glyphs (0/O, 1/I) — this gets read aloud and typed by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_REGISTER_ATTEMPTS = 5;
const HEARTBEAT_MS = 4000;
const STALE_AFTER_MS = 12000;

function generateCode() {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

// What a phone's message becomes when the host hands it to a game. The two
// fields a game relies on to know WHO sent WHAT — `type` and `playerId` — are
// written last, so nothing a phone puts in its own message can overwrite them
// (a phone claiming to be someone else's seat, or to have sent a different
// kind of message, would otherwise just work).
export function toHostEvent(msg, playerId) {
  return { ...msg, type: msg.t, playerId };
}

// The main-screen half of a pairing session. Lazily loads peerjs so games
// that never open a session never pay for it. `teams` is read fresh on
// every call (via a ref) so a join can be answered with whichever team
// list is current without re-running any of the connection setup below.
export function useHostSession(teams) {
  const [status, setStatus] = useState("idle"); // idle | starting | ready | error
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]); // { playerId, name, teamId, connected }

  const teamsRef = useRef(teams);
  teamsRef.current = teams;

  const peerRef = useRef(null);
  // playerId -> { conn, lastSeen, connected, lastView }. `lastView` is the most
  // recent VIEW pushed to that phone, kept even when the push couldn't be
  // delivered (the phone was mid-reconnect) so it can be replayed on rejoin —
  // otherwise a phone that refreshes or wakes up shows a stale screen until
  // something happens to change the game state.
  const connsRef = useRef(new Map());
  const listenersRef = useRef(new Set());
  const heartbeatRef = useRef(null);
  const genRef = useRef(0);

  const qrUrl = useMemo(() => {
    if (!code) return null;
    return new URL(`./controller.html#${code}`, window.location.href).href;
  }, [code]);

  const emit = useCallback((event) => {
    listenersRef.current.forEach((fn) => fn(event));
  }, []);

  const findPlayerIdByConn = useCallback((conn) => {
    for (const [playerId, entry] of connsRef.current) {
      if (entry.conn === conn) return playerId;
    }
    return null;
  }, []);

  const markConnected = useCallback((playerId, connected) => {
    const entry = connsRef.current.get(playerId);
    if (entry) entry.connected = connected;
    setPlayers((prev) => {
      const target = prev.find((p) => p.playerId === playerId);
      // Skip the update when nothing changes — this runs on every message.
      if (!target || target.connected === connected) return prev;
      return prev.map((p) => (p.playerId === playerId ? { ...p, connected } : p));
    });
  }, []);

  const handleData = useCallback(
    (conn, msg, existingPlayerId) => {
      if (!msg || msg.v !== PROTOCOL_VERSION) {
        conn.send(errorMsg("version-mismatch"));
        return;
      }

      if (msg.t === MSG.JOIN) {
        const reconnecting = msg.playerId && connsRef.current.has(msg.playerId);
        if (reconnecting) {
          const entry = connsRef.current.get(msg.playerId);
          const previous = entry.conn;
          entry.conn = conn;
          entry.lastSeen = Date.now();
          // The phone dialled back in on a fresh connection; retire the old
          // one (its close handler no longer maps to this player, so it can't
          // mark them offline).
          if (previous && previous !== conn) {
            try {
              previous.close();
            } catch {
              // already closed
            }
          }
          markConnected(msg.playerId, true);
          conn.send(welcome(msg.playerId, msg.teamId ?? null, snapshotTeams()));
          if (entry.lastView) conn.send(entry.lastView);
          emit({ type: "join", playerId: msg.playerId, reconnect: true });
          return;
        }

        // Only phones that are actually here count against the cap, so seats
        // abandoned by players who left don't lock newcomers out of the lobby.
        let live = 0;
        connsRef.current.forEach((e) => {
          if (e.connected) live++;
        });
        if (live >= MAX_PLAYERS) {
          conn.send(errorMsg("lobby-full"));
          return;
        }

        const playerId = crypto.randomUUID();
        connsRef.current.set(playerId, { conn, lastSeen: Date.now(), connected: true, lastView: null });
        setPlayers((prev) => [
          ...prev,
          { playerId, name: msg.name || "Player", teamId: msg.teamId ?? null, connected: true }
        ]);
        conn.send(welcome(playerId, msg.teamId ?? null, snapshotTeams()));
        emit({ type: "join", playerId, reconnect: false });
        return;
      }

      if (!existingPlayerId) return; // ignore anything else from an un-joined connection

      // Any message proves the phone is alive. A phone that was throttled in
      // the background long enough to be marked offline must flip back to
      // online as soon as it speaks again, not stay stuck "disconnected" while
      // its taps are still arriving.
      const entry = connsRef.current.get(existingPlayerId);
      if (entry) {
        entry.lastSeen = Date.now();
        if (!entry.connected) markConnected(existingPlayerId, true);
      }

      if (msg.t === MSG.PONG) return;

      emit(toHostEvent(msg, existingPlayerId));
    },
    [emit, markConnected]
  );

  function snapshotTeams() {
    return (teamsRef.current || []).map((t) => ({ id: t.id, name: t.name, color: t.color }));
  }

  const handleIncoming = useCallback(
    (conn) => {
      conn.on("open", () => {
        conn.on("data", (data) => handleData(conn, data, findPlayerIdByConn(conn)));
        conn.on("close", () => {
          const playerId = findPlayerIdByConn(conn);
          if (playerId) markConnected(playerId, false);
        });
        conn.on("error", () => {
          const playerId = findPlayerIdByConn(conn);
          if (playerId) markConnected(playerId, false);
        });
      });
    },
    [handleData, findPlayerIdByConn, markConnected]
  );

  const start = useCallback(async () => {
    const myGen = ++genRef.current;
    setStatus("starting");
    setError(null);

    const { default: Peer } = await import("peerjs");
    if (myGen !== genRef.current) return;

    for (let attempt = 0; attempt < MAX_REGISTER_ATTEMPTS; attempt++) {
      const candidate = generateCode();
      const outcome = await new Promise((resolve) => {
        const peer = new Peer(`brot-${candidate}`);
        const onOpen = () => {
          peer.off("error", onError);
          resolve({ ok: true, peer });
        };
        const onError = (err) => {
          peer.off("open", onOpen);
          resolve({ ok: false, peer, err });
        };
        peer.once("open", onOpen);
        peer.once("error", onError);
      });

      if (myGen !== genRef.current) {
        outcome.peer.destroy();
        return;
      }

      if (outcome.ok) {
        peerRef.current = outcome.peer;
        setCode(candidate);
        setStatus("ready");
        outcome.peer.on("connection", handleIncoming);
        outcome.peer.on("disconnected", () => {
          if (myGen === genRef.current) outcome.peer.reconnect();
        });

        clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
          const now = Date.now();
          connsRef.current.forEach((entry, playerId) => {
            if (entry.conn.open) entry.conn.send(ping());
            if (entry.connected && now - entry.lastSeen > STALE_AFTER_MS) markConnected(playerId, false);
          });
        }, HEARTBEAT_MS);
        return;
      }

      outcome.peer.destroy();
      if (outcome.err?.type !== "unavailable-id") {
        setStatus("error");
        setError("Couldn't reach the pairing server. Check your connection and retry.");
        return;
      }
      // otherwise loop and try another code
    }

    setStatus("error");
    setError("Couldn't start a session — please retry.");
  }, [handleIncoming, markConnected]);

  const close = useCallback(() => {
    genRef.current++;
    clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
    connsRef.current.forEach((entry) => entry.conn.close());
    connsRef.current.clear();
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setStatus("idle");
    setCode(null);
    setPlayers([]);
  }, []);

  // A view is remembered even when it can't be delivered right now, so the
  // phone gets the *latest* one the moment it rejoins (see `lastView` above).
  const deliver = (entry, msg) => {
    if (msg && msg.t === HOST_MSG.VIEW) entry.lastView = msg;
    if (entry.conn.open) entry.conn.send(msg);
  };

  const broadcast = useCallback((msg) => {
    connsRef.current.forEach((entry) => deliver(entry, msg));
  }, []);

  const sendTo = useCallback((playerId, msg) => {
    const entry = connsRef.current.get(playerId);
    if (entry) deliver(entry, msg);
  }, []);

  // Drops a seat for good — used to clear phones that left and aren't coming
  // back, so they stop cluttering the lobby list.
  const removePlayer = useCallback((playerId) => {
    const entry = connsRef.current.get(playerId);
    if (entry) {
      connsRef.current.delete(playerId);
      try {
        entry.conn.close();
      } catch {
        // already closed
      }
    }
    setPlayers((prev) => prev.filter((p) => p.playerId !== playerId));
  }, []);

  const onMessage = useCallback((handler) => {
    listenersRef.current.add(handler);
    return () => listenersRef.current.delete(handler);
  }, []);

  const assignPlayerTeam = useCallback((playerId, teamId) => {
    setPlayers((prev) => prev.map((p) => (p.playerId === playerId ? { ...p, teamId } : p)));
  }, []);

  return {
    status,
    code,
    qrUrl,
    error,
    players,
    start,
    close,
    broadcast,
    sendTo,
    onMessage,
    assignPlayerTeam,
    removePlayer
  };
}
