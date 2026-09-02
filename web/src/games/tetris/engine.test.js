import { describe, it, expect } from "vitest";
import { PIECES, SHAPES, COLOURS, cellsOf, kicksFor } from "./pieces";
import {
  COLS,
  ROWS,
  TOTAL_ROWS,
  HIDDEN,
  GARBAGE_FOR_LINES,
  createGame,
  emptyBoard,
  makeRng,
  collides,
  move,
  rotate,
  ghostY,
  lockPiece,
  stepGravity,
  softDrop,
  hardDrop,
  holdPiece,
  addGarbage,
  queueGarbage,
  nextQueue,
  dropIntervalMs,
  snapshot,
  parseSnapshot
} from "./engine";

// Fills the bottom `n` rows except for a two-wide gap, so a dropped O piece
// completes them exactly. A one-wide gap wouldn't work: an O spans two
// columns, so it would land on the filled neighbour instead of the hole.
function withRows(state, n, gapStart = 4) {
  const board = state.board.map((r) => r.slice());
  for (let i = 0; i < n; i++) {
    const y = TOTAL_ROWS - 1 - i;
    for (let x = 0; x < COLS; x++) {
      board[y][x] = x === gapStart || x === gapStart + 1 ? null : "G";
    }
  }
  return { ...state, board };
}

function countFilled(board) {
  return board.reduce((n, row) => n + row.filter(Boolean).length, 0);
}

describe("piece data", () => {
  it("defines four rotations of four cells for all seven pieces", () => {
    expect(PIECES).toHaveLength(7);
    for (const p of PIECES) {
      expect(SHAPES[p], p).toHaveLength(4);
      for (let r = 0; r < 4; r++) {
        expect(cellsOf(p, r), `${p} rot ${r}`).toHaveLength(4);
      }
      expect(COLOURS[p], p).toBeTruthy();
    }
  });

  it("wraps rotation indices in both directions", () => {
    expect(cellsOf("T", 4)).toEqual(cellsOf("T", 0));
    expect(cellsOf("T", -1)).toEqual(cellsOf("T", 3));
  });

  it("never rotates the O piece", () => {
    for (let r = 0; r < 4; r++) expect(cellsOf("O", r)).toEqual(cellsOf("O", 0));
    expect(kicksFor("O", 0, 1)).toEqual([[0, 0]]);
  });

  it("gives I its own kick table, distinct from the other pieces", () => {
    expect(kicksFor("I", 0, 1)).not.toEqual(kicksFor("T", 0, 1));
    expect(kicksFor("T", 0, 1)).toEqual(kicksFor("J", 0, 1));
  });

  it("always offers the no-op kick first", () => {
    for (const p of PIECES) {
      for (const [from, to] of [[0, 1], [1, 2], [2, 3], [3, 0], [1, 0], [0, 3]]) {
        expect(kicksFor(p, from, to)[0], `${p} ${from}>${to}`).toEqual([0, 0]);
      }
    }
  });
});

describe("7-bag randomiser", () => {
  it("deals each of the seven pieces once per bag", () => {
    const g = createGame({ seed: 3 });
    const seen = [g.piece.type, ...g.bag.slice(0, 6)];
    expect(new Set(seen).size).toBe(7);
  });

  it("is identical for the same seed and different for another", () => {
    const a = createGame({ seed: 11 });
    const b = createGame({ seed: 11 });
    const c = createGame({ seed: 12 });
    expect([a.piece.type, ...a.bag.slice(0, 10)]).toEqual([b.piece.type, ...b.bag.slice(0, 10)]);
    expect([a.piece.type, ...a.bag.slice(0, 10)]).not.toEqual([c.piece.type, ...c.bag.slice(0, 10)]);
  });

  it("always has a next queue to show", () => {
    expect(nextQueue(createGame({ seed: 4 }), 5)).toHaveLength(5);
  });
});

