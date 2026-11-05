import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {InkOffset, ink} from './brand/Art';
import {BRAND, GREEN, MINT, PAPER, WHITE} from './brand/colors';
import {blink, ein, eio, eout, lerp, rng, seg, track} from './brand/anim';
import {arc, poly, type P} from './brand/geometry';
import {Arm, BH, BW, Engineer, HR, Semaloop, shoulders} from './brand/Characters';
import {Logo} from './brand/Logo';
import {AppTile, Burst, Desk, Dock, Phone, phoneCorners, Sheet} from './brand/Props';
import {BELT_TOP, BOX_H, BoxBack, BoxFront, Conveyor, ReleaseDoor, StampTool} from './brand/Belt';

// Semaloop ad: the engineer walks a build over, Semaloop tests it on its buddy iPhone (scan, audio), stamps it,
// and it rides out through RELEASE. Text-free apart from that sign.
export const FPS = 60;
const STORY = 22.2;                 // story length in seconds
const HOLD_T = 8.2, HOLD_LEN = 1.0; // the story pauses here while the visor's logo slides in
export const DURATION = Math.round((STORY + HOLD_LEN) * FPS);
const W = 1920, H = 1080;

// Stage layout (ground = 0, x to the right)
const SX = 300;                      // Semaloop
const HY = -BH - HR - 6;             // head centre
const ST = 120;                      // where the build box sits on the belt
const DESK = -930, DOOR = 840;
const BOX_TOP = BELT_TOP - BOX_H;
const PH = 170;
const DOCK: P = [SX + 36, -148];     // chest dock for the buddy phone
const HOLD: P = [SX + 150, -238];    // phone held out to the right
const PX = SX + 160, PY = -262;      // scan position
const EAR: P = [SX + 118, HY + 10];

type V3 = readonly [number, number, number];
type V5 = readonly [number, number, number, number, number];

const CAM: [number, V3][] = [
  [0.0, [-870, -205, 2.2]], [2.6, [-870, -205, 2.2]], [5.4, [60, -205, 2.1]], [6.4, [110, -205, 2.2]],
  [7.2, [260, -262, 2.8]], [8.9, [260, -262, 2.8]], [9.4, [230, -215, 2.25]], [10.8, [230, -215, 2.25]],
  [11.2, [SX + 70, -245, 2.95]], [14.95, [SX + 70, -245, 2.95]], [15.2, [SX + 80, -250, 3.15]], [16.2, [SX + 80, -250, 3.15]],
  [16.6, [230, -215, 2.25]], [18.0, [230, -215, 2.25]], [18.6, [360, -205, 1.5]], [20.2, [360, -205, 1.5]],
];

const PHONE: [number, V5][] = [ // x, y, scale, rot, turn
  [9.05, [DOCK[0], DOCK[1], 0.42, 0, 0]], [9.45, [HOLD[0], HOLD[1], 1, 0, 0]], [10.9, [HOLD[0], HOLD[1], 1, 0, 0]],
  [11.2, [PX, PY, 1, 0, 1]], [13.35, [PX, PY, 1, 0, 1]], [13.7, [EAR[0], EAR[1], 1, 12, 0]], [14.9, [EAR[0], EAR[1], 1, 12, 0]],
  [15.2, [PX, PY, 1, 0, 0]], [16.9, [PX, PY, 1, 0, 0]], [17.2, [HOLD[0], HOLD[1] + 30, 1, 0, 0]], [17.9, [HOLD[0], HOLD[1] + 30, 1, 0, 0]],
  [18.3, [DOCK[0], DOCK[1], 0.42, 0, 0]],
];

