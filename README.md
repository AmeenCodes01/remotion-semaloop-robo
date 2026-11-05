# Semaloop robot ad, in React

An unofficial ad for [Semaloop](https://semaloop.com): AI intent-based testing on real iPhones.
An engineer hands over a scribbled spec. Semaloop drops its logo visor, installs the build on its buddy iPhone, scans it, taps through it,
checks the audio, stamps the box, and the build rides out through RELEASE. Fan piece, not affiliated with Semaloop.

Built with [Remotion](https://remotion.dev): the whole video is React SVG components plus a function of the frame number.

Rendered video: [out/semaloop.mp4](out/semaloop.mp4) (1080p, 60fps, 24.7s)

```bash
npm install
npm run studio      # preview and scrub in the browser
npm run render      # out/semaloop.mp4
npm run render:4k   # out/semaloop_4k.mp4
```

- `src/SemaloopAd.tsx`: the film. Every position is keyframed against time with `track()`.
- `src/brand/`: the kit (colours, the `Art` print-style primitive, the logo, characters, props, conveyor belt).
- `CLAUDE.md`: the style rules, so humans and agents keep new scenes on-brand.
