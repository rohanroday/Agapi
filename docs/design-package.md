# Agapi Sikkim: Design Package

Tier 1 (single journey), trimmed package. Copy below ships verbatim.

## 1. Brand premise
**Agapi means love.** Love, from the mountain. One golden drop carries the four Himalayan botanicals down into the bottle. Every section sells the same idea: made by hand, in Sikkim, with care for the skin, the land and the people who make it.

## 2. Palette (taken from the packshots and the orchard film)
The packshots share one warm peach backdrop, so the page lives on that same peach. This is a deliberate carve-out from the "cream canvas" ban: it is Agapi's real photographic world, and the accents come from their own labels, not terracotta.

```css
:root{
  --canvas:#F2E4D3;       /* peach studio backdrop of every packshot */
  --panel:#FAF2E8;
  --ink:#1E2622;          /* text-primary, deep moss black */
  --ink-2:#4B5650;        /* text-secondary */
  --forest:#21352C;       /* dark sections, orchard shade */
  --accent:#A8232D;       /* guras red: CTA + rare emphasis */
  --accent-hover:#8C1A23;
  --accent-muted:#E9B9A9;
  /* label colours, one per botanical */
  --mugwort:#7E9893; --guras:#93264A; --orange:#E2A52C; --greentea:#6F9A57;
}
```

## 3. Type trio
- Display: **Fraunces** 400/600 (soft, botanical serif; echoes the wordmark's slab weight without copying it)
- Body: **Figtree** 400/500/600
- Labels: **DM Mono** 400

## 4. Band map (hero, 8s Flow clip, ~520vh)
| Band | Range | Footage moment | Copy | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.22 | Drop hangs at the top among leaves | kicker "From the mountains of Sikkim" / H1 "One drop of love." | blur-to-sharp, settled on load |
| 2 | 0.27 to 0.48 | Drop falls past mugwort and green tea leaves | "Picked by hand on the hills of Sikkim." | drift-down (echoes the fall) |
| 3 | 0.53 to 0.72 | Passes guras petals and orange peel | "Mugwort. Guras. Orange peel. Green tea." | word-punch per botanical |
| 4 | 0.78 to 1.00 | Drop lands, ripple spreads, rest | H2 "Agapi. Love, from the mountain." / sub "Handmade, vegan skincare from Gangtok." / CTA "Shop the collection" + "Our story" | word rise into staged settle |

Captions sit left (bands 1, 2) and right (band 3) of the centre lane, where the drop falls. The settle sits upper centre above the ripple.

## 5. Static hero (phones, reduced motion)
Poster = the ending ripple frame. "One drop of love." / "Handmade, vegan skincare from the mountains of Sikkim." / [Shop the collection]

## 6. Below the fold
1. **Origin**: "Sikkimese roots, global dreams." Founder story (from their site), plus a self-drawing Kanchenjunga ridge line. Photos: the product on rock with prayer flags.
2. **The four botanicals** (the interactive moment): pick a botanical. The peak-shaped label recolours, the ingredient photo crossfades, and that botanical's products slide in.
3. **Bestsellers**: a rail of 7 tagged products. Every card links to its Shopify product.
4. **Our artisan family**: the orchard film loop at full bleed. Counter "70%" with "of our artisans have doubled their income in the last 2+ years."
5. **Featured on**: a press logo marquee, plus a "Find us at" list of partner stays.
6. **Visit our store**: the Gangtok store photo.
7. **Final CTA**: "Bring the mountain home." [Shop the collection]
8. **Join the Agapi Circle**: email form that posts to their Shopify newsletter (opens in a new tab).
9. **Footer**: links, Instagram and Facebook.

## 7. Vector layer
- The **peak**: the label's mountain-top silhouette, used as card tops, section dividers and the scroll ridge.
- A self-drawing ridge line in Origin.
- Whisper-level drifting pollen and petals on a fixed background layer, with a slow 60s grain/glow drift.

## 8. Engineering
Follow `scrub-pipeline.md` in full: Blob fetch with a ring, dt-normalised lerp, gated seeks, delta-gated writes, the five static gates in both CSS and JS, complete-without-video, and live reduced motion.

## 9. Copy gate
Zero em dashes and zero stock words. No medical claims beyond the brand's own words.
