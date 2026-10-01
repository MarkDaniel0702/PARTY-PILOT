import { describe, it, expect } from "vitest";
import {
  COLS,
  ROWS,
  START_LENGTH,
  FOOD_POINTS,
  GOLDEN_VALUE,
  KILL_POINTS,
  RESPAWN_TICKS,
  spawnPoints,
  createGame,
  queueTurn,
  step,
  aliveSnakes,
  snakeById,
  isWall,
  tickMs,
  standings,
  makeRng
} from "./engine";

const seats = (...ids) => ids.map((id) => ({ id }));

// A small empty arena with hand-placed snakes, so each rule can be probed with
// no randomness: `snakes` is [{ id, body: [[x,y]...], dir }].
function arena(snakes, extra = {}) {
  const base = createGame(
    snakes.map((s) => ({ id: s.id })),
    { cols: 20, rows: 12, seed: 5, ...extra }
  );
  return {
    ...base,
    food: [],
    snakes: base.snakes.map((snake, i) => ({
      ...snake,
      body: snakes[i].body.map(([x, y]) => ({ x, y })),
      dir: snakes[i].dir
    })),
    ...(extra.state || {})
  };
}

const head = (state, id) => snakeById(state, id).body[0];
const cells = (state, id) => snakeById(state, id).body.map((c) => [c.x, c.y]);
const run = (state, n) => {
  for (let i = 0; i < n; i++) state = step(state);
  return state;
};

describe("spawnPoints", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8])("gives %i snakes distinct in-bounds starting bodies", (n) => {
    const g = createGame(seats(...Array.from({ length: n }, (_, i) => `s${i}`)));
    const used = new Set();
    g.snakes.forEach((s) => {
      expect(s.body).toHaveLength(START_LENGTH);
      s.body.forEach((c) => {
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.x).toBeLessThan(COLS);
        expect(c.y).toBeGreaterThanOrEqual(0);
        expect(c.y).toBeLessThan(ROWS);
        const k = `${c.x},${c.y}`;
        expect(used.has(k)).toBe(false);
        used.add(k);
      });
    });
  });

  // Roughly a second of grace: nobody should lose to the spawn layout itself
  // before they've had a chance to react.
  it.each([2, 3, 4, 5, 6, 7, 8])("nobody dies in the first second with %i snakes if nobody steers", (n) => {
    let g = createGame(seats(...Array.from({ length: n }, (_, i) => `s${i}`)));
    g = run(g, 8);
    expect(aliveSnakes(g)).toHaveLength(n);
  });

  it("points every snake along the ring rather than at the middle", () => {
    const pts = spawnPoints(4);
    expect(pts.map((p) => p.dir)).toEqual(["right", "down", "left", "up"]);
  });

  it("gives every snake room to run before the nearest wall", () => {
    for (let n = 1; n <= 8; n++) {
      spawnPoints(n).forEach((p) => {
        const room = { up: p.y, down: ROWS - 1 - p.y, left: p.x, right: COLS - 1 - p.x }[p.dir];
        expect(room).toBeGreaterThanOrEqual(8);
      });
    }
  });
});

