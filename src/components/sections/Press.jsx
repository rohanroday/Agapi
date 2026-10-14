import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, Reveal, clamp, onSmoothScroll, useReducedMotion } from '../../lib/motion.jsx';

const PRESS = [
  ['new_indian_express', 'The New Indian Express'],
  ['better_india', 'The Better India'],
  ['yourstory', 'YourStory'],
  ['hub_news', 'Hub News'],
  ['impulse_ngo_network', 'Impulse NGO Network'],
];
const PARTNERS = [
  ['taj_guras', 'Taj Guras Kutir'],
  ['summit', 'Summit Hotels'],
  ['amani_pelling', 'Amani Pelling'],
  ['nettle_and_fern', 'Nettle and Fern'],
  ['agapi_farm', 'Agapi Farm'],
];

/* Logos come in every shape; size by area so a wide mark and a square mark weigh the same */
function Logo({ src, alt, base }) {
  const [h, setH] = useState(null);
  const fit = (img) => {
    const ar = img.naturalWidth / img.naturalHeight || 1;
    setH(Math.round(clamp(base / Math.sqrt(ar), 18, base * 1.15)));
  };
  return (
    <img src={src} alt={alt} loading="lazy" style={h ? { height: h } : undefined}
      ref={(img) => { if (img && img.complete && img.naturalWidth && h === null) fit(img); }}
      onLoad={(e) => fit(e.currentTarget)} />
  );
}

export default function Press() {
  const marquee = useRef(null);
  const track = useRef(null);
  const rm = useReducedMotion();

  // endless strip that speeds up with your scroll and eases back when you stop
  useEffect(() => {
    if (rm) return;
    const loop = gsap.to(track.current, { xPercent: -50, duration: 36, ease: 'none', repeat: -1 });
    const vis = ScrollTrigger.create({ trigger: marquee.current, start: 'top bottom', end: 'bottom top',
      onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });
    let ease;
    const onScroll = ({ velocity }) => {
      ease?.kill();
      loop.timeScale(clamp(1 + Math.abs(velocity) * 0.25, 1, 6) * Math.sign(velocity || 1));
      ease = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
    };
    const off = onSmoothScroll(onScroll);
    return () => { loop.kill(); vis.kill(); ease?.kill(); off(); };
  }, [rm]);

  return (
    <section className="press" aria-labelledby="press-h">
      <Reveal className="wrap press-head">
        <p className="kicker" id="press-h">Featured on</p>
      </Reveal>
      <div className="marquee" ref={marquee} aria-label={`Featured in ${PRESS.map((p) => p[1]).join(', ')}`}>
        <div className="marquee-track" ref={track} aria-hidden="true">
          {[...PRESS, ...PRESS].map(([f], i) => <Logo key={i} src={`/assets/img/press/${f}.png`} alt="" base={54} />)}
        </div>
      </div>
      <Reveal className="wrap partners">
        <p className="kicker">Find Agapi at</p>
        <ul>
          {PARTNERS.map(([f, name]) => <li key={f}><Logo src={`/assets/img/partners/${f}.png`} alt={name} base={64} /></li>)}
        </ul>
      </Reveal>
    </section>
  );
}
