import {Art, Clip, ink} from './Art';
import {MiniLogo} from './Logo';
import {BLUE, CORAL, GREEN, INK, MINT, SLATE, WHITE, YELLOW} from './colors';
import {clamp, eout, lerp, rng} from './anim';
import {arc, poly, rect, type P} from './geometry';

/** The spec: a sheet of scribbled lines. No readable text, ever. */
export const Sheet = ({cx, cy, rot = -8, s = 1, seed = 3, w = 130, h = 170}: {cx: number; cy: number; rot?: number; s?: number; seed?: number; w?: number; h?: number}) => {
  const rand = rng(seed);
  const u = (a: number, b: number) => a + (b - a) * rand();
  const lines = Array.from({length: 6}, (_, i) => {
    const y = -h / 2 + 26 + i * 22, x0 = -w / 2 + 18, L = u(0.5, 0.92) * (w - 36), n = Math.floor(L / 7);
    const pts: P[] = [[x0, y]];
    for (let k = 1; k <= n; k++) pts.push([x0 + (L * k) / n, y + u(-4, 4) + (k % 2 ? 3 : -3)]);
    return poly(pts, false);
  });
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <Art d={rect(-w / 2, -h / 2, w / 2, h / 2, 4)} color={WHITE} />
      {lines.map((d, i) => <path key={i} d={d} {...ink(2.6, BLUE)} />)}
    </g>
  );
};

/** Radial burst of strokes; p runs 0..1 over its life. */
export const Burst = ({x, y, p, colors = [MINT, YELLOW, CORAL], n = 12, r0 = 30, r1 = 110, w = 6, seed = 1}:
  {x: number; y: number; p: number; colors?: string[]; n?: number; r0?: number; r1?: number; w?: number; seed?: number}) => {
  if (p <= 0 || p >= 1) return null;
  const rand = rng(seed);
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * 2 * Math.PI + (rand() * 0.3 - 0.15);
        const rb = lerp(r0, r1, eout(clamp(p * 1.6))), ra = lerp(r0, rb, clamp((p - 0.3) / 0.7));
        return <line key={i} x1={x + Math.cos(a) * ra} y1={y + Math.sin(a) * ra} x2={x + Math.cos(a) * rb} y2={y + Math.sin(a) * rb}
          {...ink(w * (1 - p * 0.6), colors[i % colors.length])} />;
      })}
    </>
  );
};

export const ROWS = [[-58, 40, MINT, 1.0], [-4, 16, YELLOW, 0.72], [22, 16, CORAL, 0.72], [48, 16, BLUE, 0.72]] as const;

type PhoneProps = {
  cx: number; cy: number; h?: number; s?: number; rot?: number;
  /** -1: the screen turns left (toward a robot on the left) */ face?: number;
  turn?: number; flip?: number; lock?: number; appIn?: number; scan?: number | null; ticks?: number[]; check?: number; wave?: number;
};

// The original used a perspective matrix (w = 1 + p*x) to turn the phone toward the robot. SVG has no perspective, so this is
// that projection linearised at the phone centre: narrower plus a slight skew (only the small taper is lost).
const phoneMatrix = (cx: number, cy: number, h: number, s: number, face: number, turn: number, flip: number) => {
  const p = (-face * 0.0009 * turn) / Math.max(s, 0.3);
  const sx = lerp(1, 0.72, turn) * Math.cos((flip * Math.PI) / 180) * s;
  return {w: h * 0.49, a: sx - cx * p, b: -cy * p, d: s};
};

/** The two screen corners on the robot's side, in stage space (for the scan beam). */
export const phoneCorners = ({cx, cy, h = 170, s = 1, face = 1, turn = 0, flip = 0}: PhoneProps): [P, P] => {
  const {w, a, b, d} = phoneMatrix(cx, cy, h, s, face, turn, flip);
  const xs = face < 0 ? -w / 2 + 6 : w / 2 - 6;
  return [[cx + a * xs, cy + b * xs + d * (-h / 2 + 6)], [cx + a * xs, cy + b * xs + d * (h / 2 - 6)]];
};

/** Semaloop's own buddy iPhone. lock: lock screen with the mini Semaloop logo; otherwise the app under test.
 *  flip turns it around its vertical axis: past 90° we see the back with the camera bump. */
