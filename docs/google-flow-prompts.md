# Google Flow prompts: hero "Botanical drop"

How to use: in Google Flow, first make the **start frame** image. Then use **Frames to Video** (image-to-video) with that frame and the video prompt below. Choose **16:9, 1080p, 8 seconds**. Download the MP4 and put it in `_local/_raw/` named `hero-raw.mp4` (that folder is ignored by git). The ffmpeg commands in the README turn it into the site's frames and videos.

---

## Step 1: Start frame (image, 16:9)

```
A single glowing drop of golden botanical oil suspended in the air at the top centre of the frame, the same distance from the left edge as from the right, composed as the first moment of a slow fall straight down. Around it, filling the frame edge to edge, soft Himalayan morning air: floating fresh green mugwort leaves with silvery undersides, a few tender green tea leaves, curls of bright orange peel and scattered deep red rhododendron petals, all drifting gently at different depths, sharp near the drop and softly out of focus at the edges. Warm low sunlight from the upper left, gentle haze and mist, a faint suggestion of distant blue mountain ridges far below. Colour world: warm peach and apricot light, sage green, mustard orange, deep rhododendron red, honey gold. The left third and right third of the frame are calm, soft-focus mist with only a few small blurred leaves, part of the same continuous scene. Cinematic macro photography, shallow depth of field, photorealistic, 16:9. No text, no logos, no lettering, no bottles anywhere.
```

If it puts the drop off centre, re-roll once, adding: "the drop bisects the frame exactly, dead centre horizontally".

## Step 2: Video (Frames to Video, 8 seconds, 1080p)

```
One continuous shot, no cuts. The golden oil drop falls slowly and gracefully straight down the centre of the frame, and the camera follows it smoothly downward at the same speed, keeping the drop in the upper middle of the frame. The drop stays alive the whole way: it wobbles softly and catches glints of warm sunlight. It passes close by slowly turning mugwort leaves and green tea leaves, then drifts past curls of orange peel and red rhododendron petals floating in the air. Soft mist streams upward past the lens as the camera descends. Near the end, the surface of a perfectly still, clear pool of water comes into view below, reflecting the warm sky. The drop touches the water at the centre of the frame and makes one small, beautiful splash, and soft concentric ripples spread out slowly. A few red petals and green leaves rest on the water around the ripples. The shot ends at rest: calm water, gentle ripples fading outward from the centre, warm golden morning light on the surface, the frame peaceful and still. No text, no logos, no lettering anywhere. No people, no hands.
```

## Checklist for a new render
- The drop stays in the centre lane, so the captions on both sides stay readable.
- The motion keeps going down the whole way (scrolling down should feel like falling).
- The ending rests on a strong frame (that is where the page settles).
- No warped leaves or strange shapes.

If the ending drifts, trim it with `-t` in ffmpeg. If the drop disappears or the camera cuts, re-roll.

## Optional supporting stills (same world, for later)
1. `Close up of fresh mugwort leaves with morning dew on a mossy stone, warm peach Himalayan morning light, soft mist, shallow depth of field, photorealistic, 16:9. No text, no logos.`
2. `Deep red rhododendron (guras) flowers on a branch in a misty Sikkim forest at sunrise, warm peach light, soft haze, photorealistic, 16:9. No text, no logos.`
