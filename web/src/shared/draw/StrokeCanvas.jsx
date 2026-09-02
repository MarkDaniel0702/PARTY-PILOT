import { useCallback, useEffect, useRef } from "react";
import { NORM, ASPECT, fitBox, fromNorm, scaleWidth, toNorm } from "./strokes";
import styles from "./draw.module.css";

// Renders a stroke list, and optionally captures pointer input.
//
// The same component serves both surfaces: the drawer's phone pad (interactive)
// and the shared screen (display only). Both letterbox to the same ASPECT, so
// a drawing made on a tall phone lands correctly on a wide TV.
//
// Redraw strategy: the whole list is repainted whenever `strokes` changes
// identity. Stroke lists here are short (one round of one drawing) and the
// paint is cheap, which buys correctness on undo/clear/resize for free.
export function StrokeCanvas({
  strokes = [],
  liveStroke = null,
  interactive = false,
  colour = "#1b1d2b",
  width = 10,
  onStrokeStart,
  onStrokePoint,
  onStrokeEnd,
  className = "",
  label = "Drawing"
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const boxRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const drawingRef = useRef(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    if (canvas.width !== Math.round(cw * dpr) || canvas.height !== Math.round(ch * dpr)) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const box = fitBox(cw, ch, ASPECT);
    boxRef.current = box;

    // The drawable area, so it reads as a sheet of paper rather than the page.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(box.x, box.y, box.width, box.height);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const all = liveStroke ? [...strokes, liveStroke] : strokes;
    for (const stroke of all) {
      if (!stroke || stroke.pts.length < 2) continue;
      ctx.strokeStyle = stroke.colour;
      ctx.lineWidth = scaleWidth(stroke.width, box.width);
      ctx.beginPath();
      for (let i = 0; i < stroke.pts.length; i += 2) {
        const [px, py] = fromNorm(stroke.pts[i], stroke.pts[i + 1], box.width, box.height);
        const x = box.x + px;
        const y = box.y + py;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // A single tap should leave a dot, not nothing.
      if (stroke.pts.length === 2) {
        const [px, py] = fromNorm(stroke.pts[0], stroke.pts[1], box.width, box.height);
        ctx.lineTo(box.x + px + 0.01, box.y + py + 0.01);
      }
      ctx.stroke();
    }
  }, [strokes, liveStroke]);

  useEffect(() => {
    paint();
  }, [paint]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => paint());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [paint]);

  // Pointer position -> normalised grid, or null when outside the paper.
  const pointToNorm = useCallback((e) => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box.width) return null;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left - box.x;
    const py = e.clientY - rect.top - box.y;
    if (px < 0 || py < 0 || px > box.width || py > box.height) return null;
    return toNorm(px, py, box.width, box.height);
  }, []);

  function handleDown(e) {
    if (!interactive) return;
    const pt = pointToNorm(e);
    if (!pt) return;
    drawingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onStrokeStart?.(pt[0], pt[1], colour, width);
  }

  function handleMove(e) {
    if (!interactive || !drawingRef.current) return;
    const pt = pointToNorm(e);
    if (!pt) return;
    onStrokePoint?.(pt[0], pt[1]);
  }

  function handleUp(e) {
    if (!interactive || !drawingRef.current) return;
    drawingRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    onStrokeEnd?.();
  }

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${interactive ? styles.interactive : ""} ${className}`.trim()}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      // Deliberately no onPointerLeave: setPointerCapture already guarantees
      // pointerup reaches us even if the finger leaves the pad, and capture
      // itself fires a leave on this element — which would end every stroke
      // the instant it began.
    >
      <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={label} />
    </div>
  );
}

export { NORM };
