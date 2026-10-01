// Pure Snake Battle rules engine — no React, no network, no timers.
//
// The host calls `step(state)` once per tick and `queueTurn(state, id, dir)`
// whenever a player steers. Everything is deterministic given the seed, so a
// whole match can be replayed in a test (engine.test.js) without a browser.
//
// Rules in one breath: every snake moves one cell per tick. Eat food to grow.
// Hitting a wall, yourself, or another snake's body kills you (the snake whose
// body you hit is credited); two heads meeting kills both. A dead snake's body
// turns into food. Two modes: *survival* (last snake alive wins, and the arena
// closes in so it always ends) and *timed* (most points when the clock runs
// out; the dead respawn after a short wait).

export const COLS = 32;
export const ROWS = 20;
export const START_LENGTH = 3;
export const MAX_SNAKES = 8;

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};
const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

export const FOOD_POINTS = 10;
export const GOLDEN_VALUE = 3;
export const KILL_POINTS = 50;
export const RESPAWN_TICKS = 24;
const MAX_QUEUED_TURNS = 2;
const MAX_FOOD = 70;

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

const keyOf = (x, y) => y * 1000 + x;

// Evenly spaced starting spots round an ellipse, each facing along it
// (clockwise). Heading tangentially rather than at the centre means nobody
// meets anybody head-on in the opening seconds, and where the tangent runs
// diagonally the snake takes whichever of the two nearest axes leaves it more
// room before a wall.
export function spawnPoints(count, cols = COLS, rows = ROWS) {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const rx = cols * 0.34;
  const ry = rows * 0.34;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(cx + Math.cos(a) * rx);
    const y = Math.round(cy + Math.sin(a) * ry);
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const runway = { up: y, down: rows - 1 - y, left: x, right: cols - 1 - x };
    const forward = Object.keys(DIRS).filter((d) => DIRS[d].x * tx + DIRS[d].y * ty > 0.2);
    const dir = forward.sort((p, q) => runway[q] - runway[p])[0];
    pts.push({ x, y, dir });
  }
  return pts;
}

// Body cells for a fresh snake: head first, trailing away from its heading.
function freshBody(spot, length = START_LENGTH) {
  const d = DIRS[spot.dir];
  return Array.from({ length }, (_, i) => ({ x: spot.x - d.x * i, y: spot.y - d.y * i }));
}

function newSnake(seat, slot, spot) {
  return {
    id: seat.id,
    slot,
    body: freshBody(spot),
    dir: spot.dir,
    queue: [],
    alive: true,
    grow: 0,
    score: 0,
    kills: 0,
    deaths: 0,
    diedAt: null,
    respawnAt: null
  };
}

/**
 * @param seats  [{ id }] — one snake per seat, in seat order
 * @param options.mode  "survival" | "timed"
 * @param options.wrap  true: the edges join up; false: they are walls
 * @param options.durationTicks  timed mode length
 * @param options.shrinkStart / shrinkEvery  survival: when the arena starts to
 *   close in, and how many ticks between each step of it
 */
export function createGame(
  seats,
  {
    mode = "survival",
    wrap = false,
    seed = 1,
    cols = COLS,
    rows = ROWS,
    durationTicks = 700,
    shrinkStart = 560,
    shrinkEvery = 12
  } = {}
) {
  const spots = spawnPoints(seats.length, cols, rows);
  const state = {
    cols,
    rows,
    mode,
    wrap,
    tick: 0,
    snakes: seats.map((seat, i) => newSnake(seat, i, spots[i])),
    food: [],
    inset: 0,
    maxInset: Math.max(0, Math.floor(Math.min(cols, rows) / 2) - 3),
    durationTicks,
    shrinkStart,
    shrinkEvery,
    startCount: seats.length,
    over: false,
    winnerId: null,
    rng: makeRng(seed),
    events: []
  };
  return { ...state, food: topUpFood(state, state.snakes, []) };
}

// ---------- queries ----------

export function isWall(state, x, y) {
  if (x < state.inset || y < state.inset || x >= state.cols - state.inset || y >= state.rows - state.inset) {
    return true;
  }
  return false;
}

export function aliveSnakes(state) {
  return state.snakes.filter((s) => s.alive);
}

export function snakeById(state, id) {
  return state.snakes.find((s) => s.id === id) || null;
}

// Milliseconds between ticks. Survival gets steadily faster, which is the other
// half of how it avoids stalling out; timed play stays at a steady pace.
export function tickMs(state, base = 135) {
  if (state.mode === "timed") return base;
  return Math.max(70, base - Math.floor(state.tick / 150) * 8);
}

