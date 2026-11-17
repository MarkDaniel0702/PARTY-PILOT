import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
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

const lerp = (a, b, t) => a + (b - a) * t;

// Where each cell of a snake is drawn, `t` (0..1) of the way through the tick
// that produced `cur`. Cell i of the new body was cell i-1 of the old one, so
// sliding every cell from its old spot to its new one is what makes the snake
// glide instead of hopping a whole cell every ~130ms. A jump of more than one
// cell is a wrapped edge: snap, don't streak across the board.
function glidePoints(cur, prev, t, cell) {
  return cur.body.map((c, i) => {
    const p = prev && prev.body[i];
    if (!p || Math.abs(p.x - c.x) > 1 || Math.abs(p.y - c.y) > 1) {
      return [c.x * cell + cell / 2, c.y * cell + cell / 2];
    }
    return [lerp(p.x, c.x, t) * cell + cell / 2, lerp(p.y, c.y, t) * cell + cell / 2];
  });
}

export function ArenaCanvas({ game, colours, names, showNames = true, label = "Snake arena", tickMs = 135 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const gameRef = useRef(game);
  gameRef.current = game;
  const tickMsRef = useRef(tickMs);
  tickMsRef.current = tickMs;
  // Previous state and when the current one arrived, for gliding between them.
  const motionRef = useRef({ cur: game, prev: null, at: 0 });
  const bgRef = useRef(null); // cached field + dots, rebuilt only on resize
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

    // The field and its dots never change, so paint them once per size.
    const bgKey = canvas.width + "x" + canvas.height + ":" + g.cols + "x" + g.rows;
    if (!bgRef.current || bgRef.current.key !== bgKey) {
      const bg = document.createElement("canvas");
      bg.width = canvas.width;
      bg.height = canvas.height;
      const b = bg.getContext("2d");
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.fillStyle = FIELD;
      b.fillRect(0, 0, cssW, cssH);
      // Faint dots mark the grid without drawing a busy lattice.
      b.fillStyle = DOT;
      for (let y = 0; y < g.rows; y++) {
        for (let x = 0; x < g.cols; x++) {
          b.fillRect(x * cell + cell / 2 - 1, y * cell + cell / 2 - 1, 2, 2);
        }
      }
      bgRef.current = { key: bgKey, canvas: bg };
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bgRef.current.canvas, 0, 0);
    ctx.restore();

    const m = motionRef.current;
    const t = m.prev && m.cur === g ? Math.min(1, (performance.now() - m.at) / tickMsRef.current) : 1;

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
      // A translucent halo instead of shadowBlur: blur is by far the most
      // expensive thing a canvas can be asked to do every frame.
      ctx.fillStyle = golden ? GOLD : FOOD;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * (golden ? 0.78 : 0.55), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * (golden ? 0.4 : 0.3), 0, Math.PI * 2);
      ctx.fill();
    });

    // Snakes.
    g.snakes.forEach((s) => {
      if (!s.alive) return;
      const colour = palette[s.id] || "#3dff9a";
      const before = m.prev && m.cur === g ? m.prev.snakes.find((x) => x.id === s.id) : null;
      const pts = glidePoints(s, before && before.alive ? before : null, t, cell);
      const path = () => {
        ctx.beginPath();
        s.body.forEach((c, i) => {
          const [px, py] = pts[i];
          const prev = s.body[i - 1];
          const jump = prev && (Math.abs(prev.x - c.x) > 1 || Math.abs(prev.y - c.y) > 1);
          if (i === 0 || jump) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
      };

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Soft glow: a wide, faint pass under the solid one.
      ctx.strokeStyle = colour;
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = cell * 1.05;
      path();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = cell * 0.72;
      path();
      ctx.stroke();

      // A lighter spine down the middle gives the body some roundness.
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = cell * 0.2;
      path();
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

  // A new game state becomes the target of the next glide. Layout effect, so
  // the glide's anchor is moved before the browser can run another animation
  // frame against the new state (a passive effect can land a frame late and
  // draw the snake one cell back).
  useLayoutEffect(() => {
    const m = motionRef.current;
    if (m.cur !== game) {
      m.prev = game && m.cur && game.tick === m.cur.tick + 1 ? m.cur : null;
      m.cur = game;
      m.at = performance.now();
    }
    draw();
  }, [game, colours, names, showNames, draw]);

  // Glide between ticks at display rate, but only while a match is live and
  // the tab is visible — an idle or finished arena costs nothing.
  const live = !!game && !game.over;
  useEffect(() => {
    if (!live) return undefined;
    let raf = 0;
    const frame = () => {
      if (!document.hidden) draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [live, draw]);

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
