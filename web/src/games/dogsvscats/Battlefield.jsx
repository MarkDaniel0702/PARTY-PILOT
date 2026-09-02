import { useCallback, useEffect, useMemo, useRef } from "react";
import { TEAMS, MAX_HP } from "./engine";
import { makeRng, surfaceY } from "./terrain";
import styles from "./dogsvscats.module.css";

// Canvas renderer. Everything on screen is generated — terrain from the mask,
// weather and skyline from a seeded PRNG, characters from emoji — so the game
// still ships no image files at all.
//
// Two things here are deliberate:
//
// 1. There is NO trajectory preview. Judging angle and power is the skill the
//    game is made of, so the canvas shows *which way* the shot leaves (a
//    fixed-length pointer that never grows with power) and nothing about
//    where it will land. The previous impact is marked, because that is
//    memory of something the player already watched — not a prediction.
//
// 2. Drawing runs on a persistent rAF loop rather than repainting on prop
//    change, so clouds drift, characters breathe and the wind is visible.
//    The expensive part — rasterising the terrain mask — is still cached in
//    an offscreen canvas and only rebuilt when the terrain actually changes,
//    so a frame costs one drawImage plus a few dozen primitives. Under
//    `prefers-reduced-motion` the loop is never started and the canvas simply
//    redraws on change, exactly as it used to.

const AIM_PIPS = [15, 20, 25]; // constant radii — never scaled by power
const FLOAT_MS = 1100;
const IMPACT_FADE_MS = 14000;

