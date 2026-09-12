import { describe, it, expect } from "vitest";
import {
  BOARD_SIZE,
  SHIP_DEFS,
  ORIENTATION,
  createMatch,
  placeShip,
  removeShip,
  randomizeFleet,
  isFleetComplete,
  confirmFleet,
  fireAt,
  ownBoardView,
  publicBoardView,
  isInBounds,
  cellLabel
} from "./engine";

function twoPlayerMatch() {
  return createMatch([
    { playerId: "p1", name: "Alice" },
    { playerId: "p2", name: "Bob" }
  ]);
}

function placeAllShips(match, playerIndex) {
  // Lays every ship out horizontally, one per row starting at row 0, in
  // SHIP_DEFS order — so row i is always SHIP_DEFS[i], cols [0, size).
  let m = match;
  let row = 0;
  for (const def of SHIP_DEFS) {
    const res = placeShip(m, playerIndex, def.id, row, 0, ORIENTATION.H);
    expect(res.ok).toBe(true);
    m = res.match;
    row += 1;
  }
  return m;
}

function readyBothPlayers(match) {
  let m = placeAllShips(match, 0);
  m = placeAllShips(m, 1);
  let res = confirmFleet(m, 0);
  expect(res.ok).toBe(true);
  m = res.match;
  res = confirmFleet(m, 1);
  expect(res.ok).toBe(true);
  return res.match;
}

describe("createMatch", () => {
  it("starts in placement with two unready players and no winner", () => {
    const m = twoPlayerMatch();
    expect(m.phase).toBe("placement");
    expect(m.players).toHaveLength(2);
    expect(m.players.every((p) => !p.ready)).toBe(true);
    expect(m.winnerIndex).toBeNull();
  });
});

describe("placement", () => {
  it("places a ship at the requested cells", () => {
    const res = placeShip(twoPlayerMatch(), 0, "destroyer", 2, 3, ORIENTATION.H);
    expect(res.ok).toBe(true);
    const ship = res.match.players[0].fleet.find((s) => s.shipId === "destroyer");
    expect(ship.cells).toEqual([[2, 3], [2, 4]]);
  });

  it("places vertically along the column", () => {
    const res = placeShip(twoPlayerMatch(), 0, "destroyer", 2, 3, ORIENTATION.V);
    expect(res.match.players[0].fleet[0].cells).toEqual([[2, 3], [3, 3]]);
  });

  it("rejects a ship that runs off the board", () => {
    const res = placeShip(twoPlayerMatch(), 0, "carrier", 0, 8, ORIENTATION.H);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("out-of-bounds");
  });

  it("rejects a ship that overlaps another already-placed ship", () => {
    let m = placeShip(twoPlayerMatch(), 0, "destroyer", 0, 0, ORIENTATION.H).match;
    const res = placeShip(m, 0, "cruiser", 0, 1, ORIENTATION.H);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("overlap");
  });

  it("lets a ship be moved by re-placing the same shipId", () => {
    let m = placeShip(twoPlayerMatch(), 0, "destroyer", 0, 0, ORIENTATION.H).match;
    const res = placeShip(m, 0, "destroyer", 5, 5, ORIENTATION.V);
    expect(res.ok).toBe(true);
    expect(res.match.players[0].fleet).toHaveLength(1);
    expect(res.match.players[0].fleet[0].cells).toEqual([[5, 5], [6, 5]]);
  });

  it("does not let one player's ships collide with the other player's board", () => {
    // Player 1's placement is entirely independent state — placing on the
    // same coordinates for player 2 must never be blocked by player 1's ships.
    let m = placeShip(twoPlayerMatch(), 0, "destroyer", 0, 0, ORIENTATION.H).match;
    const res = placeShip(m, 1, "destroyer", 0, 0, ORIENTATION.H);
    expect(res.ok).toBe(true);
  });

  it("removeShip clears a placed ship", () => {
    let m = placeShip(twoPlayerMatch(), 0, "destroyer", 0, 0, ORIENTATION.H).match;
    const res = removeShip(m, 0, "destroyer");
    expect(res.ok).toBe(true);
    expect(res.match.players[0].fleet).toHaveLength(0);
  });

  it("refuses to edit a fleet that has already been confirmed", () => {
    let m = placeAllShips(twoPlayerMatch(), 0);
    m = confirmFleet(m, 0).match;
    const res = placeShip(m, 0, "destroyer", 9, 9, ORIENTATION.H);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("not-editable");
  });

  it("randomizeFleet places every ship without overlaps or out-of-bounds cells", () => {
    const res = randomizeFleet(twoPlayerMatch(), 0);
    expect(res.ok).toBe(true);
    const fleet = res.match.players[0].fleet;
    expect(fleet).toHaveLength(SHIP_DEFS.length);
    const seen = new Set();
    for (const ship of fleet) {
      for (const [r, c] of ship.cells) {
        expect(isInBounds(r, c)).toBe(true);
        const k = `${r},${c}`;
        expect(seen.has(k)).toBe(false);
        seen.add(k);
      }
    }
  });
});

describe("confirmFleet", () => {
  it("refuses to confirm an incomplete fleet", () => {
    const res = confirmFleet(twoPlayerMatch(), 0);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("incomplete");
  });

  it("moves to battle only once both players are ready", () => {
    let m = placeAllShips(twoPlayerMatch(), 0);
    m = confirmFleet(m, 0).match;
    expect(m.phase).toBe("placement");
    expect(isFleetComplete(m.players[0])).toBe(true);

    m = placeAllShips(m, 1);
    m = confirmFleet(m, 1).match;
    expect(m.phase).toBe("battle");
    expect(m.turnIndex).toBe(0);
  });
});