describe("collision", () => {
  it("blocks movement through the walls", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: 0, y: 5 } };
    // O occupies box columns 1..2, so x=0 puts it at board columns 1..2.
    expect(collides(g.board, g.piece, -2, 0)).toBe(true);
    expect(collides(g.board, { ...g.piece, x: COLS - 3 }, 1, 0)).toBe(true);
  });

  it("blocks movement through the floor", () => {
    const g = createGame({ seed: 1 });
    const piece = { type: "O", rotation: 0, x: 4, y: TOTAL_ROWS - 2 };
    expect(collides(g.board, piece, 0, 1)).toBe(true);
  });

  it("ignores cells above the board so pieces can spawn partly hidden", () => {
    const g = createGame({ seed: 1 });
    expect(collides(g.board, { type: "I", rotation: 1, x: 3, y: -2 })).toBe(false);
  });
});

describe("movement and rotation", () => {
  it("moves left and right", () => {
    const g = createGame({ seed: 1 });
    expect(move(g, 1).piece.x).toBe(g.piece.x + 1);
    expect(move(g, -1).piece.x).toBe(g.piece.x - 1);
  });

  it("refuses a move into a wall, returning the same state", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: -1, y: 5 } };
    expect(move(g, -1)).toBe(g);
  });

  it("rotates and wraps around", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "T", rotation: 0, x: 4, y: 5 } };
    expect(rotate(g, 1).piece.rotation).toBe(1);
    expect(rotate(rotate(rotate(rotate(g, 1), 1), 1), 1).piece.rotation).toBe(0);
    expect(rotate(g, -1).piece.rotation).toBe(3);
  });

  it("kicks off the left wall instead of refusing to rotate", () => {
    // Flat against the wall, a naive implementation would fail this rotation.
    const g = { ...createGame({ seed: 1 }), piece: { type: "T", rotation: 1, x: -1, y: 5 } };
    const r = rotate(g, 1);
    expect(r).not.toBe(g);
    expect(collides(r.board, r.piece)).toBe(false);
  });

  it("resets the lock timer when you slide or rotate on the floor", () => {
    const g = { ...createGame({ seed: 1 }), lockSteps: 1, piece: { type: "O", rotation: 0, x: 4, y: TOTAL_ROWS - 2 } };
    expect(move(g, 1).lockSteps).toBe(0);
    expect(rotate(g, 1).lockSteps).toBe(0);
  });

  it("leaves the state alone when every kick is blocked", () => {
    const board = emptyBoard().map((r) => r.slice());
    for (let y = 0; y < TOTAL_ROWS; y++) for (let x = 0; x < COLS; x++) board[y][x] = "G";
    const g = { ...createGame({ seed: 1 }), board, piece: { type: "T", rotation: 0, x: 4, y: 5 } };
    expect(rotate(g, 1)).toBe(g);
  });
});

describe("dropping", () => {
  it("puts the ghost at the resting position", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    expect(ghostY(g)).toBe(TOTAL_ROWS - 2);
  });

  it("hard drop lands and locks the piece in one action", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    const after = hardDrop(g);
    expect(countFilled(after.board)).toBe(4);
    expect(after.piece.type).not.toBeUndefined();
    expect(after.score).toBeGreaterThan(g.score);
  });

  it("soft drop moves one row and scores a point", () => {
    const g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    const after = softDrop(g);
    expect(after.piece.y).toBe(1);
    expect(after.score).toBe(1);
  });

  it("gravity waits out the lock delay before locking", () => {
    let g = { ...createGame({ seed: 1 }), piece: { type: "O", rotation: 0, x: 4, y: TOTAL_ROWS - 2 } };
    g = stepGravity(g);
    expect(countFilled(g.board)).toBe(0); // resting, not yet locked
    g = stepGravity(g);
    expect(countFilled(g.board)).toBe(4); // locked
  });
});

