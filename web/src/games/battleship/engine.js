// Pure Battleship rules engine — no React, no networking. The host (App.jsx)
// is the sole authority: it holds the one `match` object and calls these
// functions in response to phone actions, then pushes a redacted view back
// to each phone. Every function here takes a match and returns either
// { ok: true, match: <next match> } or { ok: false, error }, and never
// mutates its input, so a rejected action is simply not applied.

export const BOARD_SIZE = 10;

export const ORIENTATION = { H: "H", V: "V" };

// One shared source of truth for the classic 5-ship fleet, including the
// colour each ship wears on a player's own placement/fleet board — the
// opponent never sees these, so there's no colour-blindness/label conflict
// to worry about on the redacted views. None of these are red — that hue is
// reserved for the hit/danger styling, so an unhit ship is never mistaken
// for a hit at a glance.
export const SHIP_DEFS = [
  { id: "carrier", name: "Carrier", size: 5, emoji: "🛳️", color: "#4d8cff" },
  { id: "battleship", name: "Battleship", size: 4, emoji: "🚢", color: "#7c5cff" },
  { id: "cruiser", name: "Cruiser", size: 3, emoji: "⛴️", color: "#2fd1c5" },
  { id: "submarine", name: "Submarine", size: 3, emoji: "🤿", color: "#e8a91d" },
  { id: "destroyer", name: "Destroyer", size: 2, emoji: "⛵", color: "#e0459b" }
];

export const HIT_POINTS = 10;
export const SINK_BONUS = 50;
export const WIN_BONUS = 100;

export function colLabel(col) {
  return String.fromCharCode(65 + col);
}

export function rowLabel(row) {
  return String(row + 1);
}

export function cellLabel(row, col) {
  return `${colLabel(col)}${rowLabel(row)}`;
}

function key(row, col) {
  return `${row},${col}`;
}

export function isInBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// Cells a ship of `size` occupies, anchored at (row, col) and extending
// right (H) or down (V). Exported so phones can locally predict a placement
// before asking the host, for instant invalid-drop feedback.
export function computeShipCells(row, col, size, orientation) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells.push(orientation === ORIENTATION.V ? [row + i, col] : [row, col + i]);
  }
  return cells;
}

export function shipDef(shipId) {
  return SHIP_DEFS.find((s) => s.id === shipId) || null;
}

function createPlayer(playerId, name) {
  return {
    playerId,
    name,
    fleet: [], // { shipId, name, size, cells: [[r,c]], hitCells: string[], sunk }
    shots: {}, // key(r,c) -> "hit" | "miss" — attacks this player's board has RECEIVED
    ready: false,
    score: 0
  };
}

// `players`: [{ playerId, name }, { playerId, name }] — exactly two seats.
export function createMatch(players) {
  return {
    phase: "placement", // placement | battle | over
    players: players.map((p) => createPlayer(p.playerId, p.name)),
    turnIndex: 0,
    winnerIndex: null,
    lastShot: null // { by, row, col, result, shipId, sunk } — for TV/phone feedback
  };
}

export function isFleetComplete(player) {
  return player.fleet.length === SHIP_DEFS.length;
}

export function opponentIndexOf(playerIndex) {
  return playerIndex === 0 ? 1 : 0;
}

// Places (or moves, if already placed) one ship for one player during the
// placement phase. Re-placing an already-placed ship just relocates it —
// there's no need to remove it first.
export function placeShip(match, playerIndex, shipId, row, col, orientation) {
  const player = match.players[playerIndex];
  if (!player) return { ok: false, error: "no-player" };
  if (player.ready) return { ok: false, error: "not-editable" };
  const def = shipDef(shipId);
  if (!def) return { ok: false, error: "unknown-ship" };

  const cells = computeShipCells(row, col, def.size, orientation);
  if (!cells.every(([r, c]) => isInBounds(r, c))) return { ok: false, error: "out-of-bounds" };

  const otherShips = player.fleet.filter((s) => s.shipId !== shipId);
  const occupied = new Set(otherShips.flatMap((s) => s.cells.map(([r, c]) => key(r, c))));
  if (cells.some(([r, c]) => occupied.has(key(r, c)))) return { ok: false, error: "overlap" };

  const nextFleet = [
    ...otherShips,
    { shipId, name: def.name, size: def.size, cells, hitCells: [], sunk: false }
  ];
  const nextPlayers = match.players.map((p, i) => (i === playerIndex ? { ...p, fleet: nextFleet } : p));
  return { ok: true, match: { ...match, players: nextPlayers } };
}

export function removeShip(match, playerIndex, shipId) {
  const player = match.players[playerIndex];
  if (!player) return { ok: false, error: "no-player" };
  if (player.ready) return { ok: false, error: "not-editable" };
  const nextFleet = player.fleet.filter((s) => s.shipId !== shipId);
  const nextPlayers = match.players.map((p, i) => (i === playerIndex ? { ...p, fleet: nextFleet } : p));
  return { ok: true, match: { ...match, players: nextPlayers } };
}

