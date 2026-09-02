import { PIECES, cellsOf, kicksFor } from "./pieces";

// Tetris rules engine — pure, deterministic, no DOM and no timers.
//
// Gravity is advanced by explicit `stepGravity` calls rather than reading a
// clock, so a whole match can be replayed in a test (engine.test.js) without
// a browser. The phone runs this locally, which is what makes input feel
// instant; the host only receives snapshots for the TV.

export const COLS = 10;
export const ROWS = 20;
// Two hidden rows above the visible board give pieces somewhere to spawn.
export const HIDDEN = 2;
export const TOTAL_ROWS = ROWS + HIDDEN;

export const LOCK_DELAY_STEPS = 2;
// Standard competitive garbage: singles send nothing, a Tetris sends four.
export const GARBAGE_FOR_LINES = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 4 };
const LINE_SCORES = { 1: 100, 2: 300, 3: 500, 4: 800 };

export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function emptyBoard() {
  return Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
}

// 7-bag: every seven pieces contains each tetromino exactly once, so you
// never get a long I-drought. Shared seed => every player gets the same
// sequence, which is what makes a race fair.
function refillBag(bag, rng) {
  const next = PIECES.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return bag.concat(next);
}

function ensureQueue(state, minLength = 6) {
  let bag = state.bag;
  while (bag.length < minLength) bag = refillBag(bag, state.rng);
  return bag;
}

function spawnPiece(type) {
  return { type, rotation: 0, x: 3, y: 0 };
}

export function createGame({ seed = 1, mode = "battle" } = {}) {
  const rng = makeRng(seed);
  const base = { rng, bag: [] };
  const bag = ensureQueue(base);
  const [first, ...rest] = bag;
  return {
    rng,
    mode,
    board: emptyBoard(),
    piece: spawnPiece(first),
    bag: rest,
    hold: null,
    canHold: true,
    lockSteps: 0,
    score: 0,
    lines: 0,
    level: 1,
    pendingGarbage: 0,
    garbageSent: 0,
    over: false,
    lastClear: 0,
    clearId: 0
  };
}

export function nextQueue(state, count = 5) {
  return state.bag.slice(0, count);
}

// ---------- collision ----------

export function collides(board, piece, dx = 0, dy = 0, rotation = piece.rotation) {
  for (const [cx, cy] of cellsOf(piece.type, rotation)) {
    const x = piece.x + cx + dx;
    const y = piece.y + cy + dy;
    if (x < 0 || x >= COLS || y >= TOTAL_ROWS) return true;
    if (y < 0) continue;
    if (board[y][x]) return true;
  }
  return false;
}

export function move(state, dx) {
  if (state.over || collides(state.board, state.piece, dx, 0)) return state;
  return {
    ...state,
    piece: { ...state.piece, x: state.piece.x + dx },
    // Touching the floor then sliding resets the lock timer, which is what
    // lets players tuck a piece under an overhang at the last moment.
    lockSteps: 0
  };
}

export function rotate(state, dir = 1) {
  if (state.over) return state;
  const from = state.piece.rotation;
  const to = ((from + dir) % 4 + 4) % 4;
  for (const [kx, ky] of kicksFor(state.piece.type, from, to)) {
    if (!collides(state.board, state.piece, kx, ky, to)) {
      return {
        ...state,
        piece: { ...state.piece, rotation: to, x: state.piece.x + kx, y: state.piece.y + ky },
        lockSteps: 0
      };
    }
  }
  return state; // every kick blocked — rotation genuinely doesn't fit
}

export function ghostY(state) {
  let dy = 0;
  while (!collides(state.board, state.piece, 0, dy + 1)) dy++;
  return state.piece.y + dy;
}

// ---------- locking and clearing ----------

function placePiece(board, piece) {
  const next = board.map((row) => row.slice());
  for (const [cx, cy] of cellsOf(piece.type, piece.rotation)) {
    const x = piece.x + cx;
    const y = piece.y + cy;
    if (y >= 0 && y < TOTAL_ROWS && x >= 0 && x < COLS) next[y][x] = piece.type;
  }
  return next;
}

function clearLines(board) {
  const kept = board.filter((row) => row.some((c) => !c));
  const cleared = TOTAL_ROWS - kept.length;
  while (kept.length < TOTAL_ROWS) kept.unshift(Array(COLS).fill(null));
  return { board: kept, cleared };
}

// Garbage rises from the bottom with a single hole, in the same column for
// the whole batch — so it can be dug through rather than being a death
// sentence.
export function addGarbage(state, rows, holeColumn = null) {
  if (rows <= 0 || state.over) return state;
  const hole = holeColumn ?? Math.floor(state.rng() * COLS);
  // Rows pushed past the ceiling are a loss, not free disposal — without
  // this check the blocks would simply be sliced away and the player would
  // survive a burial that should have ended them.
  const overflow = state.board.slice(0, rows).some((row) => row.some(Boolean));
  let board = state.board.slice(rows);
  for (let i = 0; i < rows; i++) {
    const row = Array(COLS).fill("G");
    row[hole] = null;
    board.push(row);
  }
  // Pushing the stack up can bury the active piece; nudge it clear if so.
  let piece = state.piece;
  while (collides(board, piece) && piece.y > -HIDDEN) piece = { ...piece, y: piece.y - 1 };
  const over = overflow || collides(board, piece);
  return { ...state, board, piece, over: state.over || over };
}

