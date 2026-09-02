import { useCallback, useEffect, useRef } from "react";
import { TEAMS, MAX_HP } from "./engine";
import { launchVelocity } from "./physics";
import styles from "./dogsvscats.module.css";

// Canvas renderer. Everything on screen is generated — terrain from the mask,
// characters from emoji — so the game ships no image files at all.
//
// The terrain mask is repainted into an offscreen ImageData only when
// `terrainVersion` changes (i.e. after an explosion), not every frame; the
// per-frame work is just one drawImage plus the sprites on top.
export function Battlefield({
  terrain,
  terrainVersion,
  battlefield,
  characters,
  activeId,
  aim,
  shot,
  shotProgress,
  explosion
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const groundRef = useRef(null);
  const paintedVersion = useRef(-1);

  // Rebuild the terrain bitmap only when it has actually been dug into.
  const rebuildGround = useCallback(() => {
    if (!terrain) return;
    let off = groundRef.current;
    if (!off || off.width !== terrain.width || off.height !== terrain.height) {
      off = document.createElement("canvas");
      off.width = terrain.width;
      off.height = terrain.height;
      groundRef.current = off;
    }
    const ctx = off.getContext("2d");
    const img = ctx.createImageData(terrain.width, terrain.height);
    const data = img.data;

    const g = hexToRgb(battlefield.ground);
    const r = hexToRgb(battlefield.rock);

    for (let y = 0; y < terrain.height; y++) {
      for (let x = 0; x < terrain.width; x++) {
        const i = y * terrain.width + x;
        if (!terrain.mask[i]) continue;
        // A band of "topsoil" wherever there's sky directly above, so the
        // surface reads as ground rather than a flat silhouette.
        const above = y > 0 ? terrain.mask[i - terrain.width] : 0;
        let depth = 0;
        if (!above) depth = 1;
        else if (y > 3 && !terrain.mask[i - terrain.width * 4]) depth = 2;
        const c = depth === 1 ? g : depth === 2 ? mix(g, r, 0.5) : r;
        const o = i * 4;
        data[o] = c[0];
        data[o + 1] = c[1];
        data[o + 2] = c[2];
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    paintedVersion.current = terrainVersion;
  }, [terrain, terrainVersion, battlefield]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !terrain) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = wrap.clientWidth;
    const ch = (cw * terrain.height) / terrain.width;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.height = `${ch}px`;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const scale = cw / terrain.width;
    const sx = (v) => v * scale;

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, ch);
    sky.addColorStop(0, battlefield.sky[0]);
    sky.addColorStop(1, battlefield.sky[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch);

    if (paintedVersion.current !== terrainVersion) rebuildGround();
    if (groundRef.current) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(groundRef.current, 0, 0, cw, ch);
      ctx.imageSmoothingEnabled = true;
    }

    // Aim preview: a dotted arc showing roughly where the shot will go.
    const actor = characters.find((c) => c.id === activeId);
    if (aim && actor && actor.alive && !shot) {
      const v = launchVelocity(aim.angle, aim.power);
      ctx.save();
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      let px = actor.x;
      let py = actor.y - 8;
      let vx = v.vx;
      let vy = v.vy;
      ctx.moveTo(sx(px), sx(py));
      for (let i = 0; i < 26; i++) {
        vy += 0.32 * 2;
        px += vx * 2;
        py += vy * 2;
        ctx.lineTo(sx(px), sx(py));
      }
      ctx.stroke();
      ctx.restore();
    }

    // Projectile trail
    if (shot && shot.path.length > 1) {
      const upto = Math.max(1, Math.floor(shot.path.length * shotProgress));
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < upto; i++) {
        const [x, y] = shot.path[i];
        if (i === 0) ctx.moveTo(sx(x), sx(y));
        else ctx.lineTo(sx(x), sx(y));
      }
      ctx.stroke();

      const [hx, hy] = shot.path[upto - 1];
      ctx.font = `${Math.max(12, sx(16))}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(shot.weapon.emoji, sx(hx), sx(hy));
    }

    // Characters
    for (const c of characters) {
      if (!c.alive) continue;
      const team = TEAMS.find((t) => t.id === c.teamId);
      const size = Math.max(16, sx(20));
      ctx.font = `${size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";

      if (c.id === activeId) {
        ctx.beginPath();
        ctx.arc(sx(c.x), sx(c.y - 8), size * 0.75, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fill();
      }

      ctx.fillText(team.emoji, sx(c.x), sx(c.y + 2));

      // Health bar
      const bw = Math.max(20, sx(24));
      const bh = Math.max(3, sx(4));
      const bx = sx(c.x) - bw / 2;
      const by = sx(c.y) - size - bh * 2;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = c.hp > 50 ? "#39d98a" : c.hp > 25 ? "#e8a91d" : "#ff6b6b";
      ctx.fillRect(bx, by, (bw * c.hp) / MAX_HP, bh);
    }

    // Explosion flash
    if (explosion) {
      const { x, y, radius, t } = explosion;
      const rr = sx(radius) * (0.5 + t * 1.1);
      const grad = ctx.createRadialGradient(sx(x), sx(y), 0, sx(x), sx(y), Math.max(1, rr));
      grad.addColorStop(0, `rgba(255,240,180,${0.95 * (1 - t)})`);
      grad.addColorStop(0.6, `rgba(255,150,60,${0.7 * (1 - t)})`);
      grad.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx(x), sx(y), Math.max(1, rr), 0, Math.PI * 2);
      ctx.fill();
    }
  }, [terrain, terrainVersion, battlefield, characters, activeId, aim, shot, shotProgress, explosion, rebuildGround]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={wrapRef} className={styles.field}>
      <canvas ref={canvasRef} className={styles.fieldCanvas} role="img" aria-label="Battlefield" />
    </div>
  );
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
