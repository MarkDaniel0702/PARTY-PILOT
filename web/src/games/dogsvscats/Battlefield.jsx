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
const GHOST_MS = 1300;

// Blast looks per weapon: RGB triplets for the fireball, an ember hue range,
// and what the flying chunks are made of. The fish is a splash, not a fire.
const PALETTES = {
  bazooka: { core: "255,244,206", mid: "255,150,60", edge: "255,120,40", smoke: "70,66,66", hue: 18, span: 36, chunk: "60,44,32", round: false },
  lobber: { core: "236,251,255", mid: "90,200,255", edge: "40,140,230", smoke: "170,205,225", hue: 190, span: 30, chunk: "150,215,255", round: true },
  whack: { core: "255,250,220", mid: "255,210,80", edge: "255,170,40", smoke: "120,110,90", hue: 38, span: 24, chunk: "255,210,90", round: false }
};

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
  weaponEmoji = null,
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
  // Per-frame animation state that must survive between frames but never
  // trigger a re-render: eased aim, smoothed character positions, ghosts.
  const fxRef = useRef({
    last: 0,
    disp: null,
    activeId: null,
    shotSeen: null,
    recoilBorn: -1e9,
    pos: new Map(),
    facing: new Map(),
    alive: new Map(),
    ghosts: []
  });

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
    weaponEmoji,
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

      // Screen shake and a small zoom punch toward the blast, both strongest
      // at the moment of detonation and decaying with it.
      let shakeX = 0;
      let shakeY = 0;
      if (p.explosion && !p.reduced) {
        const k = (1 - p.explosion.t) ** 2 * sx(p.explosion.radius) * 0.28;
        shakeX = Math.sin(now / 18) * k;
        shakeY = Math.cos(now / 13) * k;
      }
      ctx.save();
      ctx.translate(shakeX, shakeY);
      if (p.explosion && !p.reduced) {
        const z = 1 + 0.035 * (1 - p.explosion.t) ** 3;
        const zx = sx(p.explosion.x);
        const zy = sx(p.explosion.y);
        ctx.translate(zx, zy);
        ctx.scale(z, z);
        ctx.translate(-zx, -zy);
      }

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

      // ---------- wind streaks ----------
      if (!p.reduced && p.wind) {
        const dirn = Math.sign(p.wind);
        const strength = Math.min(1, Math.abs(p.wind) / 12);
        const n = Math.round(4 + strength * 14);
        const lap = cw + 200;
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1, sx(0.7));
        ctx.strokeStyle = "rgba(255,255,255," + (0.07 + strength * 0.1) + ")";
        for (let i = 0; i < n; i++) {
          const seed = hash01(i * 97 + 13);
          const len = sx(10 + seed * 16) * (0.6 + strength);
          const raw = seed * lap + time * (0.05 + seed * 0.06) * (0.4 + strength) * dirn;
          const x = (((raw % lap) + lap) % lap) - 100;
          const y = (0.08 + hash01(i * 31 + 7) * 0.72) * ch;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - dirn * len, y + len * 0.06);
          ctx.stroke();
        }
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
      const fx = fxRef.current;
      const dtms = fx.last ? Math.min(64, now - fx.last) : 16;
      fx.last = now;
      const snap = p.reduced;

      // The aim readout eases toward what the player asked for, so a drag on
      // the slider (or a phone message arriving in a lump) glides instead of
      // teleporting. Snaps when the actor changes.
      if (p.aim) {
        if (!fx.disp || fx.activeId !== p.activeId || snap) {
          fx.disp = { angle: p.aim.angle, power: p.aim.power };
          fx.activeId = p.activeId;
        } else {
          const k = 1 - Math.exp(-dtms / 70);
          fx.disp.angle += (p.aim.angle - fx.disp.angle) * k;
          fx.disp.power += (p.aim.power - fx.disp.power) * k;
        }
      }
      const dAngle = fx.disp ? fx.disp.angle : 45;
      const dPower = fx.disp ? fx.disp.power : 70;
      const aimRad = (dAngle * Math.PI) / 180;

      if (p.shot && fx.shotSeen !== p.shot) {
        fx.shotSeen = p.shot;
        fx.recoilBorn = now;
      }
      if (!p.shot) fx.shotSeen = null;
      const recoil = snap ? 0 : Math.max(0, 1 - (now - fx.recoilBorn) / 280);

      const hitAt = new Map();
      for (const f of p.floats) {
        const a = (now - f.born) / FLOAT_MS;
        if (f.charId && a >= 0 && a < 0.3) hitAt.set(f.charId, a / 0.3);
      }

      const actor = p.characters.find((c) => c.id === p.activeId);
      p.characters.forEach((c, i) => {
        const team = TEAMS.find((tm) => tm.id === c.teamId) || TEAMS[0];
        let pos = fx.pos.get(c.id);
        if (!pos) {
          pos = { x: c.x, y: c.y, lag: c.hp };
          fx.pos.set(c.id, pos);
        }
        const wasAlive = fx.alive.get(c.id);
        fx.alive.set(c.id, c.alive);
        if (wasAlive && !c.alive && !snap) {
          fx.ghosts.push({ x: pos.x, y: pos.y, born: now, colour: team.colour });
        }
        if (!c.alive) return;

        // Knockback and falls glide into place rather than snapping.
        const ease = snap ? 1 : 1 - Math.exp(-dtms / 85);
        pos.x += (c.x - pos.x) * ease;
        pos.y += (c.y - pos.y) * ease;
        pos.lag = c.hp >= pos.lag || snap ? c.hp : pos.lag + (c.hp - pos.lag) * (1 - Math.exp(-dtms / 420));

        const isActive = c.id === p.activeId;
        const hit = hitAt.has(c.id) ? 1 - hitAt.get(c.id) : 0;
        const bob = snap ? 0 : Math.sin(time / 430 + i * 1.7) * sx(1.4);
        const size = Math.max(18, sx(21));
        const jx = hit && !snap ? Math.sin(now / 21) * sx(2) * hit : 0;
        const cx = sx(pos.x) + jx;
        const cy = sx(pos.y);

        let facing = fx.facing.get(c.id) ?? (team.id === TEAMS[0].id ? 1 : -1);
        if (isActive && p.aim) facing = Math.cos(aimRad) >= 0 ? 1 : -1;
        fx.facing.set(c.id, facing);

        // Contact shadow, so nobody floats.
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + sx(1.5), size * 0.4, size * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Team ring on the ground — the active one breathes.
        const pulse = isActive && !snap ? 0.7 + 0.3 * Math.sin(time / 260) : 0.55;
        ctx.strokeStyle = rgba(team.colour, isActive ? pulse : 0.4);
        ctx.lineWidth = Math.max(1.5, sx(isActive ? 1.6 : 1));
        ctx.beginPath();
        ctx.ellipse(cx, cy + sx(1.5), size * 0.46, size * 0.16, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Body: leans toward where it's aiming, kicks back on firing, and
        // flushes red for a beat when hit.
        const lean = facing * 0.1 * (isActive ? 1 : 0.5) - (isActive ? facing * 0.32 * recoil : 0);
        ctx.save();
        ctx.translate(cx, cy + sx(2) + bob);
        ctx.rotate(lean);
        ctx.scale(1 + 0.08 * recoil, 1 - 0.08 * recoil);
        if (hit) {
          ctx.shadowColor = "rgba(255,70,60," + hit + ")";
          ctx.shadowBlur = 16 * hit;
        }
        ctx.font = size + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(team.emoji, 0, 0);
        ctx.restore();

        // Health pill above the head, with a pale trail where the loss was.
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
        const lagFrac = Math.max(0, pos.lag / MAX_HP);
        if (lagFrac > 0) {
          roundRect(ctx, bx, by, Math.max(bh, bw * lagFrac), bh, bh / 2);
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fill();
        }
        const frac = Math.max(0, c.hp / MAX_HP);
        if (frac > 0) {
          roundRect(ctx, bx, by, Math.max(bh, bw * frac), bh, bh / 2);
          ctx.fillStyle = c.hp > 50 ? "#39d98a" : c.hp > 25 ? "#e8a91d" : "#ff6b6b";
          ctx.fill();
        }

        // Bouncing chevron over whoever is up.
        if (isActive) {
          const hop = snap ? 0 : Math.abs(Math.sin(time / 340)) * sx(3);
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

      // ---------- aim rig: direction and effort, never range ----------
      // Angle fan, marching pointer dots, a locked-on reticle and a power
      // ring. The ring shows how hard you're throwing (the HUD already says
      // so); none of it says where the shot lands.
      const actorPos = actor && actor.alive ? fx.pos.get(actor.id) : null;
      if (p.aim && actorPos && !p.shot) {
        const team = TEAMS.find((tm) => tm.id === actor.teamId) || TEAMS[0];
        const ox = sx(actorPos.x);
        const oy = sx(actorPos.y) - sx(8);
        const pw = Math.max(0, Math.min(1, dPower / 100));
        const glowCol = "hsl(" + (140 - pw * 135) + " 90% 58%)";
        const beat = snap ? 0 : Math.sin(time / 180);

        // Angle fan from horizontal up to the pointer.
        const fanR = sx(27);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        if (aimRad >= 0) ctx.arc(ox, oy, fanR, -aimRad, 0);
        else ctx.arc(ox, oy, fanR, 0, -aimRad);
        ctx.closePath();
        ctx.fillStyle = rgba(team.colour, 0.14);
        ctx.fill();
        ctx.strokeStyle = rgba(team.colour, 0.5);
        ctx.setLineDash([sx(1.6), sx(2.2)]);
        ctx.lineWidth = Math.max(1, sx(0.7));
        ctx.stroke();
        ctx.restore();

        // Power ring.
        const ringR = sx(15.5);
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(2.5, sx(2.6));
        ctx.strokeStyle = "rgba(8,10,16,0.42)";
        ctx.beginPath();
        ctx.arc(ox, oy, ringR, 0, Math.PI * 2);
        ctx.stroke();
        if (pw > 0.01) {
          ctx.shadowColor = glowCol;
          ctx.shadowBlur = 8 + beat * 3;
          ctx.strokeStyle = glowCol;
          ctx.beginPath();
          ctx.arc(ox, oy, ringR, -Math.PI / 2, -Math.PI / 2 + pw * Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        // Marching pointer dots — fixed length, so power never grows them.
        const step = sx(5);
        const march = snap ? 0 : ((time / 520) % 1) * step;
        const cosA = Math.cos(aimRad);
        const sinA = Math.sin(aimRad);
        for (let i = 0; i < 6; i++) {
          const d = sx(19) + i * step + march;
          const f = Math.max(0, 1 - (d - sx(19)) / (step * 6));
          ctx.beginPath();
          ctx.arc(ox + cosA * d, oy - sinA * d, Math.max(1, sx(1.9) * (0.5 + f * 0.6)), 0, Math.PI * 2);
          ctx.fillStyle = rgba(team.colour, 0.95 * f);
          ctx.fill();
        }

        // Reticle: ring, spinning ticks, centre pip.
        const rx = ox + cosA * sx(50);
        const ry = oy - sinA * sx(50);
        const rr2 = sx(5.2 + beat * 0.5);
        ctx.save();
        ctx.translate(rx, ry);
        ctx.shadowColor = rgba(team.colour, 0.9);
        ctx.shadowBlur = 10;
        ctx.strokeStyle = rgba(team.colour, 0.95);
        ctx.lineWidth = Math.max(1.4, sx(1));
        ctx.beginPath();
        ctx.arc(0, 0, rr2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(snap ? 0 : time / 900);
        ctx.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2;
          ctx.moveTo(Math.cos(a) * (rr2 + sx(1)), Math.sin(a) * (rr2 + sx(1)));
          ctx.lineTo(Math.cos(a) * (rr2 + sx(3.6)), Math.sin(a) * (rr2 + sx(3.6)));
        }
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(rx, ry, Math.max(1, sx(0.9)), 0, Math.PI * 2);
        ctx.fill();

        // The weapon itself, held out along the aim.
        const held = p.weaponEmoji;
        if (held) {
          ctx.save();
          ctx.translate(ox + cosA * sx(11), oy - sinA * sx(11));
          ctx.rotate(-aimRad);
          if (cosA < 0) ctx.scale(1, -1);
          ctx.font = Math.max(11, sx(13)) + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(held, 0, 0);
          ctx.restore();
        }
      }

      // ---------- projectile ----------
      if (p.shot && p.shot.path.length > 1) {
        const lob = p.shot.weapon.id === "lobber";
        const trail = lob ? "200,236,255" : "255,236,190";
        const upto = Math.max(1, Math.floor(p.shot.path.length * p.shotProgress));
        const tailStart = Math.max(0, upto - 90);
        const tailLen = Math.max(1, upto - tailStart);
        ctx.lineCap = "round";
        for (let i = tailStart + 1; i < upto; i++) {
          const [ax, ay] = p.shot.path[i - 1];
          const [bx2, by2] = p.shot.path[i];
          const a = ((i - tailStart) / tailLen) ** 2;
          ctx.strokeStyle = "rgba(" + trail + "," + 0.75 * a + ")";
          ctx.lineWidth = Math.max(1, sx(0.6 + a * 1.9));
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

        // Sparks (or spray) thrown off behind it. Seeded by path index, so
        // each one holds its place from frame to frame.
        for (let i = tailStart; i < upto; i += 2) {
          const s1 = hash01(i * 3 + 1);
          const s2 = hash01(i * 3 + 2);
          const age = (upto - i) / 90;
          const [px, py] = p.shot.path[i];
          const drift = (s1 - 0.5) * sx(9) * age;
          const fall = age * age * sx(9) * (0.4 + s2);
          ctx.fillStyle = lob
            ? "rgba(150,215,255," + 0.7 * (1 - age) + ")"
            : "rgba(255," + Math.round(150 + s2 * 90) + ",70," + 0.85 * (1 - age) + ")";
          ctx.beginPath();
          ctx.arc(sx(px) + drift, sx(py) + fall, Math.max(0.8, sx(0.5 + s2 * 0.9) * (1 - age * 0.7)), 0, Math.PI * 2);
          ctx.fill();
        }

        const [hx, hy] = p.shot.path[upto - 1];
        const glow = ctx.createRadialGradient(sx(hx), sx(hy), 0, sx(hx), sx(hy), sx(12));
        glow.addColorStop(0, lob ? "rgba(170,225,255,0.8)" : "rgba(255,230,150,0.8)");
        glow.addColorStop(1, lob ? "rgba(90,180,255,0)" : "rgba(255,200,90,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx(hx), sx(hy), sx(12), 0, Math.PI * 2);
        ctx.fill();

        // The projectile tumbles in flight rather than pointing along its arc.
        ctx.save();
        ctx.translate(sx(hx), sx(hy));
        ctx.rotate(snap ? 0 : now / 95);
        ctx.font = Math.max(13, sx(17)) + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.shot.weapon.emoji, 0, 0);
        ctx.restore();

        // Muzzle flash at the launch point.
        const launchAge = (now - fx.recoilBorn) / 200;
        if (launchAge >= 0 && launchAge < 1 && !snap) {
          const [mx0, my0] = p.shot.path[0];
          const mx = sx(mx0);
          const my = sx(my0);
          const mr = sx(16) * (0.5 + launchAge);
          const fl = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
          fl.addColorStop(0, "rgba(255,255,240," + 0.95 * (1 - launchAge) + ")");
          fl.addColorStop(0.4, "rgba(255,200,90," + 0.6 * (1 - launchAge) + ")");
          fl.addColorStop(1, "rgba(255,150,40,0)");
          ctx.fillStyle = fl;
          ctx.beginPath();
          ctx.arc(mx, my, mr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---------- explosion ----------
      if (p.explosion) {
        const { x, y, radius, t: et, weaponId } = p.explosion;
        const pal = PALETTES[weaponId] || PALETTES.bazooka;
        const ex = sx(x);
        const ey = sx(y);
        const R = sx(radius);
        const eo = 1 - (1 - et) ** 3;
        const rr = Math.max(1, R * (0.35 + 1.25 * eo));

        // Hot glow left on the ground while the crater cools.
        const heat = ctx.createRadialGradient(ex, ey, 0, ex, ey, R * 1.5);
        heat.addColorStop(0, "rgba(" + pal.mid + "," + 0.5 * (1 - et) + ")");
        heat.addColorStop(1, "rgba(" + pal.mid + ",0)");
        ctx.fillStyle = heat;
        ctx.beginPath();
        ctx.arc(ex, ey, R * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Fireball.
        const fa = (1 - et) ** 1.4;
        const grad = ctx.createRadialGradient(ex, ey, 0, ex, ey, rr);
        grad.addColorStop(0, "rgba(" + pal.core + "," + 0.98 * fa + ")");
        grad.addColorStop(0.5, "rgba(" + pal.mid + "," + 0.8 * fa + ")");
        grad.addColorStop(1, "rgba(" + pal.edge + ",0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(ex, ey, rr, 0, Math.PI * 2);
        ctx.fill();

        // White-hot flash in the opening frames.
        const flashA = Math.max(0, 1 - et * 4);
        if (flashA > 0) {
          ctx.fillStyle = "rgba(255,255,255," + 0.9 * flashA + ")";
          ctx.beginPath();
          ctx.arc(ex, ey, R * (0.45 + et * 2.2), 0, Math.PI * 2);
          ctx.fill();
        }

        // Billowing smoke (mist, for the fish).
        for (let k = 0; k < 6; k++) {
          const s = hash01(k * 7 + x);
          const pr = R * (0.3 + eo * 0.55) * (0.7 + s * 0.6);
          const pxk = ex + (s - 0.5) * R * 1.5 * eo;
          const pyk = ey - eo * R * (0.5 + s * 0.9);
          const a = Math.sin(Math.min(1, et * 1.1) * Math.PI) * 0.3;
          const sm = ctx.createRadialGradient(pxk, pyk, 0, pxk, pyk, pr);
          sm.addColorStop(0, "rgba(" + pal.smoke + "," + a + ")");
          sm.addColorStop(1, "rgba(" + pal.smoke + ",0)");
          ctx.fillStyle = sm;
          ctx.beginPath();
          ctx.arc(pxk, pyk, pr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shockwave rings.
        for (let k = 0; k < 2; k++) {
          const rt = Math.min(1, et * (1 + k * 0.5));
          ctx.strokeStyle = "rgba(255,255,255," + 0.55 * (1 - rt) + ")";
          ctx.lineWidth = Math.max(1, sx(2.4 * (1 - rt)));
          ctx.beginPath();
          ctx.arc(ex, ey, R * (0.4 + rt * 2.1), 0, Math.PI * 2);
          ctx.stroke();
        }

        // Embers and chunks, seeded off the impact point so they stay put
        // frame to frame. Embers glow and cool; chunks tumble and fall.
        for (const d of debrisFor(x, y)) {
          const dist = R * d.v * eo * (d.k ? 1.5 : 2.6);
          const dx = ex + Math.cos(d.a) * dist;
          const dy =
            ey + Math.sin(d.a) * dist - (d.k ? R * 0.7 * eo * (1 - et) : 0) + sx(d.k ? 50 : 30) * et * et;
          if (!d.k) {
            const size = Math.max(0.8, sx(d.s * 0.6) * (1 - et * 0.6));
            ctx.fillStyle = "hsla(" + (pal.hue + d.h * pal.span) + ",100%," + (62 - et * 26) + "%," + (1 - et) + ")";
            ctx.beginPath();
            ctx.arc(dx, dy, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.save();
            ctx.translate(dx, dy);
            ctx.rotate(d.spin * et);
            ctx.fillStyle = "rgba(" + pal.chunk + "," + 0.9 * (1 - et) + ")";
            if (pal.round) {
              ctx.beginPath();
              ctx.arc(0, 0, sx(d.s * 0.7), 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-sx(d.s) / 2, -sx(d.s) / 2, sx(d.s), sx(d.s));
            }
            ctx.restore();
          }
        }

        // Comic "POW!" for the melee hit.
        if (weaponId === "whack" && et < 0.75) {
          const pa = 1 - et / 0.75;
          const pr = R * (0.55 + Math.min(1, et * 5) * 0.55);
          ctx.save();
          ctx.translate(ex, ey - sx(8));
          ctx.rotate(-0.14);
          ctx.beginPath();
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2;
            const rad = k % 2 ? pr * 0.62 : pr;
            ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
          }
          ctx.closePath();
          ctx.globalAlpha = pa;
          ctx.fillStyle = "#ffd23f";
          ctx.fill();
          ctx.lineWidth = Math.max(1.5, sx(1.4));
          ctx.strokeStyle = "#ff5a3c";
          ctx.stroke();
          ctx.fillStyle = "#2a1408";
          ctx.font = "900 " + Math.max(11, sx(13)) + "px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("POW!", 0, 0);
          ctx.restore();
        }
      }

      // ---------- defeated: a puff, sparkles and a rising ghost ----------
      fx.ghosts = fx.ghosts.filter((g) => now - g.born < GHOST_MS);
      for (const g of fx.ghosts) {
        const age = (now - g.born) / GHOST_MS;
        const gx = sx(g.x);
        const gy = sx(g.y) - sx(10);
        ctx.fillStyle = "rgba(235,235,245," + 0.5 * (1 - age) + ")";
        ctx.beginPath();
        ctx.arc(gx, gy, sx(6 + age * 16), 0, Math.PI * 2);
        ctx.fill();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + hash01(k) * 0.6;
          const d = sx(6 + age * 26) * (0.7 + hash01(k + 9) * 0.6);
          ctx.fillStyle = rgba(g.colour, 1 - age);
          ctx.beginPath();
          ctx.arc(gx + Math.cos(a) * d, gy + Math.sin(a) * d, Math.max(1, sx(1.6 * (1 - age))), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = Math.max(0, 0.9 - age);
        ctx.font = Math.max(16, sx(19)) + 'px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F47B}", gx + Math.sin(age * 9) * sx(2), gy - age * sx(34));
        ctx.globalAlpha = 1;
      }

      // ---------- damage numbers ----------
      for (const f of p.floats) {
        const age = (now - f.born) / FLOAT_MS;
        if (age < 0 || age > 1) continue;
        const a = 1 - age ** 2;
        // Pops in oversize, settles, then drifts up and away.
        const pop = age < 0.14 ? 0.5 + (age / 0.14) * 1.1 : 1.6 - Math.min(0.6, (age - 0.14) * 2.2);
        const heavy = f.amount >= 35;
        const fy = sx(f.y) - sx(14) - age * sx(20);
        ctx.font = "800 " + Math.max(11, sx(12 + f.amount / 9) * pop) + "px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(2.5, sx(2.4));
        ctx.strokeStyle = "rgba(8,10,16," + 0.75 * a + ")";
        ctx.strokeText("-" + f.amount, sx(f.x), fy);
        ctx.fillStyle = heavy ? "rgba(255,196,64," + a + ")" : "rgba(255,120,110," + a + ")";
        ctx.fillText("-" + f.amount, sx(f.x), fy);
      }

      ctx.restore();

      // Full-frame flash at the instant of detonation.
      if (p.explosion && !p.reduced) {
        const fa = Math.max(0, 1 - p.explosion.t * 5) * 0.3;
        if (fa > 0.01) {
          ctx.fillStyle = "rgba(255,246,222," + fa + ")";
          ctx.fillRect(0, 0, cw, ch);
        }
      }

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

// Stable per-impact particles, so they don't reshuffle every frame: glowing
// embers (k = 0) and tumbling chunks (k = 1).
const debrisCache = new Map();
function debrisFor(x, y) {
  const key = Math.round(x) + ":" + Math.round(y);
  const hit = debrisCache.get(key);
  if (hit) return hit;
  const rng = makeRng(hashString(key));
  const made = Array.from({ length: 40 }, (_, i) => ({
    k: i < 26 ? 0 : 1,
    a: rng() * Math.PI * 2,
    v: 0.4 + rng() * 0.9,
    s: 1 + rng() * 2.4,
    h: rng(),
    spin: (rng() - 0.5) * 14
  }));
  if (debrisCache.size > 64) debrisCache.clear();
  debrisCache.set(key, made);
  return made;
}

// Cheap stable pseudo-random in [0, 1) from a number.
function hash01(n) {
  const v = Math.sin(n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
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