function nextPieceFrom(state, board) {
  const bag = ensureQueue({ ...state, bag: state.bag });
  const [type, ...rest] = bag;
  const piece = spawnPiece(type);
  // Top-out: the new piece has nowhere to appear.
  const over = collides(board, piece);
  return { piece, bag: rest, over };
}

export function lockPiece(state) {
  if (state.over) return state;
  const placed = placePiece(state.board, state.piece);
  const { board, cleared } = clearLines(placed);

  const score = state.score + (LINE_SCORES[cleared] || 0) * state.level;
  const lines = state.lines + cleared;
  const level = Math.floor(lines / 10) + 1;
  const sent = state.mode === "battle" ? GARBAGE_FOR_LINES[cleared] || 0 : 0;

  // Incoming garbage only lands once your own clear has resolved, and a
  // clear cancels an equal amount of it first.
  let pending = state.pendingGarbage;
  let cancelled = 0;
  if (sent > 0 && pending > 0) {
    cancelled = Math.min(sent, pending);
    pending -= cancelled;
  }

  let next = {
    ...state,
    board,
    score,
    lines,
    level,
    lockSteps: 0,
    canHold: true,
    lastClear: cleared,
    // Bumped once per clearing lock. The host samples boards ~12x a second
    // and the engine clears lines the instant a piece locks, so without a
    // counter to compare against, a clear can happen entirely between two
    // snapshots and the TV has nothing to celebrate.
    clearId: state.clearId + (cleared > 0 ? 1 : 0),
    garbageSent: state.garbageSent + Math.max(0, sent - cancelled),
    pendingGarbage: 0
  };

  if (pending > 0) next = addGarbage(next, pending);

  const spawned = nextPieceFrom(next, next.board);
  return { ...next, piece: spawned.piece, bag: spawned.bag, over: next.over || spawned.over };
}

// One gravity step. Returns the state unchanged in shape but with the piece
// a row lower, or locked once it has rested for LOCK_DELAY_STEPS.
export function stepGravity(state) {
  if (state.over) return state;
  if (!collides(state.board, state.piece, 0, 1)) {
    return { ...state, piece: { ...state.piece, y: state.piece.y + 1 }, lockSteps: 0 };
  }
  if (state.lockSteps + 1 < LOCK_DELAY_STEPS) {
    return { ...state, lockSteps: state.lockSteps + 1 };
  }
  return lockPiece(state);
}

export function softDrop(state) {
  if (state.over) return state;
  if (collides(state.board, state.piece, 0, 1)) return lockPiece(state);
  return { ...state, score: state.score + 1, piece: { ...state.piece, y: state.piece.y + 1 }, lockSteps: 0 };
}

export function hardDrop(state) {
  if (state.over) return state;
  let dy = 0;
  while (!collides(state.board, state.piece, 0, dy + 1)) dy++;
  const dropped = {
    ...state,
    score: state.score + dy * 2,
    piece: { ...state.piece, y: state.piece.y + dy }
  };
  return lockPiece(dropped);
}

export function holdPiece(state) {
  if (state.over || !state.canHold) return state;
  const current = state.piece.type;
  if (state.hold) {
    const piece = spawnPiece(state.hold);
    if (collides(state.board, piece)) return { ...state, over: true };
    return { ...state, hold: current, piece, canHold: false };
  }
  const spawned = nextPieceFrom(state, state.board);
  return {
    ...state,
    hold: current,
    piece: spawned.piece,
    bag: spawned.bag,
    canHold: false,
    over: state.over || spawned.over
  };
}

export function queueGarbage(state, rows) {
  if (rows <= 0) return state;
  return { ...state, pendingGarbage: state.pendingGarbage + rows };
}

// Gravity interval in milliseconds for the current level — the speed curve.
export function dropIntervalMs(level) {
  return Math.max(80, 800 - (level - 1) * 65);
}

// Compact board snapshot for the TV. Only the visible rows, one character
// per cell — small enough to send many times a second for several players.
export function snapshot(state) {
  const ghost = ghostY(state);
  const cells = state.board.slice(HIDDEN).map((row) => row.map((c) => c || "."));
  const write = (y, x, ch) => {
    const vy = y - HIDDEN;
    if (vy >= 0 && vy < ROWS && x >= 0 && x < COLS) cells[vy][x] = ch;
  };
  if (!state.over) {
    for (const [cx, cy] of cellsOf(state.piece.type, state.piece.rotation)) {
      write(ghost + cy, state.piece.x + cx, "g");
    }
    for (const [cx, cy] of cellsOf(state.piece.type, state.piece.rotation)) {
      write(state.piece.y + cy, state.piece.x + cx, state.piece.type);
    }
  }
  return {
    cells: cells.map((r) => r.join("")).join("|"),
    score: state.score,
    lines: state.lines,
    level: state.level,
    over: state.over,
    // Everything below exists for the TV: it can't see a clear happen, or
    // know what's queued, unless the phone says so. A handful of bytes next
    // to the cells string.
    piece: state.over ? null : { t: state.piece.type, x: state.piece.x, y: state.piece.y, r: state.piece.rotation },
    clear: state.lastClear,
    clearId: state.clearId,
    pending: state.pendingGarbage,
    hold: state.hold,
    next: state.bag.slice(0, 3)
  };
}

export function parseSnapshot(str) {
  return str.split("|").map((r) => r.split(""));
}