describe("movement", () => {
  it("moves one cell per tick in the heading", () => {
    const g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    const n = step(g);
    expect(cells(n, "a")).toEqual([[6, 5], [5, 5], [4, 5]]);
    expect(n.tick).toBe(1);
  });

  it("does not mutate the previous state", () => {
    const g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    const before = JSON.stringify(g.snakes);
    step(g);
    expect(JSON.stringify(g.snakes)).toBe(before);
  });

  it("applies a queued turn on the next tick", () => {
    let g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    g = step(queueTurn(g, "a", "down"));
    expect(head(g, "a")).toEqual({ x: 5, y: 6 });
    expect(snakeById(g, "a").dir).toBe("down");
  });

  it("ignores a reversal into its own neck", () => {
    let g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    expect(queueTurn(g, "a", "left")).toBe(g);
    g = step(g);
    expect(head(g, "a")).toEqual({ x: 6, y: 5 });
  });

  it("ignores repeating the current heading and unknown directions", () => {
    const g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    expect(queueTurn(g, "a", "right")).toBe(g);
    expect(queueTurn(g, "a", "sideways")).toBe(g);
    expect(queueTurn(g, "nobody", "up")).toBe(g);
  });

  it("is not fooled by property names inherited from Object (a hostile or buggy phone)", () => {
    const g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }]);
    ["constructor", "__proto__", "toString", "hasOwnProperty", 0, null, undefined, {}, ["up"]].forEach((bad) => {
      expect(queueTurn(g, "a", bad)).toBe(g);
    });
    // and the snake carries on normally afterwards
    expect(head(step(g), "a")).toEqual({ x: 6, y: 5 });
  });

  it("queues two quick turns and plays them in order (up then left while heading right)", () => {
    let g = arena([{ id: "a", body: [[8, 8], [7, 8], [6, 8]], dir: "right" }]);
    g = queueTurn(queueTurn(g, "a", "up"), "a", "left");
    g = step(g);
    expect(head(g, "a")).toEqual({ x: 8, y: 7 });
    g = step(g);
    expect(head(g, "a")).toEqual({ x: 7, y: 7 });
  });

  it("caps the queue so a button-masher can't bank dozens of turns", () => {
    let g = arena([{ id: "a", body: [[8, 8], [7, 8], [6, 8]], dir: "right" }]);
    g = queueTurn(g, "a", "up");
    g = queueTurn(g, "a", "left");
    const full = queueTurn(g, "a", "down");
    expect(full).toBe(g);
  });

  it("won't steer a dead snake", () => {
    let g = arena([{ id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" }]);
    g = step(g); // runs into the wall
    expect(snakeById(g, "a").alive).toBe(false);
    expect(queueTurn(g, "a", "up")).toBe(g);
  });
});

describe("walls", () => {
  it("kills a snake that runs into the edge", () => {
    let g = arena([{ id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" }, { id: "b", body: [[10, 2], [9, 2], [8, 2]], dir: "right" }]);
    g = step(g);
    expect(snakeById(g, "a").alive).toBe(false);
    expect(g.events).toContainEqual({ type: "die", id: "a", cause: "wall", by: null });
    expect(snakeById(g, "b").alive).toBe(true);
  });

  it("wraps round the edge when walls are off", () => {
    let g = arena([{ id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" }, { id: "b", body: [[10, 2], [9, 2], [8, 2]], dir: "right" }], { wrap: true });
    g = step(g);
    expect(snakeById(g, "a").alive).toBe(true);
    expect(head(g, "a")).toEqual({ x: 19, y: 5 });
  });

  it("wraps vertically too", () => {
    let g = arena([{ id: "a", body: [[5, 0], [5, 1], [5, 2]], dir: "up" }, { id: "b", body: [[10, 5], [9, 5], [8, 5]], dir: "right" }], { wrap: true });
    g = step(g);
    expect(head(g, "a")).toEqual({ x: 5, y: 11 });
  });

  it("treats the closed-in ring of a shrinking arena as wall, even with wrapping on", () => {
    const g = arena([{ id: "a", body: [[1, 5], [2, 5], [3, 5]], dir: "left" }, { id: "b", body: [[10, 8], [9, 8], [8, 8]], dir: "right" }], { wrap: true });
    const closed = { ...g, inset: 1 };
    expect(isWall(closed, 0, 5)).toBe(true);
    expect(step(closed).snakes[0].alive).toBe(false);
  });
});

describe("collisions", () => {
  it("kills a snake that bites itself", () => {
    // A tight loop: heading up into its own body.
    const g = arena([{ id: "a", body: [[5, 5], [5, 6], [6, 6], [6, 5], [6, 4]], dir: "right" }, { id: "b", body: [[15, 2], [14, 2], [13, 2]], dir: "right" }]);
    const turned = queueTurn(g, "a", "up"); // (5,4) is free; this survives
    expect(snakeById(step(turned), "a").alive).toBe(true);
    const into = arena([{ id: "a", body: [[5, 5], [4, 5], [4, 6], [5, 6], [6, 6], [6, 5], [6, 4]], dir: "down" }, { id: "b", body: [[15, 2], [14, 2], [13, 2]], dir: "right" }]);
    const hit = step(into); // moving down from (5,5) lands on (5,6), its own body
    expect(snakeById(hit, "a").alive).toBe(false);
    expect(hit.events).toContainEqual({ type: "die", id: "a", cause: "self", by: null });
  });

  it("lets a snake move into the cell its own tail is leaving", () => {
    // A 2x2 loop: the head chases its tail round and survives.
    let g = arena([{ id: "a", body: [[5, 5], [5, 6], [6, 6], [6, 5]], dir: "right" }, { id: "b", body: [[15, 2], [14, 2], [13, 2]], dir: "right" }]);
    g = step(g); // head -> (6,5), the cell the tail vacates
    expect(snakeById(g, "a").alive).toBe(true);
    expect(head(g, "a")).toEqual({ x: 6, y: 5 });
  });

  it("does NOT let a growing snake chase its tail", () => {
    let g = arena([{ id: "a", body: [[5, 5], [5, 6], [6, 6], [6, 5]], dir: "right" }, { id: "b", body: [[15, 2], [14, 2], [13, 2]], dir: "right" }]);
    g = { ...g, snakes: g.snakes.map((s) => (s.id === "a" ? { ...s, grow: 2 } : s)) };
    expect(snakeById(step(g), "a").alive).toBe(false);
  });

  it("kills the attacker, and credits the snake whose body was hit", () => {
    // b's head runs into the middle of a's body.
    const g = arena([
      { id: "a", body: [[8, 5], [7, 5], [6, 5], [5, 5]], dir: "right" },
      { id: "b", body: [[7, 3], [7, 2], [7, 1]], dir: "down" }
    ]);
    const n = step(step(g));
    expect(snakeById(n, "b").alive).toBe(false);
    expect(snakeById(n, "a").alive).toBe(true);
    expect(snakeById(n, "a").kills).toBe(1);
    expect(snakeById(n, "a").score).toBeGreaterThanOrEqual(KILL_POINTS);
    expect(n.events.some((e) => e.type === "die" && e.id === "b" && e.cause === "body" && e.by === "a")).toBe(true);
  });

  it("kills both snakes when two heads meet", () => {
    const g = arena([
      { id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" },
      { id: "b", body: [[7, 5], [8, 5], [9, 5]], dir: "left" },
      { id: "c", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }
    ]);
    const n = step(g);
    expect(snakeById(n, "a").alive).toBe(false);
    expect(snakeById(n, "b").alive).toBe(false);
    expect(snakeById(n, "c").alive).toBe(true);
    expect(n.events.filter((e) => e.type === "die" && e.cause === "head")).toHaveLength(2);
  });

  it("kills both when two snakes swap heads through each other", () => {
    const g = arena([
      { id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" },
      { id: "b", body: [[6, 5], [7, 5], [8, 5]], dir: "left" },
      { id: "c", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }
    ]);
    const n = step(g);
    expect(snakeById(n, "a").alive).toBe(false);
    expect(snakeById(n, "b").alive).toBe(false);
  });
});

describe("food", () => {
  it("grows a snake by one cell, scores it, and replaces the food", () => {
    let g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }, { id: "b", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }]);
    g = { ...g, food: [{ x: 6, y: 5, value: 1 }, { x: 1, y: 1, value: 1 }, { x: 2, y: 2, value: 1 }] };
    const n = step(g);
    expect(snakeById(n, "a").body).toHaveLength(4);
    expect(snakeById(n, "a").score).toBe(FOOD_POINTS);
    expect(n.food.some((f) => f.x === 6 && f.y === 5)).toBe(false);
    expect(n.food.length).toBeGreaterThanOrEqual(3);
    expect(n.events).toContainEqual({ type: "eat", id: "a", value: 1 });
  });

  it("grows golden food over several ticks", () => {
    let g = arena([{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }, { id: "b", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }]);
    g = { ...g, food: [{ x: 6, y: 5, value: GOLDEN_VALUE }, { x: 1, y: 1, value: 1 }, { x: 2, y: 2, value: 1 }] };
    g = run(g, 4);
    expect(snakeById(g, "a").body).toHaveLength(3 + GOLDEN_VALUE);
    expect(snakeById(g, "a").score).toBe(FOOD_POINTS * GOLDEN_VALUE);
  });

  it("keeps a minimum amount of food on the board", () => {
    const g = createGame(seats("a", "b", "c"), { seed: 11 });
    expect(g.food.length).toBeGreaterThanOrEqual(4);
    expect(run(g, 3).food.length).toBeGreaterThanOrEqual(3);
  });

  it("never puts food on a wall or on a snake", () => {
    let g = createGame(seats("a", "b"), { seed: 3 });
    g = run(g, 30);
    const body = new Set();
    g.snakes.forEach((s) => s.alive && s.body.forEach((c) => body.add(`${c.x},${c.y}`)));
    g.food.forEach((f) => {
      expect(body.has(`${f.x},${f.y}`)).toBe(false);
      expect(isWall(g, f.x, f.y)).toBe(false);
    });
  });

  it("turns a dead snake's body into food", () => {
    const g = arena([
      { id: "a", body: [[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]], dir: "left" },
      { id: "b", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }
    ]);
    const n = step(g); // a hits the wall
    const dropped = n.food.filter((f) => f.y === 5);
    expect(dropped.length).toBeGreaterThanOrEqual(2);
  });

  it("is deterministic for a seed", () => {
    const a = createGame(seats("a", "b"), { seed: 99 });
    const b = createGame(seats("a", "b"), { seed: 99 });
    expect(a.food).toEqual(b.food);
    expect(run(a, 25).food).toEqual(run(b, 25).food);
  });
});

describe("survival", () => {
  it("ends when one snake is left, and crowns it", () => {
    const g = arena([
      { id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" },
      { id: "b", body: [[10, 2], [9, 2], [8, 2]], dir: "right" }
    ]);
    const n = step(g);
    expect(n.over).toBe(true);
    expect(n.winnerId).toBe("b");
    expect(step(n)).toBe(n); // a finished match no longer moves
  });

  it("scores a simultaneous wipe-out as a win for the higher score, or a draw", () => {
    const base = arena([
      { id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" },
      { id: "b", body: [[7, 5], [8, 5], [9, 5]], dir: "left" }
    ]);
    expect(step(base).over).toBe(true);
    expect(step(base).winnerId).toBe(null); // level on points: a draw
    const ahead = { ...base, snakes: base.snakes.map((s) => (s.id === "a" ? { ...s, score: 30 } : s)) };
    expect(step(ahead).winnerId).toBe("a");
  });

  it("runs a solo practice game until the lone snake dies", () => {
    let g = arena([{ id: "a", body: [[2, 5], [1, 5], [0, 5]], dir: "right" }]);
    expect(g.startCount).toBe(1);
    g = run(g, 3);
    expect(g.over).toBe(false);
    g = run(g, 30);
    expect(g.over).toBe(true);
    expect(g.winnerId).toBe("a");
  });

  it("closes the arena in once the shrink timer starts, then stops at the limit", () => {
    // Two snakes parked well apart; they are put back every tick so nothing
    // dies while the walls close in round them.
    const park = (g) => ({
      ...g,
      snakes: g.snakes.map((s, i) => ({
        ...s,
        alive: true,
        dir: "up",
        queue: [],
        body: [{ x: 8 + i * 4, y: 6 }, { x: 8 + i * 4, y: 7 }, { x: 8 + i * 4, y: 8 }]
      }))
    });
    let g = arena(
      [{ id: "a", body: [[8, 6], [8, 7], [8, 8]], dir: "up" }, { id: "b", body: [[12, 6], [12, 7], [12, 8]], dir: "up" }],
      { shrinkStart: 2, shrinkEvery: 2 }
    );
    const shrinks = [];
    for (let i = 0; i < 30; i++) {
      g = step(park(g));
      shrinks.push(...g.events.filter((e) => e.type === "shrink"));
    }
    expect(g.over).toBe(false);
    expect(g.inset).toBe(g.maxInset);
    expect(shrinks).toHaveLength(g.maxInset);
    expect(shrinks[0].inset).toBe(1);
  });

  it("does not shrink in timed mode", () => {
    let g = arena(
      [{ id: "a", body: [[8, 6], [8, 7], [8, 8]], dir: "up" }, { id: "b", body: [[12, 6], [12, 7], [12, 8]], dir: "up" }],
      { mode: "timed", shrinkStart: 1, shrinkEvery: 1, durationTicks: 100 }
    );
    g = step(g);
    expect(g.inset).toBe(0);
  });

  it("speeds up as the match goes on, down to a floor", () => {
    const g = createGame(seats("a", "b"));
    expect(tickMs({ ...g, tick: 0 })).toBeGreaterThan(tickMs({ ...g, tick: 600 }));
    expect(tickMs({ ...g, tick: 99999 })).toBe(70);
  });
});

describe("timed mode", () => {
  it("brings a dead snake back after the respawn delay", () => {
    let g = arena(
      [{ id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" }, { id: "b", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }],
      { mode: "timed", durationTicks: 500 }
    );
    g = step(g);
    expect(snakeById(g, "a").alive).toBe(false);
    expect(snakeById(g, "a").respawnAt).toBe(1 + RESPAWN_TICKS);
    // Keep b circling on the spot so it can't die during the wait.
    const holdB = (st) => ({
      ...st,
      snakes: st.snakes.map((x) =>
        x.id === "b" ? { ...x, body: [{ x: 15, y: 9 }, { x: 14, y: 9 }, { x: 13, y: 9 }], dir: "right", queue: [] } : x
      )
    });
    const seen = [];
    for (let i = 0; i < RESPAWN_TICKS + 1; i++) {
      g = step(holdB(g));
      seen.push(...g.events.map((e) => e.type));
    }
    expect(snakeById(g, "a").alive).toBe(true);
    expect(snakeById(g, "a").body).toHaveLength(START_LENGTH);
    expect(snakeById(g, "a").deaths).toBe(1);
    expect(seen).toContain("respawn");
  });

  it("holds a respawn back while its spot is still occupied", () => {
    const spot = spawnPoints(2, 20, 12)[0];
    let g = arena(
      [{ id: "a", body: [[0, 5], [1, 5], [2, 5]], dir: "left" }, { id: "b", body: [[15, 9], [14, 9], [13, 9]], dir: "right" }],
      { mode: "timed", durationTicks: 500 }
    );
    g = step(g);
    g = { ...g, tick: RESPAWN_TICKS, snakes: g.snakes.map((x) => (x.id === "b" ? { ...x, body: [{ x: spot.x, y: spot.y }, { x: spot.x - 1, y: spot.y }, { x: spot.x - 2, y: spot.y }], dir: "up" } : x)) };
    g = step(g);
    expect(snakeById(g, "a").alive).toBe(false);
    expect(snakeById(g, "a").respawnAt).toBeGreaterThan(g.tick);
  });

  it("ends at the time limit, with the top scorer winning", () => {
    let g = arena(
      [{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }, { id: "b", body: [[5, 9], [4, 9], [3, 9]], dir: "right" }],
      { mode: "timed", durationTicks: 3 }
    );
    g = { ...g, snakes: g.snakes.map((s) => (s.id === "b" ? { ...s, score: 40 } : s)) };
    g = run(g, 3);
    expect(g.over).toBe(true);
    expect(g.winnerId).toBe("b");
  });

  it("declares a draw when the top scores are level", () => {
    let g = arena(
      [{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }, { id: "b", body: [[5, 9], [4, 9], [3, 9]], dir: "right" }],
      { mode: "timed", durationTicks: 2 }
    );
    g = run(g, 2);
    expect(g.over).toBe(true);
    expect(g.winnerId).toBe(null);
  });
});

describe("standings", () => {
  it("ranks survival by how long each snake lasted", () => {
    const g = arena([
      { id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" },
      { id: "b", body: [[5, 9], [4, 9], [3, 9]], dir: "right" },
      { id: "c", body: [[5, 2], [4, 2], [3, 2]], dir: "right" }
    ]);
    const done = {
      ...g,
      snakes: g.snakes.map((s) => (s.id === "a" ? { ...s, alive: false, diedAt: 4 } : s.id === "b" ? { ...s, alive: false, diedAt: 9 } : s))
    };
    expect(standings(done).map((s) => s.id)).toEqual(["c", "b", "a"]);
  });

  it("ranks timed play by points, then kills", () => {
    const g = arena(
      [{ id: "a", body: [[5, 5], [4, 5], [3, 5]], dir: "right" }, { id: "b", body: [[5, 9], [4, 9], [3, 9]], dir: "right" }, { id: "c", body: [[5, 2], [4, 2], [3, 2]], dir: "right" }],
      { mode: "timed" }
    );
    const scored = { ...g, snakes: g.snakes.map((s) => ({ ...s, score: s.id === "a" ? 20 : 50, kills: s.id === "c" ? 1 : 0 })) };
    expect(standings(scored).map((s) => s.id)).toEqual(["c", "b", "a"]);
  });
});

describe("makeRng", () => {
  it("is repeatable and stays in [0, 1)", () => {
    const a = makeRng(7);
    const b = makeRng(7);
    for (let i = 0; i < 100; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
