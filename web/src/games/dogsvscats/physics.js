import { isSolid, isOutOfBounds } from "./terrain";

// Projectile flight. The whole shot is simulated the moment it's fired and
// the resulting path is animated afterwards — so the outcome is deterministic,
// frame-rate independent, and testable without a browser (physics.test.js).

export const GRAVITY = 0.32;
export const MAX_STEPS = 1400;
// Sub-stepping is scaled to speed so each sub-step advances at most ~1px.
// A fixed count isn't enough: a fast shell moving 30px in a step would skip
// clean through a thin ledge, and thin ledges are exactly what a destructible
// battlefield is full of. Capped so a freak velocity can't stall the sim.
const MAX_SUBSTEPS = 64;

function substepsFor(vx, vy) {
  return Math.max(1, Math.min(MAX_SUBSTEPS, Math.ceil(Math.hypot(vx, vy))));
}

export function launchVelocity(angleDeg, power) {
  const rad = (angleDeg * Math.PI) / 180;
  const speed = power * 0.18;
  return { vx: Math.cos(rad) * speed, vy: -Math.sin(rad) * speed };
}

/**
 * Fly a shot to its conclusion.
 *
 * Returns { path, impact, reason } where reason is:
 *   "terrain"  hit the ground
 *   "target"   hit a character (impact.hitId names them)
 *   "out"      left the battlefield
 *   "expired"  ran out of steps
 */
export function simulateShot(terrain, start, velocity, options = {}) {
  const {
    gravity = GRAVITY,
    wind = 0,
    maxSteps = MAX_STEPS,
    targets = [],
    targetRadius = 7,
    ignoreId = null
  } = options;

  let x = start.x;
  let y = start.y;
  let vx = velocity.vx;
  let vy = velocity.vy;

  const path = [[x, y]];

  for (let step = 0; step < maxSteps; step++) {
    vx += wind * 0.01;
    vy += gravity;

    const subs = substepsFor(vx, vy);
    for (let s = 0; s < subs; s++) {
      x += vx / subs;
      y += vy / subs;

      if (isOutOfBounds(terrain, x, y)) {
        path.push([x, y]);
        return { path, impact: { x, y }, reason: "out" };
      }

      for (const t of targets) {
        if (!t.alive || t.id === ignoreId) continue;
        const dx = t.x - x;
        const dy = t.y - y;
        if (dx * dx + dy * dy <= targetRadius * targetRadius) {
          path.push([x, y]);
          return { path, impact: { x, y, hitId: t.id }, reason: "target" };
        }
      }

      if (isSolid(terrain, x, y)) {
        path.push([x, y]);
        return { path, impact: { x, y }, reason: "terrain" };
      }
    }

    // Above the battlefield is legal — shots arc off-screen and come back.
    path.push([x, y]);
  }

  return { path, impact: { x, y }, reason: "expired" };
}

// Blast damage falls off linearly to zero at the rim, so a near miss still
// stings but a direct hit is clearly better.
export function blastDamage(maxDamage, radius, distance) {
  if (distance >= radius) return 0;
  const falloff = 1 - distance / radius;
  return Math.max(1, Math.round(maxDamage * falloff));
}

export function distance(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// Wind is redrawn each turn: a signed strength that nudges shots sideways.
export function rollWind(rng = Math.random, max = 12) {
  return Math.round((rng() * 2 - 1) * max);
}
