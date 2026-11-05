// Time helpers. Everything in the film is a pure function of t (seconds).
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eio = (p: number) => p * p * (3 - 2 * p);
export const ein = (p: number) => p ** 3;
export const eout = (p: number) => 1 - (1 - p) ** 3;

/** Keyframes [time, value]; value is a number or a tuple. Eased between neighbours, held outside. */
export function track<T extends number | readonly number[]>(t: number, keys: [number, T][], ease = eio): T {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i + 1 < keys.length; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const p = ease(seg(t, t0, t1));
      if (typeof v0 === 'number') return lerp(v0, v1 as number, p) as T;
      return (v0 as readonly number[]).map((a, j) => lerp(a, (v1 as readonly number[])[j], p)) as unknown as T;
    }
  }
  return keys[keys.length - 1][1];
}

export const blink = (t: number, offset = 0) => ((t + offset) % 3.1 < 0.09 ? 1 : 0);

/** Seeded PRNG (mulberry32) so scribbles and bursts look the same on every frame. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};