export const SemaloopAd = () => {
  const tReal = useCurrentFrame() / FPS;
  const t = tReal < HOLD_T ? tReal : Math.max(HOLD_T, tReal - HOLD_LEN);

  // outline boil: the ink layer jitters every 4 frames
  const r = rng(Math.floor(Math.floor(t * FPS + 1e-6) / 4) + 1);
  const off = [6 + Math.floor(r() * 3) - 1, 5 + Math.floor(r() * 3) - 1] as const;
  const [fx, fy, z] = track(t, CAM);

  // ---------- engineer: walks the build over ----------
  const ex = track(t, [[2.3, DESK], [5.3, -60], [18.4, -60], [18.9, 70]]);
  const moving = (t > 2.3 && t < 5.3) || (t > 18.4 && t < 18.9);
  const bob = moving ? Math.abs(Math.sin((t - 2.3) * 9)) * 7 : 0;
  const carry = t >= 1.6 && t < 5.8;                 // box in both hands
  const boxCarry: P = [ex + 26, -150 - bob];
  const engSh = shoulders(ex, -bob)[1];
  const restE: P = [engSh[0] + 22, engSh[1] + 140];

  const boxX = t < 1.8 ? track(t, [[1.6, DESK + 120], [1.8, boxCarry[0]]])
    : t < 5.4 ? boxCarry[0]
    : track(t, [[5.4, boxCarry[0]], [5.85, ST], [18.0, ST], [19.6, DOOR + 40]]);
  const boxDy = t < 1.6 ? -40 : t < 5.4 ? -28 - bob : track(t, [[5.4, -28], [5.85, 0]]);
  const flaps = track(t, [[9.65, 0], [9.9, 1], [16.9, 1], [17.15, 0]]);

  const hE: P = carry ? [boxCarry[0] + 74, boxCarry[1]] : t < 1.6 ? restE : track<P>(t, [
    [5.8, [ST - 10, -190]], [6.1, [120, -250]], [6.6, [150, -236]], [6.75, [150, -236]], [7.1, restE],
    [18.9, restE], [19.25, [178, -322]], [19.35, [182, -324]], [19.6, [160, -305]], [19.9, restE]]);
  const handOver = t >= 5.9 && t < 6.75;             // the spec, held out to Semaloop

  // ---------- Semaloop ----------
  let visorDown = track(t, [[7.55, 0], [8.15, 1]], ein);
  if (t > 18.3) visorDown = track(t, [[18.3, 1], [18.7, 0]]);   // flips back up for the high five
  const visorDy = track(t, [[7.4, 0], [7.55, -8], [8.15, 0], [8.2, 3], [8.3, 0]]);
  // after the visor locks: the logo slides in (accelerating), a glint, then the glow
  const reveal = ein(seg(tReal, 8.2, 9.2));
  const shine = seg(tReal, 9.25, 9.7);
  let glow = tReal < 9.2 ? 0 : track(tReal, [[9.2, 0], [9.28, 1.1], [9.7, 1.0]]) + 0.06 * Math.sin(tReal * 5);
  if (t > 18.3) glow *= 1 - seg(t, 18.3, 18.6);

  const [shL, shR] = shoulders(SX, 0);
  const restL: P = [shL[0] - 22, shL[1] + 140], restR: P = [shR[0] + 22, shR[1] + 140];

  let [px, py, ps, prot, pturn] = track(t, PHONE);
  if (t < 9.05 || t >= 18.3) [px, py, ps, prot, pturn] = [DOCK[0], DOCK[1], 0.42, 0, 0];
  const inHand = t >= 9.25 && t < 18.15;
  const stampTop = BOX_TOP - 2 - 70 * (1 - track(t, [[17.2, 0], [17.42, 0], [17.5, 1], [17.62, 1], [17.8, 0]]));

  let hL = track<P>(t, [[0, restL], [6.3, restL], [6.6, [165, -236]], [6.75, [165, -236]], [7.0, [215, -300]], [8.5, [215, -300]],
    [8.8, restL], [9.6, restL], [9.85, [ST + 8, BOX_TOP + 40]], [10.0, [ST + 8, BOX_TOP + 40]], [10.3, [ST + 30, -250]],
    [10.45, [ST + 30, -250]], [10.7, restL], [17.2, restL], [17.3, [ST + 26, stampTop - 64]]]);
  if (t >= 17.3 && t < 17.8) hL = [ST + 26, stampTop - 64];
  if (t >= 17.8) hL = track<P>(t, [[17.8, [ST + 26, stampTop - 64]], [18.0, restL], [18.9, restL], [19.25, [190, -322]],
    [19.35, [186, -324]], [19.6, [210, -305]], [19.9, restL]]);
  let hR = track<P>(t, [[0, restR], [8.8, restR], [9.05, [DOCK[0] + 8, DOCK[1] + 30]]]);
  if (inHand) hR = [px + 10 * ps, py + 60 * ps];
  if (t >= 18.15) hR = track<P>(t, [[18.15, [DOCK[0] + 8, DOCK[1] + 30]], [18.5, restR]]);

  // the spec: read, then pulled into the S-gap
  let readSheet = null;
  if (t >= 6.75 && t < 8.95) {
    const [sx, sy] = [hL[0] - 40, hL[1] - 58];
    if (t < 8.5) readSheet = <Sheet cx={sx} cy={sy} rot={lerp(-8, 6, seg(t, 6.75, 7.1))} />;
    else {
      const p = eio(seg(t, 8.5, 8.9));
      readSheet = <Sheet cx={lerp(sx, SX, p)} cy={lerp(sy, HY, p)} rot={lerp(6, 200, p)} s={lerp(1, 0.05, p)} />;
    }
  }

  // app tile: lifted out of the box, flies into the phone; later pops back out and drops in
  let tile: [number, number, number, number] | null = null;
  if (t >= 9.85 && t < 10.75) {
    const k = eio(seg(t, 10.0, 10.3)), f = eio(seg(t, 10.45, 10.75));
    const x0 = lerp(ST, ST + 30, k), y0 = lerp(BOX_TOP + 30, -282, k);
    tile = [lerp(x0, HOLD[0], f), lerp(y0, HOLD[1], f), lerp(1, 0.4, f), lerp(0, 90, f)];
  }
  if (t >= 16.3 && t < 16.95) {
    const k = eout(seg(t, 16.3, 16.55)), f = ein(seg(t, 16.6, 16.95));
    const x0 = lerp(PX, PX - 40, k), y0 = lerp(PY, PY - 110, k);
    tile = [lerp(x0, ST, f), lerp(y0, BOX_TOP + 30, f), lerp(0.4, 1, k) * lerp(1, 0.9, f), lerp(90, 0, k)];
  }
  const tileInside = tile && (t < 10.05 || t > 16.85);  // still (or back) inside the box: behind its front
  const tileEl = tile && <AppTile x={tile[0]} y={tile[1]} s={tile[2]} rot={tile[3]} glow={1} />;

  // the buddy phone in hand
  const phone = {cx: px, cy: py, h: PH, s: ps, rot: prot, face: -1, turn: pturn,
    flip: track(t, [[15.25, 0], [15.5, 180], [15.75, 180], [16.0, 360]])};
  const corners = phoneCorners(phone);

  // the scan beam out of the logo's S-gap
  let beam = null;
  if (inHand && t >= 11.25 && t < 13.35) {
    const grow = eout(seg(t, 11.25, 11.45)), fade = 1 - seg(t, 13.15, 13.35);
    const src: P = [SX + 4, HY + 2];
    const [q0, q1] = corners.map(([x, y]) => [lerp(src[0], x, grow), lerp(src[1], y, grow)] as P);
    beam = (
      <>
        <path d={poly([src, q0, q1])} fill={MINT} fillOpacity={0.3 * fade} />
        {[q0, q1].map((q, i) => <line key={i} x1={src[0]} y1={src[1]} x2={q[0]} y2={q[1]} {...ink(2.4, MINT, fade)} />)}
        {[0.25, 0.5, 0.75].map((k) => (
          <line key={k} x1={src[0]} y1={src[1]} x2={lerp(q0[0], q1[0], k)} y2={lerp(q0[1], q1[1], k)}
            {...ink(2.2, MINT, fade)} strokeDasharray="10 12" strokeDashoffset={t * 180} />
        ))}
      </>
    );
  }

  // audio check: phone at the ear, sound arcs out of the speaker, a waveform, then a tick
  let audio = null;
  if (t >= 13.75 && t < 14.95) {
    const a = seg(t, 13.75, 13.9) * (1 - seg(t, 14.8, 14.95));
    const bx0 = px + 70;
    const k = eout(seg(t, 14.4, 14.6)) * (1 - seg(t, 14.8, 14.95));
    audio = (
      <>
        {[0, 1, 2].map((i) => {
          const ph = ((t - 13.75) * 1.6 + i / 3) % 1, rr = 40 + 70 * ph;
          return <path key={i} d={arc(px, py, rr, rr, -50, 100)} {...ink(5, MINT, a * (1 - ph))} />;
        })}
        {Array.from({length: 7}, (_, i) => {
          const hgt = 10 + 26 * Math.abs(Math.sin(t * 9 + i * 1.3)) * (0.6 + 0.4 * Math.sin(i)), x = bx0 + i * 14;
          return <line key={i} x1={x} y1={py - 70 - hgt / 2} x2={x} y2={py - 70 + hgt / 2} {...ink(6, GREEN, a)} />;
        })}
        {k > 0 && (
          <g transform={`translate(${bx0 + 120} ${py - 70}) scale(${k})`}>
            <circle r={16} fill={GREEN} />
            <path d={poly([[-7, 0], [-2, 6], [8, -7]], false)} {...ink(4, WHITE)} />
          </g>
        )}
      </>
    );
  }

  // ---------- end card: brand green floods out of Semaloop's head, the logo slides in ----------
  const tc = tReal - HOLD_LEN;
  const head: P = [(SX - fx) * z + W / 2, (HY - fy) * z + 560];
  const pe = eio(seg(tc, 20.6, 21.6));
  const ge = tc < 21.6 ? 0 : track(tc, [[21.6, 0], [21.68, 1.0], [22.0, 0.9]]);

  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <InkOffset.Provider value={off}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <g transform={`translate(${W / 2} 560) scale(${z}) translate(${-fx} ${-fy})`}>
            <ReleaseDoor x={DOOR} glow={seg(t, 18.4, 19.0)} />
            <Desk x={DESK + 70} />

            <Engineer x={ex} g={-bob} blink={blink(t, 0.7)} look={t > 1.6 ? 1 : -0.6} happy={t > 16.05 ? 1 : 0}
              squash={0.01 * Math.sin(t * 3)} lean={5 * (seg(t, 2.3, 2.6) - seg(t, 5.0, 5.3))}
              leftHand={carry ? [boxCarry[0] - 74, boxCarry[1]] : undefined} />

            <Semaloop x={SX} g={0} hands={[hL, hR]} visorDown={visorDown} visorDy={visorDy} glow={glow} reveal={reveal} shine={shine}
              blink={blink(t)} look={t < 7.2 ? -1 : -0.4} happy={t > 18.3 ? 1 : 0} squash={0.01 * Math.sin(t * 2.6 + 1)}>
              <Dock x={DOCK[0]} y={DOCK[1]} />
              {readSheet}
              {!inHand && <Phone cx={px} cy={py} h={PH} s={ps} wave={t} />}
            </Semaloop>

            {/* belt + box, in front of the characters */}
            <Conveyor x0={-560} x1={1300} roll={t > 5.4 ? boxX : 0} />
            <BoxBack x={boxX} open={flaps} dy={boxDy} />
            {t < 5.9 && <Sheet cx={boxX - 24} cy={BOX_TOP + boxDy - 12} rot={-7} s={0.62} />}
            {tileInside && tileEl}
            <BoxFront x={boxX} open={flaps} stamp={seg(t, 17.5, 17.62)} dy={boxDy} />
            {handOver && <Sheet cx={hE[0] + 40} cy={hE[1] - 60} />}
            {!tileInside && tileEl}
            {t >= 17.3 && t < 17.8 && (
              <>
                <StampTool x={ST + 26} y={stampTop} rot={-6} />
                <Burst x={ST + 26} y={BOX_TOP + 40} p={seg(t, 17.5, 17.8)} n={10} r0={46} r1={100} w={5} seed={9} />
                <Arm sh={shL} hand={hL} />
              </>
            )}
            <Arm sh={engSh} hand={hE} />

            {inHand && (
              <>
                <Phone {...phone} lock={t >= 10.72 && t < 16.35 ? 0 : 1} appIn={seg(t, 10.72, 10.95)}
                  scan={t >= 11.45 && t < 13.2 ? ((t - 11.45) / 0.8) % 1 : null}
                  ticks={[11.75, 12.2, 12.65, 14.5].map((a) => seg(t, a, a + 0.25))} check={seg(t, 16.0, 16.3)} wave={t} />
                <Arm sh={shR} hand={hR} bend={-1} />
              </>
            )}
            {beam}
            {audio}
            <Burst x={186} y={-324} p={seg(t, 19.32, 19.75)} n={14} r0={24} r1={110} w={6} seed={2} />
          </g>

          {tc >= 20.1 && (
            <>
              <circle cx={head[0]} cy={head[1]} r={lerp(0, 2400, ein(seg(tc, 20.1, 20.6)))} fill={BRAND} />
              {tc >= 20.6 && <Logo cx={W / 2} cy={H / 2} size={720} slide={(1 - pe) * 260} glow={ge} shine={seg(tc, 21.6, 22.05)} />}
            </>
          )}
        </svg>
      </InkOffset.Provider>
    </AbsoluteFill>
  );
};

