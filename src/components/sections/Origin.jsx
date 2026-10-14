import { useEffect, useRef } from 'react';
import { gsap, Reveal, SplitHeading, useParallax, useReducedMotion } from '../../lib/motion.jsx';

function PeakFrame({ className, src, alt, amount }) {
  const img = useRef(null);
  useParallax(img, amount);
  return (
    <figure className={`peak-frame ${className}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" width="1200" height="1800" />
    </figure>
  );
}

export default function Origin() {
  const section = useRef(null);
  const ridge = useRef(null);
  const rm = useReducedMotion();

  // the ridge line draws itself as the section arrives
  useEffect(() => {
    const path = ridge.current;
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    if (rm) { path.style.strokeDashoffset = 0; return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(path, { strokeDashoffset: len }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top 95%', end: 'top 15%', scrub: 0.8 },
      });
    });
    return () => ctx.revert();
  }, [rm]);

  return (
    <section className="origin" id="origin" ref={section}>
      <svg className="ridge" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
        <path ref={ridge} d="M0 190 L90 172 L150 182 L230 140 L290 152 L360 104 L410 122 L470 66 L520 92 L560 40 L600 18 L640 46 L690 30 L740 78 L800 64 L860 112 L930 98 L1000 140 L1070 128 L1130 160 L1200 150" />
      </svg>
      <div className="wrap origin-grid">
        <div className="origin-copy">
          <Reveal><p className="kicker">Origin</p></Reveal>
          <SplitHeading className="h-xl">Sikkimese roots, <em>global dreams.</em></SplitHeading>
          <Reveal stagger y={28}>
            <p className="lede">Agapi was born in founder Rinzing Choden Bhutia’s own backyard. Her cultural and tribal roots shape everything we make.</p>
            <p>Agapi is Greek for love. Since 2019 we have made every bar, balm and oil by hand with plants that grow on our hills. Vegan, cruelty free, and made to travel from Sikkim to anyone who wants clean, natural care.</p>
            <dl className="facts">
              <div><dt>Made in</dt><dd>Sikkim, India</dd></div>
              <div><dt>Since</dt><dd>2019</dd></div>
              <div><dt>Always</dt><dd>Vegan · Cruelty free</dd></div>
            </dl>
          </Reveal>
        </div>
        <Reveal className="origin-media" y={70}>
          <PeakFrame className="f1" src="/assets/img/rock-oil.webp" alt="Agapi facial oil on a mountain rock with prayer flags behind" amount={-7} />
          <PeakFrame className="f2" src="/assets/img/rock-jar.webp" alt="Agapi cream jar resting on a stone among prayer flags" amount={9} />
        </Reveal>
      </div>
    </section>
  );
}
