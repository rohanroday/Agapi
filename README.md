# Agapi Sikkim · website

Cinematic, scroll-driven homepage for [Agapi Sikkim](https://agapisikkim.com), handmade vegan skincare from Sikkim. Shopping stays on the Shopify store: every product links to its page on agapisikkim.com.

Built with React + Vite, GSAP (ScrollTrigger) for scroll animation, Lenis for smooth scrolling and Three.js for the floating petal layer.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

## Structure

```
index.html                 page shell, meta tags, fonts, splash markup + its critical CSS
public/assets/
  frames/d/                hero frames for desktop (192 × 1440px webp, scroll-scrubbed)
  video/                   hero-m.mp4 / hero-l.mp4 (phone and tablet loops), artisans.mp4
  img/                     photos, posters, logos, product shots (img/p), press and partner logos
src/
  main.jsx                 entry
  App.jsx                  page order, smooth scroll, lazy petal layer
  styles.css               all styles (design tokens at the top)
  lib/motion.jsx           Lenis + GSAP setup and shared helpers: Reveal, SplitHeading, parallax, media hooks
  data/catalog.js          product snapshot from the store's products.json
  data/links.js            store URLs
  components/
    layout/                Splash (intro controller), Nav (with mobile menu), Footer, ShopBar (phones)
    sections/              Hero, Origin, Botanicals, Bestsellers, Artisans, Press, Visit, FinalCta, Circle
    ui/                    ProductCard
    effects/               PetalField (Three.js, lazy-loaded)
docs/                      design package and the Google Flow prompts used for the hero
```

Local working files (raw renders, review frames, reference material) live in `_local/`, which git ignores.

## Notes

- Splash: the markup lives in `index.html` so it paints before the JS bundle. `Splash.jsx` fills the drop with real load progress (fonts + the hero's first frames or poster), then the drop falls into a ripple and the panel lifts away. It plays once per browser session (`sessionStorage` key `agapi-splash`) and never for reduced motion; the hero's video and first caption wait for it (`splashDone` in `motion.jsx`). It always lets go after 5 seconds on slow connections.
- Desktop: the hero draws a 192-frame sequence on a canvas, scrubbed by scroll over about 2.4 screens.
- Phones and tablets (`(max-width: 899px), (max-aspect-ratio: 1/1)`): the hero is one screen and the clip loops at 0.8x. Captions run once on the first pass, then the final message and call to action stay while the clip keeps looping. If autoplay is blocked (iOS Low Power Mode) it shows the splash frame and the call to action.
- Reduced-motion visitors get the still hero.
- Regenerate the frames from a new hero clip:
  `ffmpeg -i raw.mp4 -vf scale=1440:-2 -c:v libwebp -quality 70 public/assets/frames/d/%03d.webp`
  The phone/tablet loops dissolve their last 0.5s into their opening so the loop has no seam (use crop=608:1080:656:0 for hero-m, scale=1280:-2 for hero-l):
  `ffmpeg -i raw.mp4 -filter_complex "[0:v]crop=608:1080:656:0,split[x][y];[x]trim=start=0.5:end=8,setpts=PTS-STARTPTS[a];[y]trim=start=0:end=0.5,setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=0.5:offset=7.0,format=yuv420p[v]" -map "[v]" -c:v libx264 -crf 25 -preset slow -movflags +faststart -an public/assets/video/hero-m.mp4`
  and update the frame count in `src/components/sections/Hero.jsx`.
- Product data is a snapshot. To refresh prices, regenerate `src/data/catalog.js` from `https://agapisikkim.com/products.json`.
- Before deploying, replace `https://SITE-URL` in `index.html` with the live address.
