import { useEffect, useRef } from 'react';
import { gsap, Reveal, SplitHeading, useReducedMotion } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

export default function FinalCta() {
  const section = useRef(null);
  const bg = useRef(null);
  const rm = useReducedMotion();
  // the frozen splash settles from a slow zoom as you arrive
  useEffect(() => {
    if (rm) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(bg.current, { scale: 1.3, yPercent: -6 }, {
        scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'center center', scrub: true },
      });
    });
    return () => ctx.revert();
  }, [rm]);
  return (
    <section className="final" id="shop" ref={section}>
      <div className="final-bg" aria-hidden="true"><img ref={bg} src="/assets/img/hero-ending.jpg" alt="" loading="lazy" /></div>
      <div className="final-copy">
        <SplitHeading className="display">Bring the mountain home.</SplitHeading>
        <Reveal stagger y={24}>
          <p className="sub">Over fifty handmade products. Four Himalayan botanicals. One drop of love.</p>
          <div><a className="btn btn-accent btn-lg" href={`${SHOP}/collections/all`}>Shop the collection</a></div>
        </Reveal>
      </div>
    </section>
  );
}