describe("fireAt", () => {
  it("rejects an attack outside the battle phase", () => {
    const res = fireAt(twoPlayerMatch(), 0, 0, 0);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("not-battle");
  });

  it("rejects an attack from the player who isn't on turn", () => {
    const m = readyBothPlayers(twoPlayerMatch());
    const res = fireAt(m, 1, 0, 0);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("not-your-turn");
  });

  it("records a hit, advances score, and passes the turn", () => {
    const m = readyBothPlayers(twoPlayerMatch());
    // placeAllShips lays ship i (SHIP_DEFS order) at row i, cols [0, size) —
    // row 0 is always the carrier, so (0,0) is a guaranteed hit.
    const res = fireAt(m, 0, 0, 0);
    expect(res.ok).toBe(true);
    expect(res.match.lastShot.result).toBe("hit");
    expect(res.match.players[0].score).toBeGreaterThan(0);
    expect(res.match.turnIndex).toBe(1);
  });

  it("records a miss with no score and passes the turn", () => {
    const m = readyBothPlayers(twoPlayerMatch());
    // Row 9 is left empty by placeAllShips (5 ships occupy rows 0-4).
    const res = fireAt(m, 0, 9, 9);
    expect(res.ok).toBe(true);
    expect(res.match.lastShot.result).toBe("miss");
    expect(res.match.players[0].score).toBe(0);
    expect(res.match.turnIndex).toBe(1);
  });

  it("rejects a second attack on an already-attacked cell", () => {
    let m = readyBothPlayers(twoPlayerMatch());
    m = fireAt(m, 0, 9, 9).match;
    m = fireAt(m, 1, 0, 0).match; // pass the turn back to player 0
    const res = fireAt(m, 0, 9, 9);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("already-attacked");
  });

  it("sinks a ship once every one of its cells is hit and awards the bonus", () => {
    // Destroyer (size 2) is the last SHIP_DEFS entry, so placeAllShips puts
    // it at row 4, cols 0-1.
    let m = readyBothPlayers(twoPlayerMatch());
    m = fireAt(m, 0, 4, 0).match; // hit
    m = fireAt(m, 1, 9, 9).match; // pass back
    const res = fireAt(m, 0, 4, 1); // second and final hit — sinks it
    expect(res.ok).toBe(true);
    expect(res.match.lastShot.sunk).toBe(true);
    const destroyer = res.match.players[1].fleet.find((s) => s.shipId === "destroyer");
    expect(destroyer.sunk).toBe(true);
  });

  it("declares a winner once every enemy ship is sunk and stops turn rotation", () => {
    let m = readyBothPlayers(twoPlayerMatch());
    let filler = 0;
    // placeAllShips lays ship i (SHIP_DEFS order) at row i, cols [0, size) —
    // sweep every occupied cell to sink the whole fleet, alternating a
    // harmless player-1 shot into rows 8-9 (both empty on player 0's board)
    // to keep turn order legal. There are 16 filler shots needed (17 total
    // hits minus the final, winning one), which fits in those 20 free cells.
    outer: for (let row = 0; row < SHIP_DEFS.length; row++) {
      const size = SHIP_DEFS[row].size;
      for (let col = 0; col < size; col++) {
        const res = fireAt(m, 0, row, col);
        expect(res.ok).toBe(true);
        m = res.match;
        if (m.phase === "over") break outer;
        const fillerRes = fireAt(m, 1, 8 + Math.floor(filler / BOARD_SIZE), filler % BOARD_SIZE);
        expect(fillerRes.ok).toBe(true);
        m = fillerRes.match;
        filler++;
      }
    }
    expect(m.phase).toBe("over");
    expect(m.winnerIndex).toBe(0);
    expect(m.players[0].score).toBeGreaterThanOrEqual(100);
  });
});

describe("redacted views", () => {
  it("ownBoardView exposes the player's own ship positions", () => {
    const m = placeAllShips(twoPlayerMatch(), 0);
    const view = ownBoardView(m.players[0]);
    const shipCells = view.cells.filter((c) => c.shipId);
    expect(shipCells.length).toBe(SHIP_DEFS.reduce((sum, s) => sum + s.size, 0));
  });

  it("publicBoardView never reveals an unsunk ship's position", () => {
    const m = placeAllShips(twoPlayerMatch(), 0);
    const view = publicBoardView(m.players[0]);
    // No cell should claim a shipId unless that ship is fully sunk.
    expect(view.cells.every((c) => !c.shipId || c.sunk)).toBe(true);
  });

  it("publicBoardView reveals a ship's full outline once it's sunk", () => {
    // Destroyer (size 2) is the last SHIP_DEFS entry, so placeAllShips puts
    // it at row 4, cols 0-1.
    let m = readyBothPlayers(twoPlayerMatch());
    m = fireAt(m, 0, 4, 0).match;
    m = fireAt(m, 1, 9, 9).match;
    m = fireAt(m, 0, 4, 1).match; // sinks player 2's destroyer
    const view = publicBoardView(m.players[1]);
    const revealed = view.cells.filter((c) => c.shipId === "destroyer");
    expect(revealed).toHaveLength(2);
    expect(view.sunkCount).toBe(1);
  });
});

describe("board coordinate helpers", () => {
  it("labels cells in standard A1 battleship notation", () => {
    expect(cellLabel(0, 0)).toBe("A1");
    expect(cellLabel(9, 9)).toBe("J10");
  });

  it("keeps the classic fleet within a 10x10 board", () => {
    expect(BOARD_SIZE).toBe(10);
    expect(SHIP_DEFS.reduce((sum, s) => sum + s.size, 0)).toBe(17);
  });
});
