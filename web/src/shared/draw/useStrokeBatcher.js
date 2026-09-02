import { useCallback, useEffect, useRef } from "react";
import { appendPoint, createStroke } from "./strokes";

const FLUSH_MS = 50;

// Collects pointer samples into a stroke and ships the new points on a timer
// instead of once per event. A phone fires pointermove at 120Hz+; batching to
// ~20 messages a second keeps the data channel quiet with no visible change
// to the line.
//
// `onLocal` receives the in-progress stroke so the drawer's own screen stays
// perfectly responsive — their line never waits on the network.
export function useStrokeBatcher({ onStart, onPoints, onEnd, onLocal }) {
  const strokeRef = useRef(null);
  const pendingRef = useRef([]);
  const timerRef = useRef(null);
  const seqRef = useRef(0);

  const flush = useCallback(() => {
    const stroke = strokeRef.current;
    const pending = pendingRef.current;
    if (!stroke || pending.length === 0) return;
    pendingRef.current = [];
    onPoints?.(stroke.id, pending);
  }, [onPoints]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(
    (nx, ny, colour, width) => {
      const id = `s${seqRef.current++}`;
      const stroke = createStroke(id, colour, width, nx, ny);
      strokeRef.current = stroke;
      pendingRef.current = [];
      onLocal?.(stroke);
      onStart?.(id, colour, width, stroke.pts[0], stroke.pts[1]);
      stopTimer();
      timerRef.current = setInterval(flush, FLUSH_MS);
    },
    [onStart, onLocal, flush, stopTimer]
  );

  const point = useCallback(
    (nx, ny) => {
      const stroke = strokeRef.current;
      if (!stroke) return;
      const next = appendPoint(stroke, nx, ny);
      // Same reference back means the point was too close to matter.
      if (next === stroke) return;
      strokeRef.current = next;
      const n = next.pts.length;
      pendingRef.current.push(next.pts[n - 2], next.pts[n - 1]);
      onLocal?.(next);
    },
    [onLocal]
  );

  const end = useCallback(() => {
    const stroke = strokeRef.current;
    if (!stroke) return;
    flush();
    stopTimer();
    strokeRef.current = null;
    onLocal?.(null);
    onEnd?.(stroke.id, stroke);
  }, [flush, stopTimer, onEnd, onLocal]);

  useEffect(() => stopTimer, [stopTimer]);

  return { start, point, end };
}
