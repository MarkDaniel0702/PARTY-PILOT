// Destructible terrain as a bitmap mask. No images anywhere: the battlefield
// is generated from a seed, and explosions punch holes straight into the mask.
// Pure and unit-tested (terrain.test.js) — the renderer just draws whatever
// this produces.
//
// One coordinate space throughout: mask pixels. Characters, projectiles and
// blast radii are all in these units, and only the renderer scales to CSS px.

export const TERRAIN_W = 640;
export const TERRAIN_H = 360;

// Small deterministic PRNG so a seed always rebuilds the same battlefield —
// which also makes the generators testable.
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

export function createTerrain(width = TERRAIN_W, height = TERRAIN_H) {
  return { width, height, mask: new Uint8Array(width * height) };
}

export function isSolid(terrain, x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= terrain.width || iy >= terrain.height) return false;
  return terrain.mask[iy * terrain.width + ix] === 1;
}

// Off the sides or bottom is out of bounds — anything there is lost.
export function isOutOfBounds(terrain, x, y) {
  return x < 0 || x >= terrain.width || y >= terrain.height;
}

function fillColumnsFromHeights(terrain, heights) {
  const { width, height, mask } = terrain;
  for (let x = 0; x < width; x++) {
    const top = Math.max(0, Math.min(height, Math.round(heights[x])));
    for (let y = top; y < height; y++) mask[y * width + x] = 1;
  }
  return terrain;
}

// Midpoint displacement, the workhorse behind the hilly battlefields.
//
// Generated on a 2^k+1 grid and then resampled to `width`. Doing it directly
// on an arbitrary width leaves most indices untouched (the algorithm only
// lands on power-of-two midpoints), which collapses the whole heightmap.
// Results are clamped to a band so a battlefield can never fill the screen
// or vanish entirely.
function midpointHeights(width, rng, roughness, baseline, amplitude, minY, maxY) {
  let size = 2;
  while (size + 1 < width) size *= 2;
  size += 1;

  const grid = new Float32Array(size);
  grid[0] = baseline + (rng() - 0.5) * amplitude;
  grid[size - 1] = baseline + (rng() - 0.5) * amplitude;

  let step = size - 1;
  let scale = amplitude;
  while (step > 1) {
    const half = step >> 1;
    for (let i = half; i < size; i += step) {
      const left = grid[i - half];
      const right = grid[i + half];
      grid[i] = (left + right) / 2 + (rng() - 0.5) * scale;
    }
    step = half;
    scale *= roughness;
  }

  const lo = minY ?? baseline - amplitude;
  const hi = maxY ?? baseline + amplitude;
  const out = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const t = (x / (width - 1)) * (size - 1);
    const i = Math.floor(t);
    const f = t - i;
    const v = i + 1 < size ? grid[i] * (1 - f) + grid[i + 1] * f : grid[i];
    out[x] = Math.max(lo, Math.min(hi, v));
  }
  return out;
}

function smooth(heights, passes = 2) {
  let cur = heights;
  for (let p = 0; p < passes; p++) {
    const next = Float32Array.from(cur);
    for (let i = 1; i < cur.length - 1; i++) {
      next[i] = (cur[i - 1] + cur[i] + cur[i + 1]) / 3;
    }
    cur = next;
  }
  return cur;
}

function carve(terrain, cx, cy, r) {
  destroy(terrain, cx, cy, r);
}

// ---------- the six battlefields ----------
// Each is a generator, not a picture: same map, different every match.

