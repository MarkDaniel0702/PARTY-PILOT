import { useCallback, useEffect, useRef } from "react";
import { DIRS } from "./engine";
import styles from "./snake.module.css";

// The arena, painted on a canvas. The field is always dark — neon snakes need
// it — so, like the Tetris wells, it doesn't follow the page theme.
const FIELD = "#0a1020";
const DOT = "rgba(255, 255, 255, 0.045)";
const WALL = "#3a1020";
const WALL_EDGE = "#ff4d6d";
const FOOD = "#ff5d73";
const GOLD = "#ffd23f";

function roundedHead(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ArenaCanvas({ game, colours, names, showNames = true, label = "Snake arena" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(game);
  gameRef.current = game;
  const styleRef = useRef({ colours, names, showNames });
  styleRef.current = { colours, names, showNames };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const g = gameRef.current;
    if (!canvas || !wrap || !g) return;

    const cssW = Math.max(160, Math.floor(wrap.clientWidth));
    const cell = cssW / g.cols;
    const cssH = Math.round(cell * g.rows);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // Resizing a canvas clears it and is slow; only do it when the size moved.
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const { colours: palette, names: nameOf, showNames: tags } = styleRef.current;

    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, cssW, cssH);

    // Faint dots mark the grid without drawing a busy lattice.
    ctx.fillStyle = DOT;
    for (let y = 0; y < g.rows; y++) {
      for (let x = 0; x < g.cols; x++) {
        ctx.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
      }
    }

    // The closing-in danger zone.
    if (g.inset > 0) {
      const i = g.inset * cell;
      ctx.fillStyle = WALL;
      ctx.fillRect(0, 0, cssW, i);
      ctx.fillRect(0, cssH - i, cssW, i);
      ctx.fillRect(0, i, i, cssH - 2 * i);
      ctx.fillRect(cssW - i, i, i, cssH - 2 * i);
      ctx.strokeStyle = WALL_EDGE;
      ctx.lineWidth = 2;
      ctx.strokeRect(i, i, cssW - 2 * i, cssH - 2 * i);
    }

    // Food. Golden food is bigger and has a glow, so it reads from a sofa.
    g.food.forEach((f) => {
      const cx = f.x * cell + cell / 2;
      const cy = f.y * cell + cell / 2;
      const golden = f.value > 1;
      ctx.save();
      ctx.shadowColor = golden ? GOLD : FOOD;
      ctx.shadowBlur = golden ? cell * 0.9 : cell * 0.4;
      ctx.fillStyle = golden ? GOLD : FOOD;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * (golden ? 0.4 : 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Snakes.
    g.snakes.forEach((s) => {
      if (!s.alive) return;
      const colour = palette[s.id] || "#3dff9a";
      const pts = s.body.map((c) => [c.x * cell + cell / 2, c.y * cell + cell / 2]);

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = colour;
      ctx.lineWidth = cell * 0.72;
      ctx.shadowColor = colour;
      ctx.shadowBlur = cell * 0.5;
      // One stroke per run of neighbouring cells, so a snake crossing a wrapped
      // edge isn't drawn with a line straight across the arena.
      ctx.beginPath();
      s.body.forEach((c, i) => {
        const [px, py] = pts[i];
        const prev = s.body[i - 1];
        const jump = prev && (Math.abs(prev.x - c.x) > 1 || Math.abs(prev.y - c.y) > 1);
        if (i === 0 || jump) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();

      // A lighter spine down the middle gives the body some roundness.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = cell * 0.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      s.body.forEach((c, i) => {
        const [px, py] = pts[i];
        const prev = s.body[i - 1];
        const jump = prev && (Math.abs(prev.x - c.x) > 1 || Math.abs(prev.y - c.y) > 1);
        if (i === 0 || jump) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Head and eyes, turned to face the way it is going.
      const [hx, hy] = pts[0];
      const d = DIRS[s.dir];
      ctx.fillStyle = colour;
      roundedHead(ctx, hx, hy, cell * 0.46);
      const sx = -d.y;
      const sy = d.x;
      ctx.fillStyle = "#fff";
      [-1, 1].forEach((side) => {
        roundedHead(ctx, hx + d.x * cell * 0.14 + sx * side * cell * 0.2, hy + d.y * cell * 0.14 + sy * side * cell * 0.2, cell * 0.15);
      });
      ctx.fillStyle = "#0a1020";
      [-1, 1].forEach((side) => {
        roundedHead(ctx, hx + d.x * cell * 0.2 + sx * side * cell * 0.2, hy + d.y * cell * 0.2 + sy * side * cell * 0.2, cell * 0.07);
      });

      if (tags && nameOf && nameOf[s.id] && cell >= 12) {
        const size = Math.max(10, Math.round(cell * 0.55));
        ctx.font = `800 ${size}px Manrope, system-ui, sans-serif`;
        ctx.textAlign = "center";
        // The tag goes on the side the snake is heading, away from its own
        // body, and flips to the other side rather than running off the edge.
        let below = s.dir === "down";
        if (below && hy + cell * 0.62 + size > cssH) below = false;
        if (!below && hy - cell * 0.62 - size < 0) below = true;
        ctx.textBaseline = below ? "top" : "bottom";
        const ty = below ? hy + cell * 0.62 : hy - cell * 0.62;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(6, 9, 18, 0.9)";
        ctx.strokeText(nameOf[s.id], hx, ty);
        ctx.fillStyle = colour;
        ctx.fillText(nameOf[s.id], hx, ty);
      }
    });
  }, []);

  // Redraw on every new game state, and whenever the container changes size.
  useEffect(() => {
    draw();
  }, [game, colours, names, showNames, draw]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className={styles.canvasWrap} ref={wrapRef}>
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={label} />
    </div>
  );
}