export function secondsLeft(state, ms = 135) {
  return Math.max(0, Math.ceil(((state.durationTicks - state.tick) * ms) / 1000));
}

// ---------- steering ----------

// Queues a turn. Each queued direction is checked against the one before it
// (not just the current heading), so "up, then left" typed quickly while
// heading right is two legal turns — while "left" alone would be a reversal
// into your own neck and is ignored.
export function queueTurn(state, snakeId, dir) {
  // hasOwn, not DIRS[dir]: the direction comes off the network, and a lookup
  // like DIRS["constructor"] finds something inherited — which would queue a
  // "direction" with no x/y and send the snake to NaN.
  if (state.over || typeof dir !== "string" || !Object.prototype.hasOwnProperty.call(DIRS, dir)) return state;
  const s = snakeById(state, snakeId);
  if (!s || !s.alive) return state;
  const last = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
  if (dir === last || dir === OPPOSITE[last]) return state;
  if (s.queue.length >= MAX_QUEUED_TURNS) return state;
  return { ...state, snakes: state.snakes.map((x) => (x === s ? { ...s, queue: [...s.queue, dir] } : x)) };
}

// ---------- food ----------

function occupiedKeys(snakes, food) {
  const set = new Set();
  snakes.forEach((s) => {
    if (s.alive) s.body.forEach((c) => set.add(keyOf(c.x, c.y)));
  });
  food.forEach((f) => set.add(keyOf(f.x, f.y)));
  return set;
}

function topUpFood(state, snakes, food) {
  const alive = snakes.filter((s) => s.alive).length;
  const target = Math.max(3, alive + 1);
  const next = food.slice();
  const taken = occupiedKeys(snakes, next);
  let guard = 0;
  while (next.length < target && next.length < MAX_FOOD && guard++ < 200) {
    const x = Math.floor(state.rng() * state.cols);
    const y = Math.floor(state.rng() * state.rows);
    if (isWall(state, x, y) || taken.has(keyOf(x, y))) continue;
    taken.add(keyOf(x, y));
    next.push({ x, y, value: state.rng() < 0.12 ? GOLDEN_VALUE : 1 });
  }
  return next;
}

// ---------- the tick ----------