export function Battlefield({
  terrain,
  terrainVersion,
  battlefield,
  characters,
  activeId,
  aim,
  shot,
  shotProgress,
  explosion,
  wind = 0,
  craters = [],
  floats = [],
  lastImpact = null
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const groundRef = useRef(null);
  const paintedRef = useRef({ version: -1, craters: -1 });
  // Where the ground sits, as a fraction of height — the skyline is placed
  // against this so distant hills always peek above the horizon whatever the
  // battlefield generator produced.
  const horizonRef = useRef(0.6);

  const reduced = usePrefersReducedMotion();

  // Weather and skyline are seeded off the battlefield id, so a given field
  // always wears the same sky while every match's ground is still fresh.
  const scenery = useMemo(() => buildScenery(battlefield), [battlefield]);

  // Latest props for the animation loop, which must not re-subscribe.
  const propsRef = useRef();
  propsRef.current = {
    terrain,
    terrainVersion,
    battlefield,
    characters,
    activeId,
    aim,
    shot,
    shotProgress,
    explosion,
    wind,
    craters,
    floats,
    lastImpact,
    scenery,
    reduced
  };

  // Rebuild the terrain bitmap only when it has actually been dug into.
  const rebuildGround = useCallback((t, field, craterList) => {
    let off = groundRef.current;
    if (!off || off.width !== t.width || off.height !== t.height) {
      off = document.createElement("canvas");
      off.width = t.width;
      off.height = t.height;
      groundRef.current = off;
    }
    const ctx = off.getContext("2d");
    ctx.clearRect(0, 0, t.width, t.height);
    const img = ctx.createImageData(t.width, t.height);
    const data = img.data;

    const g = hexToRgb(field.ground);
    const r = hexToRgb(field.rock);
    const lit = lighten(g, 0.32);
    const deep = darken(r, 0.35);

    for (let y = 0; y < t.height; y++) {
      for (let x = 0; x < t.width; x++) {
        const i = y * t.width + x;
        if (!t.mask[i]) continue;
        // Depth below the surface picks the band: a bright lit rim, then
        // topsoil, then rock fading into shadow. Without this the terrain
        // reads as a flat silhouette.
        const above1 = y > 0 ? t.mask[i - t.width] : 0;
        const above3 = y > 2 ? t.mask[i - t.width * 3] : 0;
        const above8 = y > 7 ? t.mask[i - t.width * 8] : 0;
        let c;
        if (!above1) c = lit;
        else if (!above3) c = g;
        else if (!above8) c = mix(g, r, 0.55);
        else c = mix(r, deep, Math.min(1, (y / t.height) * 1.2));
        // A little deterministic grain, so big flat areas aren't plastic.
        const n = ((x * 73856093) ^ (y * 19349663)) & 7;
        const o = i * 4;
        data[o] = clamp8(c[0] + n - 3);
        data[o + 1] = clamp8(c[1] + n - 3);
        data[o + 2] = clamp8(c[2] + n - 3);
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    let sum = 0;
    let n = 0;
    for (let x = 0; x < t.width; x += 16) {
      const sy = surfaceY(t, x);
      if (sy != null) {
        sum += sy;
        n++;
      }
    }
    horizonRef.current = n ? sum / n / t.height : 0.6;

    // Scorch marks around old craters. `source-atop` tints only pixels that
    // are already solid, so the burn hugs the crater rim and never bleeds
    // into the sky.
    if (craterList.length) {
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      for (const c of craterList) {
        const grad = ctx.createRadialGradient(c.x, c.y, c.r * 0.2, c.x, c.y, c.r * 1.7);
        grad.addColorStop(0, "rgba(24,16,12,0.55)");
        grad.addColorStop(1, "rgba(24,16,12,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, []);

  const drawFrame = useCallback(
    (now) => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      const p = propsRef.current;
      if (!canvas || !wrap || !p.terrain) return;
      const { terrain: t, battlefield: field, scenery: sc } = p;
      const time = p.reduced ? 0 : now;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = wrap.clientWidth;
      if (!cw) return;
      const ch = (cw * t.height) / t.width;
      if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
        canvas.width = Math.round(cw * dpr);
        canvas.height = Math.round(ch * dpr);
        canvas.style.height = ch + "px";
      }

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = cw / t.width;
      const sx = (v) => v * scale;

      // Screen shake, strongest at the moment of detonation.
      let shakeX = 0;
      let shakeY = 0;
      if (p.explosion && !p.reduced) {
        const k = (1 - p.explosion.t) ** 2 * sx(p.explosion.radius) * 0.22;
        shakeX = Math.sin(now / 18) * k;
        shakeY = Math.cos(now / 13) * k;
      }
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // The ground bitmap is rebuilt before anything is painted, so the
      // skyline below can place itself against a current horizon.
      const craterKey = p.craters.length;
      if (paintedRef.current.version !== p.terrainVersion || paintedRef.current.craters !== craterKey) {
        rebuildGround(t, field, p.craters);
        paintedRef.current = { version: p.terrainVersion, craters: craterKey };
      }

      // ---------- sky ----------
      const sky = ctx.createLinearGradient(0, -20, 0, ch);
      sky.addColorStop(0, field.sky[0]);
      sky.addColorStop(1, field.sky[1]);
      ctx.fillStyle = sky;
      ctx.fillRect(-24, -24, cw + 48, ch + 48);

      // Sun or moon, with a soft bloom.
      const light = sc.light;
      const lx = light.x * cw;
      const ly = light.y * ch;
      const lr = sx(light.r);
      const bloom = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr * 2.6);
      bloom.addColorStop(0, rgba(light.colour, 0.55));
      bloom.addColorStop(0.35, rgba(light.colour, 0.18));
      bloom.addColorStop(1, rgba(light.colour, 0));
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(lx, ly, lr * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(light.colour, 0.9);
      ctx.beginPath();
      ctx.arc(lx, ly, lr * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Stars, on the night fields only.
      for (const s of sc.stars) {
        const tw = 0.45 + 0.55 * Math.sin(time / 700 + s.phase);
        ctx.fillStyle = "rgba(255,255,255," + (0.25 + s.mag * 0.6) * tw + ")";
        const size = sx(s.mag * 2 + 0.8);
        ctx.fillRect(s.x * cw, s.y * ch, size, size);
      }

      // ---------- parallax skyline ----------
      const horizon = horizonRef.current;
      sc.ridges.forEach((ridge, i) => {
        const base = Math.max(0.1, Math.min(0.92, horizon - 0.04 - i * 0.055));
        const drift = p.reduced ? 0 : (time / 1000) * (0.6 + i * 0.5) * (1 + p.wind / 24);
        ctx.fillStyle = ridge.colour;
        ctx.globalAlpha = ridge.alpha;
        ctx.beginPath();
        ctx.moveTo(-12, ch + 12);
        for (let x = -12; x <= cw + 12; x += 8) {
          const u = (x + drift * 6) / cw;
          const y =
            base * ch +
            Math.sin(u * ridge.f1 + ridge.p1) * ridge.a1 * ch +
            Math.sin(u * ridge.f2 + ridge.p2) * ridge.a2 * ch;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(cw + 12, ch + 12);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ---------- clouds, carried by the wind ----------
      const span = cw + 260;
      for (const c of sc.clouds) {
        const speed = (0.004 + c.speed * 0.004) * (1 + p.wind * 0.22);
        const raw = c.x * span + (p.reduced ? 0 : time * speed);
        const x = (((raw % span) + span) % span) - 130;
        drawCloud(ctx, x, c.y * ch, sx(c.size), c.alpha, sc.cloudTint);
      }

      // ---------- terrain ----------
      if (groundRef.current) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(groundRef.current, 0, 0, cw, ch);
        ctx.imageSmoothingEnabled = true;
      }

      // ---------- where the last shot landed ----------
      if (p.lastImpact) {
        const age = Math.min(1, (now - p.lastImpact.born) / IMPACT_FADE_MS);
        const a = 0.5 * (1 - age);
        if (a > 0.02) {
          const r = sx(5);
          const mx = sx(p.lastImpact.x);
          const my = sx(p.lastImpact.y);
          ctx.save();
          ctx.strokeStyle = rgba(p.lastImpact.colour, a);
          ctx.lineWidth = Math.max(1.5, sx(1.4));
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(mx - r, my - r);
          ctx.lineTo(mx + r, my + r);
          ctx.moveTo(mx + r, my - r);
          ctx.lineTo(mx - r, my + r);
          ctx.stroke();
          ctx.restore();
        }
      }

      // ---------- characters ----------
      const actor = p.characters.find((c) => c.id === p.activeId);
      p.characters.forEach((c, i) => {
        if (!c.alive) return;
        const team = TEAMS.find((tm) => tm.id === c.teamId) || TEAMS[0];
        const isActive = c.id === p.activeId;
        const bob = p.reduced ? 0 : Math.sin(time / 430 + i * 1.7) * sx(1.4);
        const size = Math.max(18, sx(21));
        const cx = sx(c.x);
        const cy = sx(c.y);

        // Contact shadow, so nobody floats.
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + sx(1.5), size * 0.4, size * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Team ring on the ground — the active one breathes.
        const pulse = isActive && !p.reduced ? 0.7 + 0.3 * Math.sin(time / 260) : 0.55;
        ctx.strokeStyle = rgba(team.colour, isActive ? pulse : 0.4);
        ctx.lineWidth = Math.max(1.5, sx(isActive ? 1.6 : 1));
        ctx.beginPath();
        ctx.ellipse(cx, cy + sx(1.5), size * 0.46, size * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = size + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(team.emoji, cx, cy + sx(2) + bob);

        // Health pill above the head.
        const bw = Math.max(22, sx(26));
        const bh = Math.max(4, sx(4.5));
        const bx = cx - bw / 2;
        const by = cy - size - bh * 2.4 + bob;
        roundRect(ctx, bx - 1.5, by - 1.5, bw + 3, bh + 3, (bh + 3) / 2);
        ctx.fillStyle = "rgba(8,10,16,0.62)";
        ctx.fill();
        ctx.strokeStyle = rgba(team.colour, 0.65);
        ctx.lineWidth = 1;
        ctx.stroke();
        const frac = Math.max(0, c.hp / MAX_HP);
        if (frac > 0) {
          roundRect(ctx, bx, by, Math.max(bh, bw * frac), bh, bh / 2);
          ctx.fillStyle = c.hp > 50 ? "#39d98a" : c.hp > 25 ? "#e8a91d" : "#ff6b6b";
          ctx.fill();
        }

        // Bouncing chevron over whoever is up.
        if (isActive) {
          const hop = p.reduced ? 0 : Math.abs(Math.sin(time / 340)) * sx(3);
          const ty = by - sx(6) - hop;
          ctx.fillStyle = team.colour;
          ctx.beginPath();
          ctx.moveTo(cx, ty + sx(5));
          ctx.lineTo(cx - sx(4), ty - sx(1));
          ctx.lineTo(cx + sx(4), ty - sx(1));
          ctx.closePath();
          ctx.fill();
        }
      });

      // ---------- aim pointer: direction only, never range ----------
      if (p.aim && actor && actor.alive && !p.shot) {
        const team = TEAMS.find((tm) => tm.id === actor.teamId) || TEAMS[0];
        const rad = (p.aim.angle * Math.PI) / 180;
        const ox = sx(actor.x);
        const oy = sx(actor.y) - sx(8);
        AIM_PIPS.forEach((dist, i) => {
          const px = ox + Math.cos(rad) * sx(dist);
          const py = oy - Math.sin(rad) * sx(dist);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.2, sx(2.2 - i * 0.4)), 0, Math.PI * 2);
          ctx.fillStyle = rgba(team.colour, 0.95 - i * 0.2);
          ctx.fill();
          ctx.strokeStyle = "rgba(8,10,16,0.55)";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // ---------- projectile ----------
      if (p.shot && p.shot.path.length > 1) {
        const upto = Math.max(1, Math.floor(p.shot.path.length * p.shotProgress));
        const tailStart = Math.max(0, upto - 90);
        const tailLen = Math.max(1, upto - tailStart);
        ctx.lineCap = "round";
        for (let i = tailStart + 1; i < upto; i++) {
          const [ax, ay] = p.shot.path[i - 1];
          const [bx2, by2] = p.shot.path[i];
          const a = ((i - tailStart) / tailLen) ** 2;
          ctx.strokeStyle = "rgba(255,246,214," + 0.7 * a + ")";
          ctx.lineWidth = Math.max(1, sx(0.6 + a * 1.6));
          ctx.beginPath();
          ctx.moveTo(sx(ax), sx(ay));
          ctx.lineTo(sx(bx2), sx(by2));
          ctx.stroke();
        }

        // Smoke puffs shed along the way.
        for (let i = tailStart; i < upto; i += 7) {
          const [px, py] = p.shot.path[i];
          const a = 0.22 * ((i - tailStart) / tailLen);
          ctx.fillStyle = "rgba(226,226,236," + a + ")";
          ctx.beginPath();
          ctx.arc(sx(px), sx(py), sx(1.6 + (upto - i) * 0.05), 0, Math.PI * 2);
          ctx.fill();
        }

        const [hx, hy] = p.shot.path[upto - 1];
        const [px0, py0] = p.shot.path[Math.max(0, upto - 2)];
        const glow = ctx.createRadialGradient(sx(hx), sx(hy), 0, sx(hx), sx(hy), sx(11));
        glow.addColorStop(0, "rgba(255,230,150,0.75)");
        glow.addColorStop(1, "rgba(255,200,90,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx(hx), sx(hy), sx(11), 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(sx(hx), sx(hy));
        ctx.rotate(Math.atan2(hy - py0, hx - px0));
        ctx.font = Math.max(13, sx(17)) + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.shot.weapon.emoji, 0, 0);
        ctx.restore();
      }

      // ---------- explosion ----------
      if (p.explosion) {
        const { x, y, radius, t: et } = p.explosion;
        const ex = sx(x);
        const ey = sx(y);
        const rr = sx(radius) * (0.5 + et * 1.1);

        const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, Math.max(1, rr));
        grad.addColorStop(0, "rgba(255,244,206," + 0.95 * (1 - et) + ")");
        grad.addColorStop(0.55, "rgba(255,150,60," + 0.7 * (1 - et) + ")");
        grad.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex, ey, Math.max(1, rr), 0, Math.PI * 2);
        ctx.fill();

        // Shockwave rings.
        for (let k = 0; k < 2; k++) {
          const rt = Math.min(1, et * (1 + k * 0.5));
          ctx.strokeStyle = "rgba(255,255,255," + 0.5 * (1 - rt) + ")";
          ctx.lineWidth = Math.max(1, sx(2 * (1 - rt)));
          ctx.beginPath();
          ctx.arc(ex, ey, sx(radius) * (0.4 + rt * 1.9), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Debris, seeded off the impact point so it stays put frame to frame.
        for (const d of debrisFor(x, y)) {
          const dx = ex + Math.cos(d.a) * sx(radius) * d.v * et * 2.2;
          const dy = ey + Math.sin(d.a) * sx(radius) * d.v * et * 2.2 + sx(26) * et * et;
          ctx.fillStyle = "rgba(60,44,32," + 0.85 * (1 - et) + ")";
          ctx.fillRect(dx, dy, sx(d.s), sx(d.s));
        }

        // Lingering smoke.
        const smokeY = ey - sx(6) * et;
        const smoke = ctx.createRadialGradient(ex, smokeY, 0, ex, smokeY, Math.max(1, rr * 0.9));
        smoke.addColorStop(0, "rgba(70,66,66," + 0.32 * et + ")");
        smoke.addColorStop(1, "rgba(70,66,66,0)");
        ctx.fillStyle = smoke;
        ctx.beginPath();
        ctx.arc(ex, smokeY, Math.max(1, rr * 0.9), 0, Math.PI * 2);
        ctx.fill();
      }

      // ---------- damage numbers ----------
      for (const f of p.floats) {
        const age = (now - f.born) / FLOAT_MS;
        if (age < 0 || age > 1) continue;
        const a = 1 - age ** 2;
        const fy = sx(f.y) - sx(14) - age * sx(20);
        ctx.font = "800 " + Math.max(11, sx(13)) + "px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = Math.max(2, sx(2));
        ctx.strokeStyle = "rgba(8,10,16," + 0.7 * a + ")";
        ctx.strokeText("-" + f.amount, sx(f.x), fy);
        ctx.fillStyle = "rgba(255,120,110," + a + ")";
        ctx.fillText("-" + f.amount, sx(f.x), fy);
      }

      ctx.restore();

      // ---------- frame vignette ----------
      const vig = ctx.createRadialGradient(
        cw / 2,
        ch / 2,
        Math.min(cw, ch) * 0.35,
        cw / 2,
        ch / 2,
        Math.max(cw, ch) * 0.75
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.34)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, cw, ch);
    },
    [rebuildGround]
  );

  // Animated: one loop for the life of the component. Reduced motion: no loop
  // at all, just a redraw whenever props change (the effect below).
  useEffect(() => {
    if (reduced) return undefined;
    let raf = requestAnimationFrame(function tick(now) {
      drawFrame(now);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [reduced, drawFrame]);

  useEffect(() => {
    if (reduced) drawFrame(performance.now());
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => drawFrame(performance.now()));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [drawFrame]);

  return (
    <div ref={wrapRef} className={styles.field}>
      <canvas ref={canvasRef} className={styles.fieldCanvas} role="img" aria-label="Battlefield" />
    </div>
  );
}

// ---------- scenery ----------

// Clouds, stars and skyline ridges for one battlefield, seeded off its id so
// the same field always wears the same sky.
function buildScenery(field) {
  const decor = field.decor || {};
  const night = (decor.stars || 0) > 0;
  const rng = makeRng(hashString(field.id));
  const clouds = [];
  for (let i = 0; i < (decor.clouds || 0); i++) {
    clouds.push({
      x: rng(),
      y: 0.08 + rng() * 0.3,
      size: 16 + rng() * 22,
      speed: rng(),
      alpha: night ? 0.1 + rng() * 0.12 : 0.28 + rng() * 0.38
    });
  }
  const stars = [];
  for (let i = 0; i < (decor.stars || 0); i++) {
    stars.push({ x: rng(), y: rng() * 0.6, mag: rng(), phase: rng() * 6.28 });
  }
  const hills = decor.hills || [field.rock, field.rock];
  const ridges = hills.map((colour, i) => ({
    colour,
    alpha: 0.5 - i * 0.12,
    f1: 4 + rng() * 3,
    f2: 9 + rng() * 5,
    p1: rng() * 6.28,
    p2: rng() * 6.28,
    a1: 0.05 - i * 0.012,
    a2: 0.02
  }));
  return {
    clouds,
    stars,
    ridges,
    cloudTint: night ? "150,158,196" : "255,255,255",
    light: decor.light || { x: 0.2, y: 0.16, r: 44, colour: "#fff6c4" }
  };
}

function drawCloud(ctx, x, y, r, alpha, tint) {
  ctx.fillStyle = "rgba(" + tint + "," + alpha + ")";
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.52, 0, 0, Math.PI * 2);
  ctx.ellipse(x + r * 0.75, y + r * 0.1, r * 0.62, r * 0.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x - r * 0.7, y + r * 0.14, r * 0.55, r * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Stable per-impact debris, so the particles don't reshuffle every frame.
const debrisCache = new Map();
function debrisFor(x, y) {
  const key = Math.round(x) + ":" + Math.round(y);
  const hit = debrisCache.get(key);
  if (hit) return hit;
  const rng = makeRng(hashString(key));
  const made = Array.from({ length: 14 }, () => ({
    a: rng() * Math.PI * 2,
    v: 0.5 + rng() * 0.9,
    s: 1 + rng() * 2.2
  }));
  if (debrisCache.size > 64) debrisCache.clear();
  debrisCache.set(key, made);
  return made;
}

function usePrefersReducedMotion() {
  const ref = useRef(false);
  if (typeof window !== "undefined" && window.matchMedia) {
    ref.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return ref.current;
}

// ---------- helpers ----------

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp8(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function lighten(c, t) {
  return mix(c, [255, 255, 255], t);
}

function darken(c, t) {
  return mix(c, [0, 0, 0], t);
}

function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