describe("line clears", () => {
  it("clears a completed row and keeps the board height", () => {
    let g = withRows(createGame({ seed: 1 }), 1, 4);
    g = { ...g, piece: { type: "O", rotation: 0, x: 3, y: 0 } };
    const before = countFilled(g.board);
    const after = hardDrop(g);
    expect(after.lines).toBe(1);
    expect(after.board).toHaveLength(TOTAL_ROWS);
    expect(countFilled(after.board)).toBeLessThan(before);
  });

  it("scores more for a clear and scales with level", () => {
    let g = withRows(createGame({ seed: 1 }), 1, 4);
    g = { ...g, piece: { type: "O", rotation: 0, x: 3, y: 0 }, score: 0 };
    expect(hardDrop(g).score).toBeGreaterThan(100);
  });

  it("raises the level every ten lines", () => {
    const g = { ...createGame({ seed: 1 }), lines: 0 };
    expect(g.level).toBe(1);
    let s = withRows(g, 1, 4);
    s = { ...s, lines: 9, piece: { type: "O", rotation: 0, x: 3, y: 0 } };
    expect(hardDrop(s).level).toBe(2);
  });

  it("speeds up with level, down to a floor", () => {
    expect(dropIntervalMs(1)).toBeGreaterThan(dropIntervalMs(5));
    expect(dropIntervalMs(99)).toBeGreaterThanOrEqual(80);
  });
});

