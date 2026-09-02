// Pure stroke geometry for the drawing games. No React, no DOM, no canvas —
// so the coordinate maths is unit-testable on its own (see strokes.test.js).
//
// Coordinates travel over the wire as integers on a fixed 0..NORM grid rather
// than pixels: the drawer's phone and the shared screen are different sizes,
// and integers keep the messages small. Both surfaces are locked to the same
// aspect ratio (see ASPECT) so a drawing never skews between them.

export const NORM = 1000;
export const ASPECT = 4 / 3;

// Points closer than this (on the normalised grid) are dropped. A modern
// phone fires pointermove at 120Hz+; unfiltered that is a lot of redundant
// traffic for no visible difference.
export const MIN_STEP = 3;

export const PALETTE = ["#1b1d2b", "#e0293b", "#e8a91d", "#2fa84f", "#2f6fd0", "#ffffff"];
export const WIDTHS = [4, 10, 22];

export function clampNorm(n) {
  return Math.max(0, Math.min(NORM, Math.round(n)));
}

// Canvas pixel position -> normalised grid.
export function toNorm(px, py, width, height) {
  if (!width || !height) return [0, 0];
  return [clampNorm((px / width) * NORM), clampNorm((py / height) * NORM)];
}

// Normalised grid -> canvas pixel position.
export function fromNorm(nx, ny, width, height) {
  return [(nx / NORM) * width, (ny / NORM) * height];
}

// Stroke width scales with the surface so a "thick" line looks equally thick
// on a phone pad and on the shared screen.
export function scaleWidth(w, width) {
  return Math.max(1, (w / NORM) * width * 2);
}

export function createStroke(id, colour, width, nx, ny) {
  return { id, colour, width, pts: [clampNorm(nx), clampNorm(ny)] };
}

// True when the point is far enough from the stroke's last point to be worth
// recording. Keeps the wire quiet without visibly changing the line.
export function shouldAppend(stroke, nx, ny, minStep = MIN_STEP) {
  const n = stroke.pts.length;
  if (n < 2) return true;
  const dx = nx - stroke.pts[n - 2];
  const dy = ny - stroke.pts[n - 1];
  return dx * dx + dy * dy >= minStep * minStep;
}

// Returns a new stroke with the point appended, or the same stroke back when
// the point was too close to matter (so callers can detect a no-op with ===).
export function appendPoint(stroke, nx, ny, minStep = MIN_STEP) {
  const x = clampNorm(nx);
  const y = clampNorm(ny);
  if (!shouldAppend(stroke, x, y, minStep)) return stroke;
  return { ...stroke, pts: [...stroke.pts, x, y] };
}

export function appendPoints(stroke, pts) {
  if (!pts || pts.length === 0) return stroke;
  return { ...stroke, pts: [...stroke.pts, ...pts.map(clampNorm)] };
}

// The area of the surface actually used for drawing, letterboxed to ASPECT so
// both devices share one coordinate space regardless of their own shape.
export function fitBox(containerW, containerH, aspect = ASPECT) {
  if (containerW <= 0 || containerH <= 0) return { x: 0, y: 0, width: 0, height: 0 };
  let width = containerW;
  let height = width / aspect;
  if (height > containerH) {
    height = containerH;
    width = height * aspect;
  }
  return { x: (containerW - width) / 2, y: (containerH - height) / 2, width, height };
}
