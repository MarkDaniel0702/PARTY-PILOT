import { useEffect, useRef } from "react";
import { buildBattlefield } from "./terrain";
import styles from "./dogsvscats.module.css";

// A postcard of a battlefield for the setup picker, painted by the *actual*
// generator rather than a hand-drawn icon — so what you pick is what you get.
//
// Generated at full resolution once per field (the generators use absolute
// pixel constants, so shrinking the terrain would change its shape) and then
// point-sampled down to thumbnail size, which costs a few thousand reads
// instead of a full-size rasterise. Cached module-wide: the six thumbnails
// are built once for the life of the page, not on every re-render.

const THUMB_W = 160;
const THUMB_H = 90;
const PREVIEW_SEED = 20240607;

const cache = new Map();

function thumbFor(id) {
  const hit = cache.get(id);
  if (hit) return hit;

  const { terrain, def } = buildBattlefield(id, PREVIEW_SEED);
  const off = document.createElement("canvas");
  off.width = THUMB_W;
  off.height = THUMB_H;
  const ctx = off.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, THUMB_H);
  sky.addColorStop(0, def.sky[0]);
  sky.addColorStop(1, def.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  const img = ctx.getImageData(0, 0, THUMB_W, THUMB_H);
  const data = img.data;
  const g = hexToRgb(def.ground);
  const r = hexToRgb(def.rock);
  const stepX = terrain.width / THUMB_W;
  const stepY = terrain.height / THUMB_H;

  for (let ty = 0; ty < THUMB_H; ty++) {
    const sy = Math.floor(ty * stepY);
    for (let tx = 0; tx < THUMB_W; tx++) {
      const sxp = Math.floor(tx * stepX);
      if (!terrain.mask[sy * terrain.width + sxp]) continue;
      const aboveY = sy - Math.ceil(stepY);
      const above = aboveY >= 0 ? terrain.mask[aboveY * terrain.width + sxp] : 0;
      const c = above ? r : g;
      const o = (ty * THUMB_W + tx) * 4;
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const url = off.toDataURL("image/png");
  cache.set(id, url);
  return url;
}

export function FieldThumb({ id, emoji }) {
  const imgRef = useRef(null);

  // Painted in an effect rather than during render: it touches a canvas, and
  // the six fields together are a few milliseconds of work best kept off the
  // first paint.
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    try {
      el.style.backgroundImage = "url(" + thumbFor(id) + ")";
    } catch {
      // A canvas that refuses to rasterise is not worth failing setup over.
    }
  }, [id]);

  return (
    <span ref={imgRef} className={styles.thumb}>
      <span className={styles.thumbBadge} aria-hidden="true">
        {emoji}
      </span>
    </span>
  );
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
