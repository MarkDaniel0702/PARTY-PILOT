// Pure Connect Four rules engine — no React, no network, no DOM. Same shape as
// the other engines: the host owns one state object, every action returns a
// new one, and an invalid action returns the *same* object by reference so a
// caller can detect a no-op with `next === state`.

export const COLS = 7;
export const ROWS = 6;
export const WIN_LENGTH = 4;

// The board is a flat array, row-major, row 0 at the TOP — the order it is
// drawn in. Cells hold null (empty) or the player index (0 or 1) that owns it.
export const cellIndex = (row, col) => row * COLS + col;

export function createGame({ first = 0 } = {}) {
  return {
    board: Array(COLS * ROWS).fill(null),
    first, // who moved first this game — rematches hand it to the other player
    turn: first,
    moves: 0,
    winner: null, // null while playing, then 0 | 1 | "draw"
    line: null, // the winning run as [row, col] pairs (4, or more if a disc joined two runs)
    lastMove: null // { row, col, player }
  };
}

export function isColumnFull(board, col) {
  return board[cellIndex(0, col)] !== null;
}

// Lowest empty row in a column (where a disc dropped there lands), or -1.
export function landingRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[cellIndex(row, col)] === null) return row;
  }
  return -1;
}

export function legalColumns(state) {
  if (state.winner !== null) return [];
  const cols = [];
  for (let col = 0; col < COLS; col++) if (!isColumnFull(state.board, col)) cols.push(col);
  return cols;
}

const DIRECTIONS = [
  [0, 1], // across
  [1, 0], // down
  [1, 1], // diagonal \
  [1, -1] // diagonal /
];

// The winning run through (row, col), if the disc there just made one. Looks
// both ways along each axis, so a disc dropped into the *middle* of a gap
// still counts.
export function findWinningLine(board, row, col, player) {
  for (const [dr, dc] of DIRECTIONS) {
    const run = [[row, col]];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[cellIndex(r, c)] === player) {
        if (sign === 1) run.push([r, c]);
        else run.unshift([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (run.length >= WIN_LENGTH) return run; // a disc that joins two runs lights all of it
  }
  return null;
}

export function dropDisc(state, player, col) {
  if (state.winner !== null) return state;
  if (player !== state.turn) return state;
  if (!Number.isInteger(col) || col < 0 || col >= COLS) return state;
  const row = landingRow(state.board, col);
  if (row === -1) return state;

  const board = state.board.slice();
  board[cellIndex(row, col)] = player;
  const line = findWinningLine(board, row, col, player);
  const moves = state.moves + 1;
  const winner = line ? player : moves === ROWS * COLS ? "draw" : null;
  return {
    ...state,
    board,
    moves,
    winner,
    line,
    turn: winner === null ? 1 - player : state.turn,
    lastMove: { row, col, player }
  };
}

// Used when a turn clock runs out, or to play on for a player who can't:
// prefers the middle of the board, like most people would.
export function pickFallbackColumn(state, rng = Math.random) {
  const legal = legalColumns(state);
  if (legal.length === 0) return -1;
  const centre = (COLS - 1) / 2;
  const best = Math.min(...legal.map((c) => Math.abs(c - centre)));
  const nearest = legal.filter((c) => Math.abs(c - centre) === best);
  return nearest[Math.floor(rng() * nearest.length)];
}

// Compact board for a phone: one character per cell, row-major from the top.
export function encodeBoard(board) {
  return board.map((c) => (c === null ? "." : String(c))).join("");
}

export function decodeBoard(str) {
  return Array.from(str, (ch) => (ch === "." ? null : Number(ch)));
}

// First to `target` game wins takes the series. Pure so the App stays dumb.
export function seriesWinner(wins, target) {
  if (wins[0] >= target) return 0;
  if (wins[1] >= target) return 1;
  return null;
}