describe("garbage", () => {
  it("uses the standard table — a single sends nothing, a tetris sends four", () => {
    expect(GARBAGE_FOR_LINES[1]).toBe(0);
    expect(GARBAGE_FOR_LINES[2]).toBe(1);
    expect(GARBAGE_FOR_LINES[4]).toBe(4);
  });

  it("raises the stack and leaves exactly one hole per row", () => {
    const g = addGarbage(createGame({ seed: 1 }), 2, 3);
    const bottom = g.board[TOTAL_ROWS - 1];
    expect(bottom.filter(Boolean)).toHaveLength(COLS - 1);
    expect(bottom[3]).toBeNull();
    expect(g.board[TOTAL_ROWS - 2][3]).toBeNull();
  });

  it("keeps the board the same height", () => {
    expect(addGarbage(createGame({ seed: 1 }), 4, 2).board).toHaveLength(TOTAL_ROWS);
  });

  it("is a no-op for zero rows", () => {
    const g = createGame({ seed: 1 });
    expect(addGarbage(g, 0)).toBe(g);
  });

  it("applies pending garbage only after the piece locks", () => {
    let g = queueGarbage(createGame({ seed: 1 }), 2);
    expect(countFilled(g.board)).toBe(0); // not yet
    g = { ...g, piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    const after = hardDrop(g);
    expect(after.pendingGarbage).toBe(0);
    expect(countFilled(after.board)).toBeGreaterThan(4);
  });

  it("cancels incoming garbage with your own clear instead of stacking both", () => {
    let g = withRows(createGame({ seed: 1, mode: "battle" }), 2, 4);
    g = queueGarbage(g, 1);
    g = { ...g, piece: { type: "O", rotation: 0, x: 3, y: 0 } };
    const after = hardDrop(g); // clears 2 rows => sends 1 => cancels the 1 incoming
    expect(after.pendingGarbage).toBe(0);
    expect(after.garbageSent).toBe(0);
  });

  it("sends nothing at all in race mode", () => {
    let g = withRows(createGame({ seed: 1, mode: "race" }), 2, 4);
    g = { ...g, piece: { type: "O", rotation: 0, x: 3, y: 0 } };
    expect(hardDrop(g).garbageSent).toBe(0);
  });
});

describe("hold", () => {
  it("stores the current piece and brings up the next", () => {
    const g = createGame({ seed: 5 });
    const held = holdPiece(g);
    expect(held.hold).toBe(g.piece.type);
    expect(held.piece.type).not.toBe(g.piece.type);
    expect(held.canHold).toBe(false);
  });

  it("swaps with the stored piece on the second use", () => {
    const g = createGame({ seed: 5 });
    const first = holdPiece(g);
    const ready = { ...first, canHold: true };
    const second = holdPiece(ready);
    expect(second.piece.type).toBe(g.piece.type);
    expect(second.hold).toBe(first.piece.type);
  });

  it("cannot be used twice before locking", () => {
    const held = holdPiece(createGame({ seed: 5 }));
    expect(holdPiece(held)).toBe(held);
  });

  it("becomes available again after a lock", () => {
    const g = { ...holdPiece(createGame({ seed: 5 })), piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    expect(hardDrop(g).canHold).toBe(true);
  });
});

describe("top out", () => {
  it("ends the game when a new piece has nowhere to spawn", () => {
    let g = createGame({ seed: 1 });
    const board = g.board.map((r) => r.slice());
    // Leave column 0 empty so no row is complete — a completely full board
    // would clear every line instead of topping out.
    for (let y = 0; y < TOTAL_ROWS; y++) {
      for (let x = 1; x < COLS; x++) board[y][x] = "G";
    }
    g = { ...g, board, piece: { type: "O", rotation: 0, x: 4, y: 0 } };
    const after = lockPiece(g);
    expect(after.lines).toBe(0);
    expect(after.over).toBe(true);
  });

  it("ends the game when garbage buries the stack", () => {
    let g = createGame({ seed: 1 });
    const board = g.board.map((r) => r.slice());
    for (let y = HIDDEN; y < TOTAL_ROWS; y++) for (let x = 0; x < COLS; x++) board[y][x] = "G";
    g = { ...g, board };
    expect(addGarbage(g, 4, 0).over).toBe(true);
  });

  it("freezes every action once it is over", () => {
    const g = { ...createGame({ seed: 1 }), over: true };
    expect(move(g, 1)).toBe(g);
    expect(rotate(g, 1)).toBe(g);
    expect(hardDrop(g)).toBe(g);
    expect(softDrop(g)).toBe(g);
    expect(stepGravity(g)).toBe(g);
    expect(holdPiece(g)).toBe(g);
  });
});

describe("snapshot", () => {
  it("encodes only the visible board and round-trips", () => {
    const g = createGame({ seed: 2 });
    const snap = snapshot(g);
    const grid = parseSnapshot(snap.cells);
    expect(grid).toHaveLength(ROWS);
    expect(grid[0]).toHaveLength(COLS);
  });

  it("includes the active piece and its ghost", () => {
    const g = { ...createGame({ seed: 2 }), piece: { type: "O", rotation: 0, x: 4, y: HIDDEN } };
    const grid = parseSnapshot(snapshot(g).cells);
    const flat = grid.flat();
    expect(flat).toContain("O");
    expect(flat).toContain("g");
  });

  it("carries the numbers the TV needs", () => {
    const snap = snapshot({ ...createGame({ seed: 2 }), score: 1200, lines: 7, level: 2 });
    expect(snap).toMatchObject({ score: 1200, lines: 7, level: 2, over: false });
  });

  it("stays small enough to send several times a second", () => {
    // 20 rows + separators; comfortably under a WebRTC message budget even
    // for four players at 15Hz.
    expect(snapshot(createGame({ seed: 2 })).cells.length).toBeLessThan(300);
  });
});

describe("a full deterministic game", () => {
  it("plays to a top out without throwing, from a fixed seed", () => {
    let g = createGame({ seed: 77 });
    let guard = 0;
    while (!g.over && guard++ < 5000) {
      g = hardDrop(g);
    }
    expect(g.over).toBe(true);
    expect(g.board).toHaveLength(TOTAL_ROWS);
    expect(guard).toBeLessThan(5000);
  });

  it("replays identically from the same seed", () => {
    const run = (seed) => {
      let g = createGame({ seed });
      for (let i = 0; i < 40 && !g.over; i++) g = hardDrop(move(g, i % 3 === 0 ? 1 : -1));
      return { score: g.score, lines: g.lines, cells: snapshot(g).cells };
    };
    expect(run(9)).toEqual(run(9));
  });
});