export function step(state) {
  if (state.over) return state;

  const tick = state.tick + 1;
  const events = [];
  let inset = state.inset;
  if (
    state.mode === "survival" &&
    tick >= state.shrinkStart &&
    (tick - state.shrinkStart) % state.shrinkEvery === 0 &&
    inset < state.maxInset
  ) {
    inset += 1;
    events.push({ type: "shrink", inset });
  }
  const arena = { ...state, inset };

  // Respawns (timed mode): a snake that has waited long enough comes back at
  // its own start spot, if that spot is clear.
  let startFood = state.food;
  let snakes = state.snakes.map((s) => {
    if (s.alive || s.respawnAt === null || tick < s.respawnAt) return s;
    const spot = spawnPoints(state.startCount, state.cols, state.rows)[s.slot];
    const body = freshBody(spot);
    const taken = occupiedKeys(state.snakes, []);
    const blocked = body.some((c) => isWall(arena, c.x, c.y) || taken.has(keyOf(c.x, c.y)));
    if (blocked) return { ...s, respawnAt: tick + 1 };
    events.push({ type: "respawn", id: s.id });
    // Food under the new body would be invisible and uneatable; clear it.
    startFood = startFood.filter((f) => !body.some((c) => c.x === f.x && c.y === f.y));
    return { ...s, body, dir: spot.dir, queue: [], alive: true, grow: 0, respawnAt: null };
  });

  // Where each living snake is heading this tick.
  const plan = new Map();
  snakes.forEach((s) => {
    if (!s.alive) return;
    const dir = s.queue.length ? s.queue[0] : s.dir;
    const d = DIRS[dir];
    let nx = s.body[0].x + d.x;
    let ny = s.body[0].y + d.y;
    if (state.wrap) {
      nx = (nx + state.cols) % state.cols;
      ny = (ny + state.rows) % state.rows;
    }
    const foodHere = startFood.find((f) => f.x === nx && f.y === ny) || null;
    // A snake that is growing (or eating) keeps its tail; otherwise the tail
    // cell is vacated this tick and is safe to move into.
    plan.set(s.id, { dir, head: { x: nx, y: ny }, food: foodHere, keepsTail: s.grow > 0 || !!foodHere });
  });

  // Who occupies which cell once tails have moved off.
  const owner = new Map();
  snakes.forEach((s) => {
    if (!s.alive) return;
    const keep = plan.get(s.id).keepsTail ? s.body : s.body.slice(0, -1);
    keep.forEach((c) => owner.set(keyOf(c.x, c.y), s.id));
  });

  // Collisions, all judged against the board as it stood at the start of the
  // tick — nobody gets to "dodge" by moving first.
  const dying = new Map(); // id -> { cause, by }
  const heads = new Map();
  plan.forEach((p, id) => {
    const k = keyOf(p.head.x, p.head.y);
    heads.set(k, (heads.get(k) || []).concat(id));
  });
  plan.forEach((p, id) => {
    const k = keyOf(p.head.x, p.head.y);
    const outOfBounds = p.head.x < 0 || p.head.y < 0 || p.head.x >= state.cols || p.head.y >= state.rows;
    if (outOfBounds || isWall(arena, p.head.x, p.head.y)) {
      dying.set(id, { cause: "wall", by: null });
    } else if (heads.get(k).length > 1) {
      dying.set(id, { cause: "head", by: null });
    } else if (owner.has(k)) {
      const by = owner.get(k);
      dying.set(id, { cause: by === id ? "self" : "body", by: by === id ? null : by });
    }
  });

  // Apply the moves.
  let food = startFood.slice();
  const eaten = new Set();
  const dead = new Set(dying.keys());
  snakes = snakes.map((s) => {
    if (!s.alive) return s;
    const p = plan.get(s.id);
    if (dead.has(s.id)) {
      events.push({ type: "die", id: s.id, cause: dying.get(s.id).cause, by: dying.get(s.id).by });
      return {
        ...s,
        alive: false,
        deaths: s.deaths + 1,
        diedAt: tick,
        respawnAt: state.mode === "timed" ? tick + RESPAWN_TICKS : null,
        queue: []
      };
    }
    const body = [p.head, ...s.body];
    let grow = s.grow;
    let score = s.score;
    if (p.food) {
      eaten.add(keyOf(p.food.x, p.food.y));
      score += p.food.value * FOOD_POINTS;
      grow += p.food.value - 1; // the eating move itself is the first cell of growth
      events.push({ type: "eat", id: s.id, value: p.food.value });
    } else if (grow > 0) {
      grow -= 1;
    }
    if (!p.keepsTail) body.pop();
    return { ...s, body, dir: p.dir, queue: s.queue.slice(1), grow, score };
  });

  // Kill credit goes to the owner of the body that was run into.
  dying.forEach(({ by }) => {
    if (by === null) return;
    snakes = snakes.map((s) =>
      s.id === by && s.alive ? { ...s, kills: s.kills + 1, score: s.score + KILL_POINTS } : s
    );
  });

  food = food.filter((f) => !eaten.has(keyOf(f.x, f.y)));
  // The fallen turn into food: every other cell of their body — except any
  // cell a survivor has just moved onto, which would bury the food under it.
  const livingCells = occupiedKeys(snakes, []);
  snakes.forEach((s) => {
    if (!dead.has(s.id)) return;
    const before = state.snakes.find((x) => x.id === s.id);
    before.body.forEach((c, i) => {
      if (i % 2 !== 0 || isWall(arena, c.x, c.y) || food.length >= MAX_FOOD) return;
      if (livingCells.has(keyOf(c.x, c.y)) || food.some((f) => f.x === c.x && f.y === c.y)) return;
      food.push({ x: c.x, y: c.y, value: 1 });
    });
  });

  const next = { ...state, tick, inset, snakes, events };
  next.food = topUpFood(next, snakes, food);

  // Is it over?
  const alive = snakes.filter((s) => s.alive);
  if (state.mode === "timed") {
    if (tick >= state.durationTicks) return finish(next, snakes);
  } else if (state.startCount >= 2 ? alive.length <= 1 : alive.length === 0) {
    return finish(next, alive.length === 1 ? alive : snakes.filter((s) => s.diedAt === tick));
  }
  return next;
}

// Picks the winner from `candidates`: highest score, a tie means no single
// winner (the results screen calls that a draw).
function finish(state, candidates) {
  const best = Math.max(...candidates.map((s) => s.score));
  const top = candidates.filter((s) => s.score === best);
  const winnerId = candidates.length === 1 ? candidates[0].id : top.length === 1 ? top[0].id : null;
  return { ...state, over: true, winnerId };
}

// Final order, best first. Survival: whoever lasted longest (the winner never
// died), then points. Timed: points, then kills, then fewest deaths.
export function standings(state) {
  const list = state.snakes.slice();
  if (state.mode === "timed") {
    return list.sort((a, b) => b.score - a.score || b.kills - a.kills || a.deaths - b.deaths);
  }
  const lasted = (s) => (s.alive ? Number.MAX_SAFE_INTEGER : s.diedAt ?? 0);
  return list.sort((a, b) => lasted(b) - lasted(a) || b.score - a.score);
}
