import {createContext, useContext, useId, type ReactNode} from 'react';
import {INK} from './colors';

/** Misregistration of the ink layer; the film "boils" it every few frames. */
export const InkOffset = createContext<readonly [number, number]>([6, 5]);

export const ink = (w = 3.2, color = INK, a = 1) =>
  ({fill: 'none', stroke: color, strokeWidth: w, strokeOpacity: a, strokeLinecap: 'round', strokeLinejoin: 'round'}) as const;

/** The house style: a flat fill, then the same outline in ink, nudged off-register. */
export const Art = ({d, color, w = 3.2}: {d: string; color: string; w?: number}) => {
  const [ox, oy] = useContext(InkOffset);
  return (
    <>
      <path d={d} fill={color} />
      <path d={d} transform={`translate(${ox} ${oy})`} {...ink(w)} />
    </>
  );
};

export const Clip = ({d, children}: {d: string; children: ReactNode}) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** Gaussian blur, sd in local units (like Skia's CTM-respecting blur). */
export const Blur = ({sd, children}: {sd: number; children: ReactNode}) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={sd} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </>
  );
};
