import { buildBattlefield, destroy, findSpawns, settle, isOutOfBounds, makeRng } from "./terrain";
import { simulateShot, launchVelocity, blastDamage, distance, rollWind } from "./physics";
import { weaponById } from "./weapons";

// The match state machine: teams, turn order, firing, damage and the win
// condition. Pure — it takes a state and returns a new one, and never touches
// the DOM — so the rules are unit-tested (engine.test.js) rather than clicked.
//
// The terrain mask is mutated in place rather than copied: it's a 230KB typed
// array and cloning it on every shot would be wasteful. That's the one
// deliberate exception to the immutable style, and it's why `terrain` is held
// outside the state snapshots the UI diffs.

export const TEAMS = [
  { id: "dogs", name: "Dogs", emoji: "🐶", colour: "#e8a91d" },
  { id: "cats", name: "Cats", emoji: "🐱", colour: "#8b6ff5" }
];

export const MAX_HP = 100;
export const FALL_DAMAGE_PER_PX = 0.35;
export const SAFE_FALL = 40;

export function createMatch({
  battlefieldId = "hills",
  perTeam = 2,
  seed = 1,
  rng = makeRng(seed)
} = {}) {
  const { terrain, def } = buildBattlefield(battlefieldId, seed);
  const spawns = findSpawns(terrain, perTeam * 2, rng);

  // Alternate spawns so the teams interleave rather than sitting in two
  // blocks — it makes the opening far less of a stalemate.
  const characters = [];
  for (let i = 0; i < perTeam * 2; i++) {
    const team = TEAMS[i % 2];
    const idx = Math.floor(i / 2);
    characters.push({
      id: `${team.id}-${idx}`,
      teamId: team.id,
      name: `${team.name.slice(0, -1)} ${idx + 1}`,
      x: spawns[i].x,
      y: spawns[i].y,
      hp: MAX_HP,
      alive: true
    });
  }

  return {
    terrain,
    battlefield: def,
    characters,
    turnTeamIndex: 0,
    activeByTeam: { dogs: 0, cats: 0 },
    wind: rollWind(rng),
    phase: "aim", // aim | flying | resolve | over
    lastShot: null,
    log: [],
    winner: null,
    rng
  };
}

export function teamOf(state, teamId) {
  return state.characters.filter((c) => c.teamId === teamId);
}

export function aliveOf(state, teamId) {
  return teamOf(state, teamId).filter((c) => c.alive);
}

export function activeCharacter(state) {
  const team = TEAMS[state.turnTeamIndex];
  const alive = aliveOf(state, team.id);
  if (alive.length === 0) return null;
  const idx = state.activeByTeam[team.id] % alive.length;
  return alive[idx];
}

function damageAt(characters, cx, cy, weapon) {
  return characters.map((c) => {
    if (!c.alive) return c;
    const d = distance(c.x, c.y, cx, cy);
    const dmg = blastDamage(weapon.damage, weapon.radius, d);
    if (dmg <= 0) return c;
    const hp = Math.max(0, c.hp - dmg);
    return { ...c, hp, alive: hp > 0 };
  });
}

// After the ground moves, anything left hanging falls — and a long drop hurts.
function applyGravityToAll(terrain, characters) {
  return characters.map((c) => {
    if (!c.alive) return c;
    const { y, fell, lost } = settle(terrain, c.x, c.y);
    if (lost || isOutOfBounds(terrain, c.x, y)) return { ...c, hp: 0, alive: false, y };
    if (fell <= SAFE_FALL) return { ...c, y };
    const hp = Math.max(0, c.hp - Math.round((fell - SAFE_FALL) * FALL_DAMAGE_PER_PX));
    return { ...c, y, hp, alive: hp > 0 };
  });
}

function checkWinner(state) {
  const dogs = aliveOf(state, "dogs").length;
  const cats = aliveOf(state, "cats").length;
  if (dogs > 0 && cats > 0) return null;
  if (dogs === 0 && cats === 0) return "draw";
  return dogs > 0 ? "dogs" : "cats";
}

/**
 * Fire the active character's weapon.
 *
 * Returns { state, shot } where `shot` carries the flight path for the UI to
 * animate. The state is already fully resolved — the animation is replay, not
 * simulation, so what you watch is exactly what happened.
 */
