import { describe, it, expect } from "vitest";
import {
  COLS,
  ROWS,
  cellIndex,
  createGame,
  isColumnFull,
  landingRow,
  legalColumns,
  findWinningLine,
  dropDisc,
  pickFallbackColumn,
  encodeBoard,
  decodeBoard,
  seriesWinner
} from "./engine";

// Plays a list of columns, alternating players from `first`, and returns the
// final state. Each column is asserted to be a legal move so a typo in a test
// fails loudly instead of silently skipping a turn.
function play(cols, first = 0) {
  let state = createGame({ first });
  for (const col of cols) {
    const next = dropDisc(state, state.turn, col);
    expect(next).not.toBe(state);
    state = next;
  }
  return state;
}

describe("createGame", () => {
  it("starts with an empty 7x6 board and the chosen player to move", () => {
    const g = createGame();
    expect(g.board).toHaveLength(COLS * ROWS);
    expect(g.board.every((c) => c === null)).toBe(true);
    expect(g.turn).toBe(0);
    expect(g.winner).toBe(null);
    expect(createGame({ first: 1 }).turn).toBe(1);
  });
});

describe("dropDisc", () => {
  it("lands on the bottom row of an empty column", () => {
    const g = dropDisc(createGame(), 0, 3);
    expect(g.board[cellIndex(ROWS - 1, 3)]).toBe(0);
    expect(g.lastMove).toEqual({ row: ROWS - 1, col: 3, player: 0 });
    expect(g.turn).toBe(1);
  });

  it("stacks discs in a column", () => {
    const g = play([2, 2, 2]);
    expect(g.board[cellIndex(ROWS - 1, 2)]).toBe(0);
    expect(g.board[cellIndex(ROWS - 2, 2)]).toBe(1);
    expect(g.board[cellIndex(ROWS - 3, 2)]).toBe(0);
  });

  it("ignores a move from the wrong player", () => {
    const g = createGame();
    expect(dropDisc(g, 1, 3)).toBe(g);
  });

  it("rejects out-of-range and non-integer columns", () => {
    const g = createGame();
    expect(dropDisc(g, 0, -1)).toBe(g);
    expect(dropDisc(g, 0, COLS)).toBe(g);
    expect(dropDisc(g, 0, 2.5)).toBe(g);
    expect(dropDisc(g, 0, "3")).toBe(g);
  });

  it("rejects a drop into a full column", () => {
    const g = play([0, 0, 0, 0, 0, 0]);
    expect(isColumnFull(g.board, 0)).toBe(true);
    expect(landingRow(g.board, 0)).toBe(-1);
    expect(dropDisc(g, g.turn, 0)).toBe(g);
    expect(legalColumns(g)).not.toContain(0);
  });

  it("does not mutate the previous state", () => {
    const g = createGame();
    const before = g.board.slice();
    dropDisc(g, 0, 4);
    expect(g.board).toEqual(before);
    expect(g.moves).toBe(0);
  });
});

describe("winning", () => {
  it("detects four across", () => {
    // P0: 0,1,2,3 along the bottom; P1 stacks on top meanwhile.
    const g = play([0, 0, 1, 1, 2, 2, 3]);
    expect(g.winner).toBe(0);
    expect(g.line).toEqual([
      [ROWS - 1, 0],
      [ROWS - 1, 1],
      [ROWS - 1, 2],
      [ROWS - 1, 3]
    ]);
  });

  it("detects four down", () => {
    const g = play([0, 1, 0, 1, 0, 1, 0]);
    expect(g.winner).toBe(0);
    expect(g.line).toHaveLength(4);
  });

  it("detects both diagonals", () => {
    // Rising diagonal for player 0: (5,0) (4,1) (3,2) (2,3)
    const rising = play([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);
    expect(rising.winner).toBe(0);
    // Falling diagonal for player 1, mirrored.
    const falling = play([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3], 1);
    expect(falling.winner).toBe(1);
  });

  it("counts a disc dropped into the middle of a gap", () => {
    const board = Array(COLS * ROWS).fill(null);
    const row = ROWS - 1;
    [0, 1, 3].forEach((c) => (board[cellIndex(row, c)] = 0));
    board[cellIndex(row, 2)] = 0;
    expect(findWinningLine(board, row, 2, 0)).toHaveLength(4);
  });

  it("lights up the whole run when one disc joins two runs", () => {
    const board = Array(COLS * ROWS).fill(null);
    const row = ROWS - 1;
    [0, 1, 2, 4, 5].forEach((c) => (board[cellIndex(row, c)] = 1));
    board[cellIndex(row, 3)] = 1;
    expect(findWinningLine(board, row, 3, 1)).toHaveLength(6);
  });

  it("does not call three in a row a win", () => {
    const g = play([0, 0, 1, 1, 2]);
    expect(g.winner).toBe(null);
    expect(g.line).toBe(null);
  });

  it("stops accepting moves once someone has won", () => {
    const g = play([0, 0, 1, 1, 2, 2, 3]);
    expect(dropDisc(g, g.turn, 4)).toBe(g);
    expect(legalColumns(g)).toEqual([]);
  });

  it("calls a full board with no line a draw", () => {
    // A known full-board draw: columns filled in an order that never makes four.
    const order = [
      0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, // cols 0,1 filled alternating
      2, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3, 2,
      4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4,
      6, 6, 6, 6, 6, 6
    ];
    const g = play(order);
    expect(g.moves).toBe(ROWS * COLS);
    expect(g.winner).toBe("draw");
  });
});

describe("pickFallbackColumn", () => {
  it("prefers the centre column on an empty board", () => {
    expect(pickFallbackColumn(createGame())).toBe(3);
  });

  it("only ever picks a legal column", () => {
    const g = play([3, 3, 3, 3, 3, 3]); // centre is full
    for (let i = 0; i < 20; i++) {
      const col = pickFallbackColumn(g, Math.random);
      expect(legalColumns(g)).toContain(col);
    }
  });

  it("returns -1 when nothing is playable", () => {
    const won = play([0, 0, 1, 1, 2, 2, 3]);
    expect(pickFallbackColumn(won)).toBe(-1);
  });
});

describe("encodeBoard", () => {
  it("round-trips through the compact phone format", () => {
    const g = play([3, 3, 4, 2]);
    const text = encodeBoard(g.board);
    expect(text).toHaveLength(COLS * ROWS);
    expect(decodeBoard(text)).toEqual(g.board);
  });
});

describe("seriesWinner", () => {
  it("is null until someone reaches the target", () => {
    expect(seriesWinner([1, 1], 2)).toBe(null);
    expect(seriesWinner([2, 1], 2)).toBe(0);
    expect(seriesWinner([0, 3], 3)).toBe(1);
  });
});
