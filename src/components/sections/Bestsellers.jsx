import { useEffect, useRef } from 'react';
import { gsap, SplitHeading, Reveal, useReducedMotion } from '../../lib/motion.jsx';
import { catalog } from '../../data/catalog.js';
import ProductCard from '../ui/ProductCard.jsx';

/* Wide screens: the section pins and the rail glides sideways as you scroll down.
   Phones: a native swipe rail with snap (thumbs already scroll sideways). */
export default function Bestsellers() {
  const section = useRef(null);
  const pin = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const rm = useReducedMotion();

  useEffect(() => {
    const tr = track.current;
    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 900px) and (prefers-reduced-motion: no-preference)', narrow: '(max-width: 899px), (prefers-reduced-motion: reduce)' }, (c) => {
      if (c.conditions.wide) {
        const dist = () => Math.max(0, tr.scrollWidth - innerWidth);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section.current, pin: pin.current, start: 'top top', end: () => `+=${dist()}`, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        tl.to(tr, { x: () => -dist(), ease: 'none' }, 0)
          .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0);
        // cards lean in as they travel, a whisper of depth
        tr.querySelectorAll('.card-img img:first-child').forEach((img) => {
          gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } });
        });
      } else {
        const onScroll = () => {
          const max = tr.scrollWidth - tr.clientWidth;
          gsap.set(bar.current, { scaleX: max > 0 ? tr.scrollLeft / max : 0 });
        };
        onScroll();
        tr.addEventListener('scroll', onScroll, { passive: true });
        return () => tr.removeEventListener('scroll', onScroll);
      }
    });
    return () => mm.revert();
  }, [rm]);

  return (
    <section className="best" id="bestsellers" ref={section}>
      <div className="best-pin" ref={pin}>
        <div className="wrap best-head">
          <div>
            <Reveal><p className="kicker">Bestsellers</p></Reveal>
            <SplitHeading className="h-xl">Our most loved.</SplitHeading>
          </div>
          <Reveal><p className="lede">The favourites, made by hand in Sikkim. Tap any one to buy it on our store.</p></Reveal>
        </div>
        <div className="best-track" ref={track}>
          {catalog.groups.bestsellers.map((h) => <ProductCard key={h} handle={h} />)}
        </div>
        <div className="best-progress" aria-hidden="true"><i ref={bar} /></div>
      </div>
    </section>
  );
}
