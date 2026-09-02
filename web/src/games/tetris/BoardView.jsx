import { useCallback, useEffect, useRef } from "react";
import { COLS, ROWS, HIDDEN, parseSnapshot } from "./engine";
import { COLOURS, SHADES, cellsOf } from "./pieces";
import styles from "./tetris.module.css";

// Draws one board from a snapshot string. The same component serves the
// player's phone and each pane of the TV grid — the phone just passes its
// own live snapshot, so there's a single renderer to keep consistent.
//
// Blocks are bevelled rather than flat: on a TV showing four boards at once
// the stack has to read as tiles at a glance, and a flat fill of the same
// hue as its neighbour doesn't. `piece` (the tetromino in flight, from the
// snapshot) is drawn with a glow so the eye can find the live board among
// the settled ones.

const DANGER_ROWS = 5;

export function BoardView({ cells, piece, label, dimmed = false, className = "" }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = wrap.clientWidth;
    if (!cw) return;
    const cell = cw / COLS;
    const ch = cell * ROWS;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.height = ch + "px";
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    // Solid dark well in both themes, not a translucent black: the piece
    // colours are bright and need a dark backdrop to read, and over a light
    // page a translucent fill washes out to grey.
    const well = ctx.createLinearGradient(0, 0, 0, ch);
    well.addColorStop(0, "#0d121d");
    well.addColorStop(1, "#171e2d");
    ctx.fillStyle = well;
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, ch);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(cw, y * cell);
      ctx.stroke();
    }

    const grid = cells ? parseSnapshot(cells) : null;

    // Cells belonging to the tetromino in flight. The snapshot writes it into
    // the same grid as the settled stack, so anything that cares about stack
    // height has to subtract it first.
    const live = new Set();
    if (piece) {
      for (const [px, py] of cellsOf(piece.t, piece.r)) {
        live.add(piece.x + px + ":" + (piece.y + py - HIDDEN));
      }
    }

    // Danger zone: the closer the stack gets to the ceiling, the harder the
    // top of the well glows. Cheap early warning from across the room.
    if (grid) {
      let top = ROWS;
      for (let y = 0; y < grid.length && y < ROWS; y++) {
        if (grid[y].some((c, x) => c !== "." && c !== "g" && !live.has(x + ":" + y))) {
          top = y;
          break;
        }
      }
      const risk = Math.max(0, Math.min(1, (DANGER_ROWS + 2 - top) / (DANGER_ROWS + 2)));
      if (risk > 0) {
        const danger = ctx.createLinearGradient(0, 0, 0, cell * DANGER_ROWS);
        danger.addColorStop(0, "rgba(232,67,79," + 0.3 * risk + ")");
        danger.addColorStop(1, "rgba(232,67,79,0)");
        ctx.fillStyle = danger;
        ctx.fillRect(0, 0, cw, cell * DANGER_ROWS);
      }
    }

    if (grid) {
      for (let y = 0; y < Math.min(ROWS, grid.length); y++) {
        for (let x = 0; x < Math.min(COLS, grid[y].length); x++) {
          const c = grid[y][x];
          if (c === ".") continue;
          const px = x * cell;
          const py = y * cell;

          if (c === "g") {
            // Ghost: a wash in the piece's own colour, so it guides without
            // reading as another block in the stack.
            const tint = COLOURS[piece?.t] || "#8fa0c0";
            ctx.fillStyle = withAlpha(tint, 0.18);
            roundRect(ctx, px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8, cell * 0.16);
            ctx.fill();
            ctx.strokeStyle = withAlpha(tint, 0.5);
            ctx.lineWidth = Math.max(1, cell * 0.06);
            ctx.stroke();
            continue;
          }

          drawBlock(ctx, px, py, cell, c, live.has(x + ":" + y));
        }
      }
    }

    // Inner vignette, so the well has depth rather than being a flat hole.
    const vig = ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.2, cw / 2, ch / 2, ch * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, cw, ch);

    if (dimmed) {
      ctx.fillStyle = "rgba(6,9,16,0.62)";
      ctx.fillRect(0, 0, cw, ch);
    }
  }, [cells, piece, dimmed]);

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
    <div ref={wrapRef} className={`${styles.board} ${className}`.trim()}>
      <canvas ref={canvasRef} className={styles.boardCanvas} role="img" aria-label={label || "Tetris board"} />
    </div>
  );
}

function drawBlock(ctx, px, py, cell, type, live) {
  const inset = Math.max(0.5, cell * 0.04);
  const x = px + inset;
  const y = py + inset;
  const w = cell - inset * 2;
  const r = Math.max(1, cell * 0.18);
  const top = COLOURS[type] || "#8a8a96";
  const bottom = SHADES[type] || "#4a4a55";

  ctx.save();
  if (live) {
    ctx.shadowColor = withAlpha(top, 0.8);
    ctx.shadowBlur = cell * 0.5;
  }
  const grad = ctx.createLinearGradient(x, y, x + w, y + w);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, w, r);
  ctx.fill();
  ctx.restore();

  // Garbage is deliberately drab and hatched, so junk reads as junk.
  if (type === "G") {
    ctx.save();
    roundRect(ctx, x, y, w, w, r);
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = Math.max(1, cell * 0.06);
    for (let d = -w; d < w * 2; d += Math.max(3, cell * 0.3)) {
      ctx.beginPath();
      ctx.moveTo(x + d, y);
      ctx.lineTo(x + d - w, y + w);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // A lit top edge and a dark lower-right lip: the whole bevel, in two fills.
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  roundRect(ctx, x + w * 0.14, y + w * 0.1, w * 0.72, Math.max(1, w * 0.16), Math.max(1, w * 0.07));
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = Math.max(1, cell * 0.05);
  roundRect(ctx, x, y, w, w, r);
  ctx.stroke();
}

// A single tetromino at a glance — the hold slot and the next queue, where a
// bare letter told you nothing you could act on quickly.
export function PiecePreview({ type, size = 30, faded = false }) {
  if (!type) {
    return (
      <span className={styles.previewEmpty} style={{ width: size, height: size * 0.62 }} aria-hidden="true" />
    );
  }
  const cells = cellsOf(type, 0);
  const xs = cells.map(([x]) => x);
  const ys = cells.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX + 1;
  const h = Math.max(...ys) - minY + 1;
  const u = 10;
  return (
    <svg
      width={size}
      height={(size * h) / w}
      viewBox={`0 0 ${w * u} ${h * u}`}
      className={faded ? styles.previewFaded : undefined}
      role="img"
      aria-label={type + " piece"}
    >
      {cells.map(([x, y], i) => (
        <rect
          key={i}
          x={(x - minX) * u + 0.6}
          y={(y - minY) * u + 0.6}
          width={u - 1.2}
          height={u - 1.2}
          rx={u * 0.2}
          fill={COLOURS[type]}
          stroke={SHADES[type]}
          strokeWidth="0.9"
        />
      ))}
    </svg>
  );
}

function withAlpha(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
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
