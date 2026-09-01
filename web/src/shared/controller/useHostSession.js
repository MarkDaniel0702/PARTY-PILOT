import { useCallback, useMemo, useRef, useState } from "react";
import { MAX_PLAYERS, MSG, welcome, ping, errorMsg } from "./protocol";

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
  const connsRef = useRef(new Map()); // playerId -> { conn, lastSeen }
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
    setPlayers((prev) => prev.map((p) => (p.playerId === playerId ? { ...p, connected } : p)));
  }, []);

  const handleData = useCallback(
    (conn, msg, existingPlayerId) => {
      if (!msg || msg.v !== 1) {
        conn.send(errorMsg("version-mismatch"));
        return;
      }

      if (msg.t === MSG.JOIN) {
        const reconnecting = msg.playerId && connsRef.current.has(msg.playerId);
        if (reconnecting) {
          const entry = connsRef.current.get(msg.playerId);
          entry.conn = conn;
          entry.lastSeen = Date.now();
          markConnected(msg.playerId, true);
          conn.send(welcome(msg.playerId, msg.teamId ?? null, snapshotTeams()));
          emit({ type: "join", playerId: msg.playerId, reconnect: true });
          return;
        }

        if (connsRef.current.size >= MAX_PLAYERS) {
          conn.send(errorMsg("lobby-full"));
          return;
        }

        const playerId = crypto.randomUUID();
        connsRef.current.set(playerId, { conn, lastSeen: Date.now() });
        setPlayers((prev) => [
          ...prev,
          { playerId, name: msg.name || "Player", teamId: msg.teamId ?? null, connected: true }
        ]);
        conn.send(welcome(playerId, msg.teamId ?? null, snapshotTeams()));
        emit({ type: "join", playerId, reconnect: false });
        return;
      }

      if (!existingPlayerId) return; // ignore anything else from an un-joined connection

      if (msg.t === MSG.PONG) {
        const entry = connsRef.current.get(existingPlayerId);
        if (entry) entry.lastSeen = Date.now();
        return;
      }

      emit({ type: msg.t, playerId: existingPlayerId, ...msg });
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

        heartbeatRef.current = setInterval(() => {
          const now = Date.now();
          connsRef.current.forEach((entry, playerId) => {
            if (entry.conn.open) entry.conn.send(ping());
            if (now - entry.lastSeen > STALE_AFTER_MS) markConnected(playerId, false);
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

  const broadcast = useCallback((msg) => {
    connsRef.current.forEach((entry) => {
      if (entry.conn.open) entry.conn.send(msg);
    });
  }, []);

  const sendTo = useCallback((playerId, msg) => {
    const entry = connsRef.current.get(playerId);
    if (entry?.conn.open) entry.conn.send(msg);
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
    assignPlayerTeam
  };
}
