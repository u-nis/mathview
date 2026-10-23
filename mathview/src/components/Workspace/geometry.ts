/** Layout math for the workspace: bounds, collisions and free-spot search. */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Minimum gap kept between windows and between a window and the canvas edge. */
export const GAP = 16;

export function intersects(a: Rect, b: Rect, gap = GAP): boolean {
  return (
    a.x < b.x + b.w + gap &&
    b.x < a.x + a.w + gap &&
    a.y < b.y + b.h + gap &&
    b.y < a.y + a.h + gap
  );
}

export function collides(r: Rect, others: Rect[]): boolean {
  return others.some((o) => intersects(r, o));
}

/** Keep a rect inside the canvas horizontally and below the top edge. */
export function clampToBounds(r: Rect, planeWidth: number): Rect {
  const maxX = Math.max(GAP, planeWidth - r.w - GAP);
  return {
    ...r,
    x: Math.min(Math.max(GAP, r.x), maxX),
    y: Math.max(GAP, r.y),
  };
}

export function fitsBounds(r: Rect, planeWidth: number): boolean {
  return r.x >= GAP - 0.5 && r.y >= GAP - 0.5 && r.x + r.w <= planeWidth - GAP + 0.5;
}

/**
 * Move `current` toward `target` without overlapping `others`.
 * If the target spot is free we jump there (follow the mouse); otherwise we
 * slide along each axis as far as possible so windows hug each other.
 */
export function resolveMove(
  current: Rect,
  target: Rect,
  others: Rect[],
  planeWidth: number
): Rect {
  const t = clampToBounds(target, planeWidth);
  if (!collides(t, others)) return t;

  const slide = (from: Rect, axis: "x" | "y", to: number): Rect => {
    const dir = Math.sign(to - from[axis]);
    if (dir === 0) return from;
    let best = from;
    const dist = Math.abs(to - from[axis]);
    for (let d = 1; d <= dist; d++) {
      const cand = { ...from, [axis]: from[axis] + dir * d };
      if (collides(cand, others)) break;
      best = cand;
    }
    return best;
  };

  const xy = slide(slide(current, "x", t.x), "y", t.y);
  const yx = slide(slide(current, "y", t.y), "x", t.x);
  const dist = (r: Rect) => Math.hypot(r.x - t.x, r.y - t.y);
  return dist(xy) <= dist(yx) ? xy : yx;
}

/**
 * Find the first free spot (reading order) for a w×h window.
 * Shrinks the window if needed; falls back to below everything else.
 */
export function findFreeSpot(
  w: number,
  h: number,
  others: Rect[],
  planeWidth: number,
  viewHeight: number,
  minW = 260,
  minH = 220,
  aspect?: number
): Rect {
  const step = 8;
  let cw = Math.min(w, planeWidth - 2 * GAP);
  let ch = aspect ? cw / aspect : h;
  const limitY = Math.max(GAP, viewHeight - GAP);

  while (cw >= minW && ch >= minH) {
    for (let y = GAP; y + ch <= limitY || y === GAP; y += step) {
      for (let x = GAP; x + cw <= planeWidth - GAP; x += step) {
        const r = { x, y, w: cw, h: ch };
        if (!collides(r, others)) return r;
      }
      if (y + ch > limitY) break;
    }
    cw *= 0.85;
    ch *= 0.85;
  }

  const bottom = others.reduce((m, o) => Math.max(m, o.y + o.h), 0);
  const fw = Math.min(w, planeWidth - 2 * GAP);
  return { x: GAP, y: bottom + GAP, w: fw, h: aspect ? fw / aspect : h };
}
