# Semaloop ad (Remotion)

`npm run studio` to preview, `npm run render` (1080p60) or `npm run render:4k`.
The film is `src/SemaloopAd.tsx`: every value is a function of `t` (seconds) via `track()` keyframes in `src/brand/anim.ts`.
`src/brand/` is the kit: colours, the `Art` primitive, the logo, characters (`Engineer`, `Semaloop`), props, belt.

## Style rules
- Flat 2D shapes only: circle heads, rectangle bodies, flat colour, and the offset ink outline from `<Art>`. No clothes, no gradients.
- Engineer: yellow head, blue body, coral `</>` bow tie. Semaloop: green body with gloss, white head, brand-green visor. Same size.
- No text anywhere except signs (`<Sign>`, e.g. RELEASE). Scribbled lines stand in for any writing.
- The logo is always white pieces on BRAND `#28765c`. Never invert it or recolour the pieces (the green box stamp is the one exception).
- Greens get gloss. Motion is calm: ease in and out, little bounce, no thumbs-up.
- Arms: a raised hand hangs its elbow down (`<Arm>` does this).
- Check stills before showing a change: `npx remotion still SemaloopAd out/f.png --frame N`.