export const BATTLEFIELDS = [
  {
    id: "hills",
    name: "Rolling Hills",
    emoji: "🌄",
    sky: ["#8fd0ee", "#dff1fb"],
    ground: "#5aa845",
    rock: "#3d7a30",
    build(terrain, rng) {
      const h = smooth(midpointHeights(terrain.width, rng, 0.55, terrain.height * 0.55, 150, terrain.height * 0.3, terrain.height * 0.85), 2);
      return fillColumnsFromHeights(terrain, h);
    }
  },
  {
    id: "islands",
    name: "Scattered Isles",
    emoji: "🏝️",
    sky: ["#7fc7e8", "#e8f6fb"],
    ground: "#d8c48a",
    rock: "#b09a5e",
    build(terrain, rng) {
      const { width, height } = terrain;
      const count = 3 + Math.floor(rng() * 2);
      for (let i = 0; i < count; i++) {
        const cx = ((i + 0.5) / count) * width + (rng() - 0.5) * 60;
        const top = height * (0.45 + rng() * 0.25);
        const rx = width / (count * 2.1);
        for (let x = Math.floor(cx - rx); x < cx + rx; x++) {
          if (x < 0 || x >= width) continue;
          const t = (x - cx) / rx;
          const lift = Math.cos((t * Math.PI) / 2) ** 0.8;
          const colTop = top + (1 - lift) * 90;
          for (let y = Math.floor(colTop); y < height; y++) {
            // Islands taper rather than reaching the floor.
            if (y > colTop + 120 + lift * 60) break;
            terrain.mask[y * width + x] = 1;
          }
        }
      }
      return terrain;
    }
  },
  {
    id: "caves",
    name: "Cat Caves",
    emoji: "🕳️",
    sky: ["#2f3550", "#4a5170"],
    ground: "#6b5f7a",
    rock: "#4b4159",
    build(terrain, rng) {
      const { width, height } = terrain;
      const h = smooth(midpointHeights(width, rng, 0.5, height * 0.3, 90, height * 0.18, height * 0.5), 3);
      fillColumnsFromHeights(terrain, h);
      // Bore a few tunnels through the rock.
      const tunnels = 2 + Math.floor(rng() * 2);
      for (let t = 0; t < tunnels; t++) {
        let x = rng() * width;
        let y = height * (0.55 + rng() * 0.3);
        let dir = rng() < 0.5 ? -1 : 1;
        for (let s = 0; s < 260; s++) {
          carve(terrain, x, y, 14 + rng() * 8);
          x += dir * (3 + rng() * 2);
          y += (rng() - 0.5) * 5;
          if (x < 0 || x > width) break;
        }
      }
      return terrain;
    }
  },
  {
    id: "canyon",
    name: "Canyon Standoff",
    emoji: "🏜️",
    sky: ["#f0b27a", "#fce4c8"],
    ground: "#c0703f",
    rock: "#8f4f2a",
    build(terrain, rng) {
      const { width, height } = terrain;
      const h = smooth(midpointHeights(width, rng, 0.6, height * 0.45, 60, height * 0.3, height * 0.7), 3);
      fillColumnsFromHeights(terrain, h);
      // A deep central chasm, so the teams must lob over it.
      const cx = width / 2 + (rng() - 0.5) * 60;
      const halfW = 45 + rng() * 25;
      for (let x = Math.floor(cx - halfW); x < cx + halfW; x++) {
        if (x < 0 || x >= width) continue;
        for (let y = 0; y < height; y++) terrain.mask[y * width + x] = 0;
      }
      return terrain;
    }
  },
  {
    id: "platforms",
    name: "Sky Platforms",
    emoji: "☁️",
    sky: ["#a8b8ee", "#e6ecfb"],
    ground: "#7c8cc4",
    rock: "#5b6aa0",
    build(terrain, rng) {
      const { width, height } = terrain;
      const slabs = 5 + Math.floor(rng() * 3);
      for (let i = 0; i < slabs; i++) {
        const w = 70 + rng() * 80;
        const x0 = (i / slabs) * width + (rng() - 0.5) * 40;
        const y0 = height * (0.35 + rng() * 0.45);
        const thick = 18 + rng() * 16;
        for (let x = Math.floor(x0); x < x0 + w; x++) {
          if (x < 0 || x >= width) continue;
          for (let y = Math.floor(y0); y < y0 + thick; y++) {
            if (y < 0 || y >= height) continue;
            terrain.mask[y * width + x] = 1;
          }
        }
      }
      return terrain;
    }
  },
  {
    id: "craters",
    name: "Crater Field",
    emoji: "🌑",
    sky: ["#3b3f52", "#6d7183"],
    ground: "#9a9aa6",
    rock: "#6f6f7c",
    build(terrain, rng) {
      const { width, height } = terrain;
      const h = smooth(midpointHeights(width, rng, 0.55, height * 0.5, 110, height * 0.3, height * 0.8), 2);
      fillColumnsFromHeights(terrain, h);
      const craters = 6 + Math.floor(rng() * 5);
      for (let i = 0; i < craters; i++) {
        carve(terrain, rng() * width, height * (0.5 + rng() * 0.4), 18 + rng() * 26);
      }
      return terrain;
    }
  }
];

export function buildBattlefield(battlefieldId, seed, width = TERRAIN_W, height = TERRAIN_H) {
  const def = BATTLEFIELDS.find((b) => b.id === battlefieldId) || BATTLEFIELDS[0];
  const terrain = createTerrain(width, height);
  def.build(terrain, makeRng(seed));
  return { terrain, def };
}

// Punch a circular hole. Returns how many solid cells were removed, which is
// what the tests assert on.
export function destroy(terrain, cx, cy, radius) {
  const { width, height, mask } = terrain;
  const r2 = radius * radius;
  let removed = 0;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(width - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(height - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > r2) continue;
      const i = y * width + x;
      if (mask[i]) {
        mask[i] = 0;
        removed++;
      }
    }
  }
  return removed;
}

// Drop a point until it rests on solid ground. Returns the resting y and how
// far it fell, so callers can apply fall damage.
export function settle(terrain, x, y, maxFall = terrain.height) {
  let cur = Math.floor(y);
  let fell = 0;
  while (fell < maxFall) {
    const below = cur + 1;
    if (below >= terrain.height) return { y: terrain.height, fell, lost: true };
    if (isSolid(terrain, x, below)) break;
    cur = below;
    fell++;
  }
  return { y: cur, fell, lost: false };
}

// Highest solid y in a column (its surface), or null for an empty column.
export function surfaceY(terrain, x) {
  const ix = Math.floor(x);
  if (ix < 0 || ix >= terrain.width) return null;
  for (let y = 0; y < terrain.height; y++) {
    if (terrain.mask[y * terrain.width + ix] === 1) return y;
  }
  return null;
}

// Spawn points spread across the map, alternating sides so the two teams
// start apart. Only columns with real ground are eligible.
export function findSpawns(terrain, count, rng = Math.random) {
  const spots = [];
  const margin = 30;
  const usable = terrain.width - margin * 2;
  const attemptsPerSlot = 40;
  for (let i = 0; i < count; i++) {
    const lane = margin + (usable * (i + 0.5)) / count;
    let placed = null;
    for (let a = 0; a < attemptsPerSlot; a++) {
      const x = Math.round(lane + (rng() - 0.5) * (usable / count) * 0.8);
      const y = surfaceY(terrain, x);
      if (y != null && y > 10 && y < terrain.height - 4) {
        placed = { x, y: y - 1 };
        break;
      }
    }
    // Fall back to any solid column so a spawn is never dropped.
    if (!placed) {
      for (let x = margin; x < terrain.width - margin; x++) {
        const y = surfaceY(terrain, x);
        if (y != null && y > 10) {
          placed = { x, y: y - 1 };
          break;
        }
      }
    }
    spots.push(placed || { x: Math.round(lane), y: 10 });
  }
  return spots;
}
