import {Blur, Clip} from './Art';
import {BRAND, MINT, WHITE} from './colors';
import {clamp, lerp} from './anim';
import {circle, poly, roundPoly, type P} from './geometry';

// The Semaloop mark in a 200x200 box: two pieces with the S-gap left open. Right = left rotated 180°.
export const LEFT: P[] = [[100, 34], [43, 67], [43, 135], [90, 112], [80, 104], [80, 82], [128, 50]];
export const RIGHT: P[] = LEFT.map(([x, y]) => [200 - x, 200 - y] as P);

type LogoProps = {cx: number; cy: number; size: number; split?: number; glow?: number; rot?: number; color?: string; slide?: number; shine?: number};

/** glow: the pieces light up with a soft halo. slide: logo units the left piece sits above (right below) its place.
 *  shine: 0..1 glint sweeping across. */
export const Logo = ({cx, cy, size, split = 0, glow = 0, rot = 0, color = WHITE, slide = 0, shine = 0}: LogoProps) => {
  const s = size / 200;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s}) translate(-100 -100)`}>
      {([[LEFT, -1], [RIGHT, 1]] as const).map(([pts, d]) => {
        const p = roundPoly(pts, 8);
        const x = lerp(-60, 260, shine);
        return (
          <g key={d} transform={`translate(${d * split * 0.55} ${d * split * 0.85 + d * slide})`}>
            {glow > 0 && ([[14, 0.55], [5, 0.8]] as const).map(([b, a]) => (
              <Blur key={b} sd={(b / s) * 0.5}><path d={p} fill="#e8fff5" fillOpacity={a * clamp(glow)} /></Blur>
            ))}
            <path d={p} fill={color} />
            {shine > 0 && shine < 1 && (
              <Clip d={poly(pts)}>
                <path d={poly([[x, 0], [x + 34, 0], [x - 66, 200], [x - 100, 200]])} fill={WHITE} />
                <path d={poly([[x - 2, 0], [x + 36, 0], [x - 64, 200], [x - 102, 200]])} fill={MINT} fillOpacity={0.35} />
              </Clip>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const MiniLogo = ({x, y, r}: {x: number; y: number; r: number}) => (
  <>
    <path d={circle(x, y, r)} fill={BRAND} />
    <Logo cx={x} cy={y} size={r * 2.2} />
  </>
);
