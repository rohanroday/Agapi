import { useEffect, useRef } from 'react';
import { gsap, Reveal, SplitHeading, useReducedMotion } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

const fmt = (n, comma) => (comma ? Math.round(n).toLocaleString('en-IN') : String(Math.round(n)));

function Counter({ to, comma }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (rm) { el.textContent = fmt(to, comma); return; }
    const o = { v: 0 };
    el.textContent = '0';
    const tw = gsap.to(o, {
      v: to, duration: 2.2, ease: 'power3.out',
      onUpdate: () => { const s = fmt(o.v, comma); if (el.textContent !== s) el.textContent = s; },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    return () => tw.kill();
  }, [to, comma, rm]);
  return <span className="count" ref={ref}>{fmt(to, comma)}</span>;
}

export default function Artisans() {
  const section = useRef(null);
  const video = useRef(null);
  const rm = useReducedMotion();

  useEffect(() => {
    const v = video.current;
    if (rm) { v.pause(); return; }
    // the orchard film loads only when near, plays only while visible, and drifts slower than the page
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!v.src) v.src = '/assets/video/artisans.mp4';
        v.play()?.catch(() => {});
      } else v.pause();
    }, { rootMargin: '200px 0px' });
    io.observe(v);
    const ctx = gsap.context(() => {
      gsap.fromTo(v, { yPercent: -10, scale: 1.18 }, {
        yPercent: 10, scale: 1.18, ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    const onHide = () => { if (document.hidden) v.pause(); };
    document.addEventListener('visibilitychange', onHide);
    return () => { io.disconnect(); ctx.revert(); document.removeEventListener('visibilitychange', onHide); };
  }, [rm]);

  return (
    <section className="artisans" id="artisans" ref={section}>
      <div className="art-media" aria-hidden="true">
        <video ref={video} muted loop playsInline preload="none" poster="/assets/img/artisans-poster.jpg" tabIndex={-1} />
        <div className="art-shade" />
      </div>
      <div className="wrap art-grid">
        <div className="art-copy">
          <Reveal><p className="kicker light">Our artisan family</p></Reveal>
          <SplitHeading className="h-xl">Made by the women <em>of our hills.</em></SplitHeading>
          <Reveal stagger y={24}>
            <blockquote>
              <p>“Agapi was born out of a responsibility and duty to give back.”</p>
              <footer>Rinzing Choden Bhutia, founder</footer>
            </blockquote>
            <div><a className="btn btn-light" href={`${SHOP}/pages/about-us`}>Read our story</a></div>
          </Reveal>
        </div>
        <Reveal className="stats" stagger y={50}>
          <div className="stat big"><b><Counter to={70} />%</b><span>of our artisans have doubled their income in the last 2+ years.</span></div>
          <div className="stat"><b><Counter to={300} />+</b><span>women beneficiaries</span></div>
          <div className="stat"><b><Counter to={1500} comma />+</b><span>lives touched since 2019</span></div>
        </Reveal>
      </div>
    </section>
  );
}