// Clears and randomly re-places every ship for one player, retrying each
// ship until it finds a spot that fits and doesn't overlap what's already
// been placed for it in this pass.
export function randomizeFleet(match, playerIndex, rng = Math.random) {
  const player = match.players[playerIndex];
  if (!player) return { ok: false, error: "no-player" };
  if (player.ready) return { ok: false, error: "not-editable" };

  const fleet = [];
  for (const def of SHIP_DEFS) {
    let placed = null;
    for (let attempt = 0; attempt < 300 && !placed; attempt++) {
      const orientation = rng() < 0.5 ? ORIENTATION.H : ORIENTATION.V;
      const row = Math.floor(rng() * BOARD_SIZE);
      const col = Math.floor(rng() * BOARD_SIZE);
      const cells = computeShipCells(row, col, def.size, orientation);
      if (!cells.every(([r, c]) => isInBounds(r, c))) continue;
      const occupied = new Set(fleet.flatMap((s) => s.cells.map(([r, c]) => key(r, c))));
      if (cells.some(([r, c]) => occupied.has(key(r, c)))) continue;
      placed = { shipId: def.id, name: def.name, size: def.size, cells, hitCells: [], sunk: false };
    }
    // 300 attempts on a 10x10 board with room for the whole classic fleet
    // effectively never fails, but a dropped ship here would leave the
    // fleet permanently incomplete, so surface it rather than pretend.
    if (!placed) return { ok: false, error: "no-space" };
    fleet.push(placed);
  }
  const nextPlayers = match.players.map((p, i) => (i === playerIndex ? { ...p, fleet } : p));
  return { ok: true, match: { ...match, players: nextPlayers } };
}

// Locks in a player's fleet. Once both players are ready, the match moves
// to the battle phase with player 0 firing first.
export function confirmFleet(match, playerIndex) {
  const player = match.players[playerIndex];
  if (!player) return { ok: false, error: "no-player" };
  if (!isFleetComplete(player)) return { ok: false, error: "incomplete" };

  const nextPlayers = match.players.map((p, i) => (i === playerIndex ? { ...p, ready: true } : p));
  const allReady = nextPlayers.every((p) => p.ready);
  return {
    ok: true,
    match: { ...match, players: nextPlayers, phase: allReady ? "battle" : "placement" }
  };
}

// Resolves one shot. Turns always alternate regardless of hit/miss, which
// keeps pacing predictable and every phone's "whose turn" state trivial to
// derive from `turnIndex` alone.
export function fireAt(match, playerIndex, row, col) {
  if (match.phase !== "battle") return { ok: false, error: "not-battle" };
  if (match.turnIndex !== playerIndex) return { ok: false, error: "not-your-turn" };
  if (!isInBounds(row, col)) return { ok: false, error: "out-of-bounds" };

  const opponentIndex = opponentIndexOf(playerIndex);
  const opponent = match.players[opponentIndex];
  const k = key(row, col);
  if (opponent.shots[k]) return { ok: false, error: "already-attacked" };

  const hitShip = opponent.fleet.find((s) => s.cells.some(([r, c]) => r === row && c === col));
  const result = hitShip ? "hit" : "miss";

  let sunk = false;
  const nextFleet = opponent.fleet.map((s) => {
    if (s !== hitShip) return s;
    const hitCells = [...s.hitCells, k];
    sunk = hitCells.length === s.size;
    return { ...s, hitCells, sunk };
  });

  const nextOpponent = { ...opponent, fleet: nextFleet, shots: { ...opponent.shots, [k]: result } };

  let scoreGain = result === "hit" ? HIT_POINTS : 0;
  if (sunk) scoreGain += SINK_BONUS;
  const allSunk = nextFleet.every((s) => s.sunk);
  const winnerIndex = allSunk ? playerIndex : null;
  if (winnerIndex !== null) scoreGain += WIN_BONUS;

  const attacker = match.players[playerIndex];
  const nextAttacker = { ...attacker, score: attacker.score + scoreGain };

  const nextPlayers = match.players.map((p, i) => {
    if (i === opponentIndex) return nextOpponent;
    if (i === playerIndex) return nextAttacker;
    return p;
  });

  return {
    ok: true,
    match: {
      ...match,
      players: nextPlayers,
      phase: winnerIndex !== null ? "over" : "battle",
      winnerIndex,
      turnIndex: winnerIndex !== null ? match.turnIndex : opponentIndex,
      lastShot: { by: playerIndex, row, col, result, shipId: hitShip?.shipId || null, sunk }
    }
  };
}

// ---------- redacted view builders ----------
// These are the only functions allowed to touch a player's private `fleet`
// cell data directly — everything else (App.jsx, the phone components)
// consumes their output instead of `match.players` fields directly, so a
// leak would have to be introduced right here where it's easy to audit.

// Full detail for a player's own board — safe only for that player's phone.
export function ownBoardView(player) {
  const cells = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const ship = player.fleet.find((s) => s.cells.some(([r, c]) => r === row && c === col));
      cells.push({
        row,
        col,
        shipId: ship?.shipId || null,
        sunk: ship?.sunk || false,
        shot: player.shots[key(row, col)] || null
      });
    }
  }
  return {
    cells,
    fleet: player.fleet.map((s) => ({ shipId: s.shipId, name: s.name, size: s.size, sunk: s.sunk }))
  };
}

// Fog-of-war view of a player's board, safe to show to their opponent or on
// the shared TV: only shot outcomes, plus the full outline of a ship once
// every one of its cells has been hit (i.e. sunk) — never an unsunk ship's
// position.
export function publicBoardView(player) {
  const cells = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const shot = player.shots[key(row, col)] || null;
      const sunkShip = player.fleet.find(
        (s) => s.sunk && s.cells.some(([r, c]) => r === row && c === col)
      );
      cells.push({ row, col, shot, sunk: !!sunkShip, shipId: sunkShip?.shipId || null });
    }
  }
  const sunkCount = player.fleet.filter((s) => s.sunk).length;
  return { cells, sunkCount, totalShips: SHIP_DEFS.length };
}
