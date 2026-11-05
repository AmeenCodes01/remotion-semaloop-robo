import type {ReactNode} from 'react';
import {Art, Clip, ink} from './Art';
import {Logo} from './Logo';
import {BLUE, BRAND, CORAL, GREEN, INK, WHITE, YELLOW} from './colors';
import {clamp, eio, lerp} from './anim';
import {arc, circle, poly, rect, roundPoly, type P} from './geometry';

// Box people: rectangle body, circle head. No clothes, just colour.
export const BW = 140, BH = 200, HR = 68;

export const Ground = ({x, g, w = 180}: {x: number; g: number; w?: number}) => (
  <line x1={x - w / 2} y1={g + 10} x2={x + w / 2} y2={g + 10} {...ink(4, INK, 0.25)} />
);

/** Squash (+ = flatten) and lean (degrees) about the character's feet. */
const pose = (x: number, g: number, squash: number, lean: number) =>
  `translate(${x} ${g}) rotate(${lean}) scale(${1 + squash * 0.6} ${1 - squash}) translate(${-x} ${-g})`;

/** Two-bone arm. A raised hand always hangs its elbow down; a lowered arm keeps the requested side. */
export const Arm = ({sh, hand, bend = 1, w = 7}: {sh: P; hand: P; bend?: number; w?: number}) => {
  const [L0, L1] = [78, 72];
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1];
  const d = Math.max(1e-3, Math.min(L0 + L1 - 0.5, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((L0 ** 2 + d * d - L1 ** 2) / (2 * L0 * d), -1, 1));
  const [e0, e1] = [bend, -bend].map((k) => [sh[0] + L0 * Math.cos(a + k * b), sh[1] + L0 * Math.sin(a + k * b)] as P);
  const e = hand[1] < sh[1] + 60 && e1[1] > e0[1] ? e1 : e0;
  return (
    <>
      <path d={poly([sh, e, hand], false)} {...ink(w)} />
      <circle cx={hand[0]} cy={hand[1]} r={w * 1.1} fill={INK} />
    </>
  );
};

export const Eyes = ({hx, hy, blink = 0, look = 0, happy = 0}: {hx: number; hy: number; blink?: number; look?: number; happy?: number}) => (
  <>
    {[-1, 1].map((s) => {
      const x = hx + s * 20 + look * 8;
      if (happy > 0.5) return <path key={s} d={arc(x, hy + 3, 8, 7, 200, 140)} {...ink(4.5)} />;
      if (blink > 0.5) return <line key={s} x1={x - 7} y1={hy} x2={x + 7} y2={hy} {...ink(4)} />;
      return <circle key={s} cx={x} cy={hy} r={6.5} fill={INK} />;
    })}
  </>
);

/** The engineer's `</>` bow tie. */
export const Bowtie = ({x, y, s = 1}: {x: number; y: number; s?: number}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Art d={roundPoly([[-3, -3], [-34, -19], [-34, 19], [-3, 3]], 4)} color={CORAL} />
    <Art d={roundPoly([[3, -3], [34, -19], [34, 19], [3, 3]], 4)} color={CORAL} />
    <Art d={rect(-8, -10, 8, 10, 3)} color={CORAL} />
    <path d={poly([[-16, -7], [-25, 0], [-16, 7]], false)} {...ink(3.2, WHITE)} />
    <line x1={3} y1={-6} x2={-3} y2={6} {...ink(3.2, WHITE)} />
    <path d={poly([[16, -7], [25, 0], [16, 7]], false)} {...ink(3.2, WHITE)} />
  </g>
);

/** Shoulders in stage space, for arms drawn later over props. */
export const shoulders = (x: number, g: number): [P, P] => [[x - BW / 2 + 6, g - BH + 30], [x + BW / 2 - 6, g - BH + 30]];

type EngineerProps = {x: number; g: number; blink?: number; look?: number; happy?: number; squash?: number; lean?: number; leftHand?: P};

/** The engineer. Its right arm is not drawn here: draw it after props with <Arm sh={shoulders(x, g)[1]} />. */
export const Engineer = ({x, g, blink = 0, look = 0, happy = 0, squash = 0, lean = 0, leftHand}: EngineerProps) => {
  const top = g - BH, hy = top - HR - 6;
  const [shL] = shoulders(x, g);
  return (
    <>
      <Ground x={x} g={g} />
      <g transform={pose(x, g, squash, lean)}>
        <Arm sh={shL} hand={leftHand ?? [shL[0] - 22, shL[1] + 140]} />
        <Art d={rect(x - BW / 2, top, x + BW / 2, g, 10)} color={BLUE} />
        <Art d={circle(x, hy, HR)} color={YELLOW} />
        <Eyes hx={x} hy={hy + 2} blink={blink} look={look} happy={happy} />
        <Bowtie x={x} y={top + 18} s={1.25} />
      </g>
    </>
  );
};

