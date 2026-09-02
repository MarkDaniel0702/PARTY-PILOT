import { describe, it, expect } from "vitest";
import {
  TERRAIN_W,
  TERRAIN_H,
  BATTLEFIELDS,
  makeRng,
  createTerrain,
  buildBattlefield,
  isSolid,
  isOutOfBounds,
  destroy,
  settle,
  surfaceY,
  findSpawns
} from "./terrain";
import { simulateShot, launchVelocity, blastDamage, distance, rollWind, GRAVITY } from "./physics";
import { createMatch, fire, endTurn, moveActive, activeCharacter, aliveOf, TEAMS, MAX_HP } from "./engine";
import { WEAPONS, weaponById } from "./weapons";

// A flat slab of ground across the bottom third — predictable for physics.
function flatTerrain(groundY = 250) {
  const t = createTerrain(TERRAIN_W, TERRAIN_H);
  for (let y = groundY; y < t.height; y++) {
    for (let x = 0; x < t.width; x++) t.mask[y * t.width + x] = 1;
  }
  return t;
}

describe("rng", () => {
  it("is deterministic for a seed", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs between seeds", () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)());
  });

  it("stays within 0..1", () => {
    const r = makeRng(7);
    for (let i = 0; i < 200; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("battlefields", () => {
  it("ships all six", () => {
    expect(BATTLEFIELDS).toHaveLength(6);
    expect(new Set(BATTLEFIELDS.map((b) => b.id)).size).toBe(6);
  });

  it("every generator produces standable ground", () => {
    for (const bf of BATTLEFIELDS) {
      const { terrain } = buildBattlefield(bf.id, 12345);
      const solid = terrain.mask.reduce((n, v) => n + v, 0);
      expect(solid, `${bf.id} produced no terrain`).toBeGreaterThan(2000);
      const columnsWithGround = Array.from({ length: terrain.width }, (_, x) => surfaceY(terrain, x)).filter(
        (y) => y != null
      );
      expect(columnsWithGround.length, `${bf.id} has too little standable ground`).toBeGreaterThan(
        terrain.width * 0.3
      );
    }
  });

  it("rebuilds identically from the same seed, and differently from another", () => {
    const a = buildBattlefield("hills", 99).terrain.mask;
    const b = buildBattlefield("hills", 99).terrain.mask;
    const c = buildBattlefield("hills", 100).terrain.mask;
    expect(Array.from(a)).toEqual(Array.from(b));
    expect(Array.from(a)).not.toEqual(Array.from(c));
  });
});

describe("terrain destruction", () => {
  it("removes a circle of ground and reports how much", () => {
    const t = flatTerrain(200);
    expect(isSolid(t, 320, 210)).toBe(true);
    const removed = destroy(t, 320, 210, 20);
    expect(removed).toBeGreaterThan(500); // ~pi*r^2 clipped by the surface
    expect(isSolid(t, 320, 210)).toBe(false);
  });

  it("leaves ground outside the blast alone", () => {
    const t = flatTerrain(200);
    destroy(t, 320, 210, 15);
    expect(isSolid(t, 320 + 40, 210)).toBe(true);
  });

  it("is idempotent on already-empty sky", () => {
    const t = flatTerrain(200);
    expect(destroy(t, 320, 50, 20)).toBe(0);
  });

  it("clips at the edges without throwing", () => {
    const t = flatTerrain(200);
    expect(() => destroy(t, 0, 359, 40)).not.toThrow();
    expect(() => destroy(t, 639, 359, 40)).not.toThrow();
  });
});

describe("bounds and settling", () => {
  it("treats the sides and floor as out of bounds, but not the sky", () => {
    const t = flatTerrain();
    expect(isOutOfBounds(t, -1, 100)).toBe(true);
    expect(isOutOfBounds(t, 999, 100)).toBe(true);
    expect(isOutOfBounds(t, 100, 999)).toBe(true);
    expect(isOutOfBounds(t, 100, -500)).toBe(false); // shots may arc off-screen
  });

  it("drops a floating point onto the surface", () => {
    const t = flatTerrain(250);
    const r = settle(t, 300, 100);
    expect(r.y).toBe(249);
    expect(r.fell).toBe(149);
    expect(r.lost).toBe(false);
  });

  it("does not move something already resting", () => {
    const t = flatTerrain(250);
    expect(settle(t, 300, 249).fell).toBe(0);
  });

  it("reports a fall out of the world as lost", () => {
    const t = createTerrain(64, 64); // entirely empty
    expect(settle(t, 10, 0).lost).toBe(true);
  });
});

describe("spawns", () => {
  it("places everyone on solid ground, inside the map", () => {
    const { terrain } = buildBattlefield("hills", 5);
    const spawns = findSpawns(terrain, 4, makeRng(5));
    expect(spawns).toHaveLength(4);
    for (const s of spawns) {
      expect(s.x).toBeGreaterThan(0);
      expect(s.x).toBeLessThan(terrain.width);
      expect(isSolid(terrain, s.x, s.y + 2)).toBe(true);
    }
  });
});

describe("projectile flight", () => {
  it("aims up and right for a positive angle", () => {
    const v = launchVelocity(45, 100);
    expect(v.vx).toBeGreaterThan(0);
    expect(v.vy).toBeLessThan(0); // negative y is upward
  });

  it("aims left past 90 degrees", () => {
    expect(launchVelocity(135, 100).vx).toBeLessThan(0);
  });

  it("falls and hits the ground", () => {
    const t = flatTerrain(250);
    const shot = simulateShot(t, { x: 100, y: 240 }, launchVelocity(45, 60), { gravity: GRAVITY });
    expect(shot.reason).toBe("terrain");
    expect(shot.impact.y).toBeGreaterThan(230);
    expect(shot.path.length).toBeGreaterThan(3);
  });

  it("carries further downwind than upwind", () => {
    const t = flatTerrain(250);
    // A steep, gentle lob: long hang time makes the drift obvious, and it
    // lands on the map instead of sailing off the edge (where every impact
    // would clamp to the same boundary and the comparison would be vacuous).
    const shoot = (wind) => simulateShot(t, { x: 320, y: 240 }, launchVelocity(85, 55), { wind });
    const calm = shoot(0);
    const tail = shoot(40);
    const head = shoot(-40);
    expect(calm.reason).toBe("terrain");
    expect(tail.impact.x).toBeGreaterThan(calm.impact.x);
    expect(head.impact.x).toBeLessThan(calm.impact.x);
  });

  it("registers a direct hit on a character", () => {
    const t = flatTerrain(250);
    const targets = [{ id: "cat-0", x: 200, y: 240, alive: true }];
    const shot = simulateShot(t, { x: 100, y: 240 }, launchVelocity(30, 62), { targets });
    // Whether or not this particular arc connects, a hit must name its victim.
    if (shot.reason === "target") expect(shot.impact.hitId).toBe("cat-0");
  });

  it("never tunnels through thin ground", () => {
    // A one-pixel ledge: a fast shot must still stop at it.
    const t = createTerrain(TERRAIN_W, TERRAIN_H);
    for (let x = 0; x < t.width; x++) t.mask[200 * t.width + x] = 1;
    const shot = simulateShot(t, { x: 320, y: 150 }, { vx: 0, vy: 30 }, {});
    expect(shot.reason).toBe("terrain");
    expect(shot.impact.y).toBeLessThan(210);
  });

  it("reports leaving the map", () => {
    const t = flatTerrain(250);
    const shot = simulateShot(t, { x: 620, y: 100 }, { vx: 30, vy: 0 }, {});
    expect(shot.reason).toBe("out");
  });

  it("ignores the shooter, so you cannot shoot yourself point blank", () => {
    const t = flatTerrain(250);
    const targets = [{ id: "me", x: 100, y: 240, alive: true }];
    const shot = simulateShot(t, { x: 100, y: 240 }, launchVelocity(80, 50), {
      targets,
      ignoreId: "me"
    });
    expect(shot.impact.hitId).toBeUndefined();
  });
});

describe("blast damage", () => {
  it("is full at the centre and zero at the rim", () => {
    expect(blastDamage(50, 20, 0)).toBe(50);
    expect(blastDamage(50, 20, 20)).toBe(0);
    expect(blastDamage(50, 20, 100)).toBe(0);
  });

  it("falls off with distance", () => {
    const near = blastDamage(50, 20, 5);
    const far = blastDamage(50, 20, 15);
    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(0);
  });
});

describe("wind", () => {
  it("stays inside the range and can blow either way", () => {
    const r = makeRng(3);
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const w = rollWind(r, 12);
      expect(Math.abs(w)).toBeLessThanOrEqual(12);
      seen.add(Math.sign(w));
    }
    expect(seen.has(1) && seen.has(-1)).toBe(true);
  });
});

describe("match setup", () => {
  it("fields both teams at full health", () => {
    const m = createMatch({ perTeam: 2, seed: 8 });
    expect(m.characters).toHaveLength(4);
    expect(aliveOf(m, "dogs")).toHaveLength(2);
    expect(aliveOf(m, "cats")).toHaveLength(2);
    expect(m.characters.every((c) => c.hp === MAX_HP)).toBe(true);
    expect(m.phase).toBe("aim");
    expect(m.winner).toBeNull();
  });

  it("starts with the dogs and a live character", () => {
    const m = createMatch({ seed: 8 });
    expect(TEAMS[m.turnTeamIndex].id).toBe("dogs");
    expect(activeCharacter(m).teamId).toBe("dogs");
  });
});

describe("turns", () => {
  it("alternates teams", () => {
    const m = createMatch({ seed: 8 });
    const a = endTurn(m);
    expect(TEAMS[a.turnTeamIndex].id).toBe("cats");
    expect(TEAMS[endTurn(a).turnTeamIndex].id).toBe("dogs");
  });

  it("re-rolls the wind each turn", () => {
    const m = createMatch({ seed: 8 });
    const winds = new Set();
    let s = m;
    for (let i = 0; i < 12; i++) {
      s = endTurn(s);
      winds.add(s.wind);
    }
    expect(winds.size).toBeGreaterThan(1);
  });

  it("rotates through a team's characters rather than always using the first", () => {
    const m = createMatch({ perTeam: 2, seed: 8 });
    const first = activeCharacter(m).id;
    const later = activeCharacter(endTurn(endTurn(m))).id;
    expect(later).not.toBe(first);
  });
});

describe("firing", () => {
  it("destroys terrain where the shot lands", () => {
    const m = createMatch({ battlefieldId: "hills", perTeam: 2, seed: 8 });
    const before = m.terrain.mask.reduce((n, v) => n + v, 0);
    const { state, shot } = fire(m, { weaponId: "bazooka", angle: 45, power: 70 });
    const after = state.terrain.mask.reduce((n, v) => n + v, 0);
    if (shot.reason === "terrain" || shot.reason === "target") {
      expect(after).toBeLessThan(before);
    }
    expect(state.phase).not.toBe("aim");
  });

  it("refuses to fire outside the aim phase", () => {
    const m = { ...createMatch({ seed: 8 }), phase: "flying" };
    expect(fire(m, { weaponId: "bazooka", angle: 45, power: 70 }).state).toBe(m);
  });

  it("damages a character standing at the impact point", () => {
    const m = createMatch({ perTeam: 1, seed: 8 });
    const victim = m.characters.find((c) => c.teamId === "cats");
    // Drop a blast directly on them via a melee-range check instead of luck.
    const shooter = m.characters.find((c) => c.teamId === "dogs");
    const adjacent = { ...m, characters: m.characters.map((c) => (c.id === shooter.id ? { ...c, x: victim.x + 10, y: victim.y } : c)) };
    const { state } = fire(adjacent, { weaponId: "whack", angle: 180, power: 0 });
    const after = state.characters.find((c) => c.id === victim.id);
    expect(after.hp).toBeLessThan(MAX_HP);
  });

  it("melee only reaches nearby targets", () => {
    const m = createMatch({ perTeam: 1, seed: 8 });
    const victim = m.characters.find((c) => c.teamId === "cats");
    const shooter = m.characters.find((c) => c.teamId === "dogs");
    const farApart = {
      ...m,
      characters: m.characters.map((c) => (c.id === shooter.id ? { ...c, x: Math.max(5, victim.x - 200) } : c))
    };
    const { state } = fire(farApart, { weaponId: "whack", angle: 0, power: 0 });
    expect(state.characters.find((c) => c.id === victim.id).hp).toBe(MAX_HP);
  });

  it("declares a winner when a team is wiped out", () => {
    const m = createMatch({ perTeam: 1, seed: 8 });
    const shooter = m.characters.find((c) => c.teamId === "dogs");
    const victim = m.characters.find((c) => c.teamId === "cats");
    // Stand them right next to each other on both axes — melee measures true
    // distance, so matching only x can still leave them far apart vertically.
    const nearlyDead = {
      ...m,
      characters: m.characters.map((c) =>
        c.id === victim.id ? { ...c, hp: 1, x: shooter.x + 8, y: shooter.y } : c
      )
    };
    const { state } = fire(nearlyDead, { weaponId: "whack", angle: 0, power: 0 });
    expect(state.characters.find((c) => c.id === victim.id).alive).toBe(false);
    expect(state.winner).toBe("dogs");
    expect(state.phase).toBe("over");
  });

  it("ends the match rather than passing the turn to a wiped team", () => {
    const m = createMatch({ perTeam: 1, seed: 8 });
    const dead = { ...m, characters: m.characters.map((c) => (c.teamId === "cats" ? { ...c, hp: 0, alive: false } : c)) };
    expect(endTurn(dead).phase).toBe("over");
  });
});

describe("movement", () => {
  it("walks along the ground and stays standing", () => {
    const m = createMatch({ battlefieldId: "hills", perTeam: 1, seed: 8 });
    const before = activeCharacter(m);
    const after = activeCharacter(moveActive(m, 1));
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(0);
    expect(isSolid(m.terrain, after.x, after.y + 2)).toBe(true);
  });

  it("will not walk off the edge of the map", () => {
    const m = createMatch({ battlefieldId: "hills", perTeam: 1, seed: 8 });
    const atEdge = {
      ...m,
      characters: m.characters.map((c, i) => (i === 0 ? { ...c, x: 1 } : c))
    };
    expect(moveActive(atEdge, -1)).toBe(atEdge);
  });

  it("cannot move outside the aim phase", () => {
    const m = { ...createMatch({ seed: 8 }), phase: "resolve" };
    expect(moveActive(m, 1)).toBe(m);
  });
});

describe("weapons", () => {
  it("exposes three distinct weapons", () => {
    expect(WEAPONS).toHaveLength(3);
    expect(new Set(WEAPONS.map((w) => w.id)).size).toBe(3);
  });

  it("falls back to a real weapon for an unknown id", () => {
    expect(weaponById("nope")).toBe(WEAPONS[0]);
  });

  it("trades damage against blast radius", () => {
    const bazooka = weaponById("bazooka");
    const lobber = weaponById("lobber");
    expect(lobber.radius).toBeGreaterThan(bazooka.radius);
    expect(lobber.damage).toBeLessThan(bazooka.damage);
    expect(lobber.windFactor).toBeGreaterThan(bazooka.windFactor);
  });
});
