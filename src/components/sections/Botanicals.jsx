import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, Reveal, SplitHeading, useReducedMotion } from '../../lib/motion.jsx';
import { catalog } from '../../data/catalog.js';
import { SHOP } from '../../data/links.js';
import ProductCard from '../ui/ProductCard.jsx';

const BOT = [
  { key: 'mugwort', name: 'Mugwort', local: 'Titepati, to us', link: '/collections/mugwort', cta: 'Shop all mugwort',
    img: '/assets/img/b-mugwort.webp', alt: 'Fresh mugwort leaves with morning dew on a mossy stone',
    desc: 'A traditional botanical valued for its calming and purifying qualities. Mugwort helps soothe irritation, balance the skin, and support a clearer, healthier complexion.' },
  { key: 'guras', name: 'Guras', local: 'Rhododendron, Sikkim’s state tree', link: '/collections/guras', cta: 'Shop all guras',
    img: '/assets/img/b-guras.webp', alt: 'Red guras rhododendron flowers in a misty forest at sunrise',
    desc: 'Powered by the vibrant guras flower, known for its antioxidant and soothing properties. It helps calm stressed skin and brings out a natural glow.' },
  { key: 'orange', name: 'Orange peel', local: 'From the orange orchards of Sikkim', link: '/collections/orange-peel', cta: 'Shop all orange peel',
    img: '/assets/img/b-orange.webp', alt: 'Dried orange peel and mandarin segments',
    desc: 'Brightening and refreshing, orange peel is packed with natural vitamin C and gentle exfoliating properties. It helps even skin tone and restore a fresh, healthy glow.' },
  { key: 'greentea', name: 'Green tea', local: 'Grown on Himalayan slopes', link: '/collections/green-tea', cta: 'Shop all green tea',
    img: '/assets/img/b-greentea.webp', alt: 'Green tea bushes on a hillside',
    desc: 'Rich in antioxidants, green tea helps protect against everyday stress while refreshing the skin. A timeless ingredient for clarity and balance.' },
];

export default function Botanicals() {
  const rm = useReducedMotion();
  const [active, setActive] = useState('mugwort');
  const [shown, setShown] = useState('mugwort');
  const tabRefs = useRef([]);
  const copyRef = useRef(null);
  const railRef = useRef(null);
  const photoRef = useRef(null);
  const first = useRef(true);

  // label copy: fade out, swap the words, rise back in
  useEffect(() => {
    if (active === shown) return;
    if (rm) { setShown(active); return; }
    const tw = gsap.to(copyRef.current.children, {
      autoAlpha: 0, y: -12, duration: 0.28, ease: 'power2.in', stagger: 0.03,
      onComplete: () => setShown(active),
    });
    return () => tw.kill();
  }, [active, shown, rm]);

  useLayoutEffect(() => {
    if (first.current || rm) return;
    gsap.fromTo(copyRef.current.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06 });
  }, [shown, rm]);

  // photo zooms out of the crossfade; product cards cascade in
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (rm) return;
    railRef.current.scrollTo({ left: 0 });
    const on = photoRef.current.querySelector('img.on');
    gsap.fromTo(on, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
    gsap.fromTo(railRef.current.children, { autoAlpha: 0, y: 30, rotate: 1.5 },
      { autoAlpha: 1, y: 0, rotate: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, clearProps: 'transform' });
  }, [active, rm]);

  const select = (key, focus) => {
    setActive(key);
    if (focus) tabRefs.current[BOT.findIndex((b) => b.key === key)]?.focus();
  };
  const onKey = (e, i) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    select(BOT[(i + d + BOT.length) % BOT.length].key, true);
  };

  const B = BOT.find((b) => b.key === shown);

  return (
    <section className="botanicals" id="botanicals">
      <div className="wrap">
        <div className="bot-head">
          <Reveal><p className="kicker">Ingredients that matter</p></Reveal>
          <SplitHeading className="h-xl">Four plants from the hills of Sikkim.</SplitHeading>
          <Reveal><p className="lede">Pick one to see what it does, and where it lives in our range.</p></Reveal>
        </div>

        <Reveal className="bot-tabs" stagger y={20} role="tablist" aria-label="Botanicals">
          {BOT.map((b, i) => (
            <button key={b.key} ref={(el) => (tabRefs.current[i] = el)} role="tab" id={`t-${b.key}`}
              aria-controls="bot-panel" aria-selected={active === b.key} tabIndex={active === b.key ? 0 : -1}
              style={{ '--c': `var(--${b.key})` }} onClick={() => select(b.key)} onKeyDown={(e) => onKey(e, i)}>
              <span className="dot" />{b.name}
            </button>
          ))}
        </Reveal>

        <Reveal className="bot-stage" y={60} id="bot-panel" role="tabpanel" aria-labelledby={`t-${active}`} aria-live="polite">
          <div className="bot-photo" ref={photoRef}>
            {BOT.map((b, i) => (
              <img key={b.key} className={active === b.key ? 'on' : ''} src={b.img} alt={b.alt} loading={i ? 'lazy' : undefined} width="1600" height="1200" />
            ))}
          </div>
          <div className="bot-label">
            <div className="label-bg" aria-hidden="true">
              {BOT.map((b) => <i key={b.key} className={active === b.key ? 'on' : ''} style={{ background: `var(--${b.key})` }} />)}
            </div>
            <div className="label-copy" ref={copyRef}>
              <p className="kicker">{B.local}</p>
              <h3 className="h-lg">{B.name}</h3>
              <p>{B.desc}</p>
              <a className="btn btn-light" href={SHOP + B.link}>{B.cta}</a>
            </div>
          </div>
        </Reveal>

        <div className="rail bot-rail" ref={railRef} aria-label="Products">
          {(catalog.groups[active] || []).map((h) => <ProductCard key={active + h} handle={h} />)}
        </div>
      </div>
    </section>
  );
}