// Wide racing visor: a superellipse sitting a little above the head centre.
const VISOR_RX = 104, VISOR_RY = 70, VISOR_DY = -6, VISOR_K = 3;
export const visor = (cx: number, cy: number, n = 144) => {
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const th = (2 * Math.PI * i) / n, ct = Math.cos(th), st = Math.sin(th);
    const inside = (d: number) => Math.abs((d * ct) / VISOR_RX) ** VISOR_K + Math.abs((d * st - VISOR_DY) / VISOR_RY) ** VISOR_K <= 1;
    let lo = 0, hi = 200;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (inside(mid)) lo = mid; else hi = mid;
    }
    pts.push([cx + ct * lo, cy + st * lo]);
  }
  return poly(pts);
};

type MaskProps = {cx: number; cy: number; r: number; glow?: number; rot?: number; reveal?: number; shine?: number};

/** Brand-green visor over the face, glossy. reveal: the white logo pieces slide in (left from the top, right from below). */
export const Mask = ({cx, cy, r, glow = 0, rot = 0, reveal = 1, shine = 0}: MaskProps) => {
  const outline = visor(cx, cy);
  return (
    <>
      <Art d={outline} color={BRAND} />
      <Clip d={outline}>
        <path d={arc(cx, cy, r * 0.82, r * 0.82, 195, 70)} {...ink(r * 0.12, WHITE, 0.32)} />
        <circle cx={cx + r * 0.55} cy={cy + r * 0.5} r={r * 0.09} fill={WHITE} fillOpacity={0.35} />
      </Clip>
      {reveal > 0 && (
        <Clip d={outline}>
          <Logo cx={cx} cy={cy} size={136} glow={glow} rot={rot} slide={(1 - reveal) * 170} shine={shine} />
        </Clip>
      )}
    </>
  );
};

type SemaloopProps = {
  x: number; g: number; hands: [P, P];
  /** 0 = visor raised on top of the head, 1 = closed over the face */
  visorDown?: number; visorDy?: number; glow?: number; reveal?: number; shine?: number;
  blink?: number; look?: number; happy?: number; squash?: number; lean?: number;
  /** drawn between the body and the arms (props it holds) */
  children?: ReactNode;
};

/** The Semaloop robot: green body with gloss, white head, logo visor. */
export const Semaloop = ({x, g, hands, visorDown = 1, visorDy = 0, glow = 0, reveal = 1, shine = 0, blink = 0, look = 0, happy = 0,
  squash = 0, lean = 0, children}: SemaloopProps) => {
  const top = g - BH, hy = top - HR - 6;
  const k = eio(clamp(visorDown));
  const [shL, shR] = shoulders(x, g);
  return (
    <>
      <Ground x={x} g={g} />
      <g transform={pose(x, g, squash, lean)}>
        <Art d={rect(x - BW / 2, top, x + BW / 2, g, 10)} color={GREEN} />
        <Clip d={rect(x - BW / 2, top, x + BW / 2, g, 0)}>
          <path d={poly([[x - BW / 2, top + 70], [x - BW / 2 + 70, top], [x - BW / 2 + 100, top], [x - BW / 2, top + 100]])} fill={WHITE} fillOpacity={0.22} />
          <path d={rect(x - BW / 2 + 8, top + 12, x - BW / 2 + 16, g - 20, 0)} fill={WHITE} fillOpacity={0.18} />
        </Clip>
        {visorDown < 0.99 && <Art d={circle(x, hy, HR)} color={WHITE} />}
        {visorDown < 0.9 && <Eyes hx={x} hy={hy + 6} blink={blink} look={look} happy={happy} />}
        <Mask cx={x} cy={lerp(hy - 96, hy, k) + visorDy} r={HR + 4} glow={glow} rot={lerp(-16, 0, k)} reveal={reveal} shine={shine} />
        {children}
        <Arm sh={shL} hand={hands[0]} bend={1} />
        <Arm sh={shR} hand={hands[1]} bend={-1} />
      </g>
    </>
  );
};
