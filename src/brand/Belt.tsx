import {Art, Clip, ink} from './Art';
import {Logo} from './Logo';
import {GREEN, INK, MINT, SLATE, WHITE} from './colors';
import {poly, rect, roundPoly} from './geometry';

export const BELT_TOP = -78, BOX_W = 140, BOX_H = 92;
const CARD = '#e3a869', CARD_D = '#c98a4b';

/** roll: distance the belt has moved (rollers and dashes move with it). */
export const Conveyor = ({x0 = -1200, x1 = 1200, roll = 0}: {x0?: number; x1?: number; roll?: number}) => (
  <>
    <Art d={rect(x0, BELT_TOP, x1, BELT_TOP + 26, 8)} color={SLATE} />
    <Art d={rect(x0, BELT_TOP + 26, x1, 40, 6)} color="#e6e0d2" />
    {Array.from({length: Math.floor((x1 - x0) / 60) + 1}, (_, i) => {
      const x = x0 + 30 + i * 60, a = roll / 11 + i;
      return (
        <g key={i}>
          <circle cx={x} cy={BELT_TOP + 48} r={11} fill={INK} />
          <line x1={x} y1={BELT_TOP + 48} x2={x + 8 * Math.cos(a)} y2={BELT_TOP + 48 + 8 * Math.sin(a)} {...ink(3, '#e6e0d2')} />
        </g>
      );
    })}
    <line x1={x0} y1={BELT_TOP + 12} x2={x1} y2={BELT_TOP + 12} {...ink(3, '#5b5a78')} strokeDasharray="18 22" strokeDashoffset={-roll} />
  </>
);

/** Back flap + dark inside; draw before anything that sits inside the box. dy lifts the box (negative = up). */
export const BoxBack = ({x, open = 1, dy = 0}: {x: number; open?: number; dy?: number}) => {
  if (open <= 0) return null;
  const top = BELT_TOP - BOX_H + dy, h = 30 * open;
  return (
    <>
      <path d={rect(x - BOX_W / 2 + 6, top - 4, x + BOX_W / 2 - 6, top + 10, 0)} fill="#7a5230" />
      <Art d={roundPoly([[x - BOX_W / 2 + 4, top], [x + BOX_W / 2 - 4, top], [x + BOX_W / 2 - 14, top - h], [x - BOX_W / 2 + 14, top - h]], 3)} color={CARD_D} />
    </>
  );
};

/** stamp: 0..1, the Semaloop mark inked onto the box in green. */
export const BoxFront = ({x, open = 1, stamp = 0, dy = 0}: {x: number; open?: number; stamp?: number; dy?: number}) => {
  const top = BELT_TOP - BOX_H, s = 1 + 0.25 * (1 - stamp);
  return (
    <g transform={`translate(0 ${dy})`}>
      <Art d={rect(x - BOX_W / 2, top, x + BOX_W / 2, BELT_TOP, 6)} color={CARD} />
      <path d={rect(x - 10, top, x + 10, top + 34, 0)} fill={GREEN} />
      <path d={rect(x - BOX_W / 2 + 16, BELT_TOP - 34, x - BOX_W / 2 + 52, BELT_TOP - 16, 0)} fill={WHITE} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={x - BOX_W / 2 + 21 + i * 6} y1={BELT_TOP - 30} x2={x - BOX_W / 2 + 21 + i * 6} y2={BELT_TOP - 20} {...ink(2)} />)}
      {open > 0
        ? <Art d={roundPoly([[x - BOX_W / 2, top], [x + BOX_W / 2, top], [x + BOX_W / 2 + 6, top + 22 * open], [x - BOX_W / 2 - 6, top + 22 * open]], 3)} color={CARD} />
        : <line x1={x - BOX_W / 2} y1={top + 4} x2={x + BOX_W / 2} y2={top + 4} {...ink(3, CARD_D)} />}
      {stamp > 0 && (
        <g transform={`translate(${x + 26} ${BELT_TOP - 50}) rotate(-10) scale(${s})`}>
          <circle r={32} {...ink(4, GREEN, stamp)} />
          <Logo cx={0} cy={0} size={80} color={GREEN} />
        </g>
      )}
    </g>
  );
};

/** Rubber stamp held by its knob; (x, y) = bottom centre of the stamp face. */
export const StampTool = ({x, y, rot = 0}: {x: number; y: number; rot?: number}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Art d={rect(-34, -22, 34, 0, 5)} color={GREEN} />
    <Art d={rect(-9, -60, 9, -22, 4)} color={INK} />
    <Art d={`M-16 -68 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0 Z`} color="#ff5b4f" />
  </g>
);

/** The only words in the film live on signs. */
export const Sign = ({x, y, word, color = INK, textWidth}: {x: number; y: number; word: string; color?: string; textWidth: number}) => {
  const w = textWidth + 44;
  return (
    <>
      <Art d={rect(x - w / 2, y - 24, x + w / 2, y + 24, 12)} color={color} />
      <text x={x} y={y + 11} textAnchor="middle" fill={WHITE} fontFamily="Avenir Next, Avenir, Helvetica, sans-serif" fontWeight={800} fontSize={30}>{word}</text>
    </>
  );
};

export const ReleaseDoor = ({x, glow = 0}: {x: number; glow?: number}) => {
  const d = rect(x - 105, -330, x + 105, BELT_TOP + 26, 90);
  return (
    <>
      <Art d={d} color={INK} />
      <Clip d={d}>
        <path d={rect(x - 105, -330, x + 105, 0, 0)} fill={MINT} fillOpacity={0.25 + 0.4 * glow} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const xx = x - 105 + 18 + i * 35;
          return <path key={i} d={rect(xx, -290, xx + 26, BELT_TOP + 26, 0)} fill={WHITE} fillOpacity={0.18} />;
        })}
      </Clip>
      <Sign x={x} y={-370} word="RELEASE" color={GREEN} textWidth={134} />
    </>
  );
};