export const Phone = ({cx, cy, h = 170, s = 1, rot = 0, face = 1, turn = 0, flip = 0, lock = 1, appIn = 0, scan = null, ticks = [], check = 0, wave = 0}: PhoneProps) => {
  const {w, a, b: skew, d} = phoneMatrix(cx, cy, h, s, face, turn, flip);
  const l = -w / 2 + 6, t = -h / 2 + 6, r = w / 2 - 6, b = h / 2 - 6;
  const front = Math.cos((flip * Math.PI) / 180) >= 0;
  const L = l + 8, R = r - 8;
  return (
    <g transform={`matrix(${a} ${skew} 0 ${d} ${cx} ${cy}) rotate(${rot})`}>
      {turn > 0.01 && <path d={rect(-w / 2, -h / 2, w / 2, h / 2, w * 0.2)} transform={`translate(${face * 10 * turn} ${-2 * turn})`} fill={SLATE} />}
      <Art d={rect(-w / 2, -h / 2, w / 2, h / 2, w * 0.2)} color={INK} />
      {front ? (
        <>
          <Clip d={rect(l, t, r, b, w * 0.15)}>
            {lock > 0.5 ? (
              <>
                <path d={rect(l, t, r, b, 0)} fill="#e9f6f0" />
                <MiniLogo x={0} y={-6} r={22 + 1.5 * Math.sin(wave * 3)} />
                <path d={rect(-18, b - 16, 18, b - 11, 3)} fill={INK} fillOpacity={0.5} />
              </>
            ) : (
              <>
                <path d={rect(l, t, r, b, 0)} fill={WHITE} />
                {ROWS.map(([y, hh, cc, wf], i) => <path key={i} d={rect(L, y, L + (R - L) * wf, y + hh, 4)} fill={i ? cc : CORAL} />)}
                <path d={rect(L, b - 26, R, b - 10, 8)} fill={CORAL} />
                {ticks.map((k, i) => k > 0 && (
                  <g key={i} transform={`translate(${R - 8} ${ROWS[i][0] + ROWS[i][1] / 2}) scale(${eout(k)})`}>
                    <circle r={9} fill={GREEN} />
                    <path d={poly([[-4, 0], [-1, 3.5], [4.5, -3.5]], false)} {...ink(2.4, WHITE)} />
                  </g>
                ))}
                {scan != null && (() => {
                  const y = lerp(t - 10, b + 10, scan);
                  return <><path d={rect(l, y - 30, r, y, 0)} fill={MINT} fillOpacity={0.32} /><line x1={l} y1={y} x2={r} y2={y} {...ink(3.5, MINT)} /></>;
                })()}
                {appIn > 0 && <path d={rect(l, t, r, b, 0)} fill={WHITE} fillOpacity={1 - appIn} />}
                {check > 0 && (
                  <>
                    <path d={rect(l, t, r, b, 0)} fill={GREEN} fillOpacity={0.9 * clamp(check * 2)} />
                    <g transform={`scale(${eout(check)})`}>
                      <circle r={30} fill={WHITE} />
                      <path d={poly([[-13, 0], [-4, 10], [14, -11]], false)} {...ink(7, GREEN)} />
                    </g>
                  </>
                )}
              </>
            )}
          </Clip>
          <path d={rect(-w * 0.16, t + 5, w * 0.16, t + 13, 4)} fill={INK} />
        </>
      ) : (
        <>
          <Art d={rect(l + 4, t + 4, l + 50, t + 50, 12)} color={SLATE} w={2.6} />
          {([[l + 17, t + 17], [l + 17, t + 37], [l + 37, t + 27]] as const).map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={8.5} fill="#6b6a85" />
              <circle cx={x} cy={y} r={5.5} fill={INK} />
              <circle cx={x - 1.5} cy={y - 1.5} r={1.6} fill={WHITE} />
            </g>
          ))}
          <circle cx={l + 37} cy={t + 11} r={3} fill={YELLOW} />
        </>
      )}
    </g>
  );
};

/** The build: an app icon that travels between the box and the phone. */
export const AppTile = ({x, y, s = 1, rot = 0, glow = 0}: {x: number; y: number; s?: number; rot?: number; glow?: number}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow > 0 && <path d={rect(-34, -34, 34, 34, 16)} fill={MINT} fillOpacity={0.45 * glow} />}
    <Art d={rect(-26, -26, 26, 26, 12)} color={CORAL} />
    <path d={poly([[-12, -4], [12, -4], [9, 13], [-9, 13]])} fill={WHITE} />
    <path d={arc(0, -7, 8, 9, 180, 180)} {...ink(3.5, WHITE)} />
  </g>
);

export const Desk = ({x}: {x: number}) => (
  <>
    <Art d={rect(x - 120, -118, x + 120, -98, 4)} color="#c98a4b" />
    {[x - 100, x + 100].map((lx) => <path key={lx} d={rect(lx - 6, -98, lx + 6, 0, 0)} fill={INK} />)}
    <Art d={poly([[x - 70, -122], [x + 10, -122], [x + 20, -118], [x - 80, -118]])} color={SLATE} />
    <Art d={rect(x - 64, -210, x + 4, -122, 6)} color={SLATE} />
    <circle cx={x - 30} cy={-168} r={9} fill={WHITE} fillOpacity={0.5} />
  </>
);

/** Chest holster for the buddy phone. */
export const Dock = ({x, y}: {x: number; y: number}) => <Art d={rect(x - 26, y - 20, x + 26, y + 40, 9)} color={SLATE} />;