export function fire(state, { weaponId, angle, power }) {
  if (state.phase !== "aim") return { state, shot: null };
  const shooter = activeCharacter(state);
  if (!shooter) return { state, shot: null };

  const weapon = weaponById(weaponId);

  if (weapon.kind === "melee") {
    const facing = angle > 90 || angle < -90 ? -1 : 1;
    const tx = shooter.x + facing * weapon.range * 0.6;
    const ty = shooter.y;
    let characters = state.characters.map((c) => {
      if (!c.alive || c.id === shooter.id) return c;
      if (distance(c.x, c.y, shooter.x, shooter.y) > weapon.range) return c;
      const hp = Math.max(0, c.hp - weapon.damage);
      // Knock them back and up, which often does more than the hit itself.
      return { ...c, hp, alive: hp > 0, x: c.x + facing * weapon.knockback, y: c.y - 4 };
    });
    characters = applyGravityToAll(state.terrain, characters);
    const next = {
      ...state,
      characters,
      lastShot: { weapon: weapon.id, impact: { x: tx, y: ty }, reason: "melee" },
      phase: "resolve"
    };
    return { state: withWinner(next), shot: { path: [], impact: { x: tx, y: ty }, reason: "melee", weapon } };
  }

  const velocity = launchVelocity(angle, power);
  const shot = simulateShot(state.terrain, { x: shooter.x, y: shooter.y - 8 }, velocity, {
    wind: state.wind * weapon.windFactor,
    targets: state.characters,
    ignoreId: shooter.id
  });

  let characters = state.characters;
  if (shot.reason !== "out" && shot.reason !== "expired") {
    destroy(state.terrain, shot.impact.x, shot.impact.y, weapon.radius);
    characters = damageAt(characters, shot.impact.x, shot.impact.y, weapon);
    characters = applyGravityToAll(state.terrain, characters);
  }

  const next = {
    ...state,
    characters,
    lastShot: { weapon: weapon.id, impact: shot.impact, reason: shot.reason },
    phase: "resolve"
  };
  return { state: withWinner(next), shot: { ...shot, weapon } };
}

function withWinner(state) {
  const winner = checkWinner(state);
  return winner ? { ...state, winner, phase: "over" } : state;
}

// Hand the turn to the other team, advancing that team's character rotation
// and re-rolling the wind.
export function endTurn(state) {
  if (state.phase === "over") return state;
  const nextTeamIndex = (state.turnTeamIndex + 1) % TEAMS.length;
  const nextTeam = TEAMS[nextTeamIndex];
  const alive = aliveOf(state, nextTeam.id);
  if (alive.length === 0) return withWinner(state);

  return {
    ...state,
    turnTeamIndex: nextTeamIndex,
    activeByTeam: {
      ...state.activeByTeam,
      [nextTeam.id]: (state.activeByTeam[nextTeam.id] + 1) % Math.max(1, alive.length)
    },
    wind: rollWind(state.rng),
    phase: "aim",
    lastShot: null
  };
}

// Walking: step along the surface, refusing climbs that are too steep.
export const MOVE_STEP = 3;
export const MAX_CLIMB = 6;

export function moveActive(state, direction) {
  if (state.phase !== "aim") return state;
  const actor = activeCharacter(state);
  if (!actor) return state;

  const targetX = actor.x + direction * MOVE_STEP;
  if (targetX < 2 || targetX > state.terrain.width - 2) return state;

  // Try to stand at the new column: allow a small step up or a drop.
  let bestY = null;
  for (let dy = -MAX_CLIMB; dy <= MAX_CLIMB; dy++) {
    const probe = settle(state.terrain, targetX, actor.y + dy);
    if (!probe.lost && Math.abs(probe.y - actor.y) <= MAX_CLIMB) {
      bestY = probe.y;
      break;
    }
  }
  if (bestY == null) {
    const drop = settle(state.terrain, targetX, actor.y);
    if (drop.lost) return state;
    bestY = drop.y;
  }

  return {
    ...state,
    characters: state.characters.map((c) => (c.id === actor.id ? { ...c, x: targetX, y: bestY } : c))
  };
}
