// SVG path builders. Units: stage pixels, y down.
export type P = readonly [number, number];

export const poly = (pts: readonly P[], close = true) =>
  'M' + pts.map(([x, y]) => `${x} ${y}`).join(' L') + (close ? ' Z' : '');

export const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;

export const rect = (l: number, t: number, r: number, b: number, rad = 8) => {
  rad = Math.max(0, Math.min(rad, (r - l) / 2, (b - t) / 2));
  if (rad === 0) return `M${l} ${t} H${r} V${b} H${l} Z`;
  return `M${l + rad} ${t} H${r - rad} A${rad} ${rad} 0 0 1 ${r} ${t + rad} V${b - rad} A${rad} ${rad} 0 0 1 ${r - rad} ${b}` +
    ` H${l + rad} A${rad} ${rad} 0 0 1 ${l} ${b - rad} V${t + rad} A${rad} ${rad} 0 0 1 ${l + rad} ${t} Z`;
};

/** Polygon with its corners rounded off by r. */
export const roundPoly = (pts: readonly P[], r: number) => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [vx, vy] = pts[i], [px, py] = pts[(i + n - 1) % n], [nx, ny] = pts[(i + 1) % n];
    const d1 = Math.hypot(px - vx, py - vy), d2 = Math.hypot(nx - vx, ny - vy);
    const k = Math.min(r, d1 / 2, d2 / 2);
    d += `${i ? 'L' : 'M'}${vx + ((px - vx) * k) / d1} ${vy + ((py - vy) * k) / d1} Q${vx} ${vy} ${vx + ((nx - vx) * k) / d2} ${vy + ((ny - vy) * k) / d2} `;
  }
  return d + 'Z';
};

/** Elliptical arc, angles in degrees, clockwise on screen. */
export const arc = (cx: number, cy: number, rx: number, ry: number, start: number, sweep: number) => {
  const a0 = (start * Math.PI) / 180, a1 = ((start + sweep) * Math.PI) / 180;
  return `M${cx + rx * Math.cos(a0)} ${cy + ry * Math.sin(a0)} A${rx} ${ry} 0 ${Math.abs(sweep) > 180 ? 1 : 0} ${sweep > 0 ? 1 : 0} ${cx + rx * Math.cos(a1)} ${cy + ry * Math.sin(a1)}`;
};
