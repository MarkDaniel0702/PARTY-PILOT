import { useCallback, useEffect, useRef } from "react";
import { COLS, ROWS, parseSnapshot } from "./engine";
import { COLOURS } from "./pieces";
import styles from "./tetris.module.css";

// Draws one board from a snapshot string. The same component serves the
// player's phone and each pane of the TV grid — the phone just passes its
// own live snapshot, so there's a single renderer to keep consistent.
export function BoardView({ cells, label, dimmed = false, className = "" }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = wrap.clientWidth;
    const cell = cw / COLS;
    const ch = cell * ROWS;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      canvas.style.height = `${ch}px`;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    // Solid dark well in both themes, not a translucent black: the piece
    // colours are bright and need a dark backdrop to read, and over a light
    // page a translucent fill washes out to grey.
    ctx.fillStyle = "#141a26";
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
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

    if (!cells) return;
    const grid = parseSnapshot(cells);
    for (let y = 0; y < Math.min(ROWS, grid.length); y++) {
      for (let x = 0; x < Math.min(COLS, grid[y].length); x++) {
        const c = grid[y][x];
        if (c === ".") continue;
        const px = x * cell;
        const py = y * cell;
        if (c === "g") {
          // Ghost: outline only, so it guides without hiding the stack.
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = Math.max(1, cell * 0.08);
          ctx.strokeRect(px + cell * 0.12, py + cell * 0.12, cell * 0.76, cell * 0.76);
          continue;
        }
        ctx.fillStyle = COLOURS[c] || "#888";
        ctx.fillRect(px + 0.5, py + 0.5, cell - 1, cell - 1);
        // A lighter top edge gives the blocks a bit of depth.
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        ctx.fillRect(px + 0.5, py + 0.5, cell - 1, Math.max(1, cell * 0.18));
      }
    }

    if (dimmed) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, cw, ch);
    }
  }, [cells, dimmed]);

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
