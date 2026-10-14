import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

/* Phones only: a thumb-reach shop bar that appears after the hero and steps aside at the final CTA */
export default function ShopBar() {
  const [afterHero, setAfterHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const a = ScrollTrigger.create({ trigger: '.hero', start: 'bottom 60%', onToggle: (s) => setAfterHero(s.isActive || s.progress === 1), end: 'max' });
    const b = ScrollTrigger.create({ trigger: '.final', start: 'top 85%', end: 'max', onToggle: (s) => setAtEnd(s.isActive) });
    return () => { a.kill(); b.kill(); };
  }, []);

  const show = afterHero && !atEnd;
  return (
    <div className={`shopbar${show ? ' show' : ''}`} aria-hidden={!show}>
      <a className="shopbar-main" href={`${SHOP}/collections/all`} tabIndex={show ? 0 : -1}>
        <span>Shop the collection</span><i aria-hidden="true">→</i>
      </a>
      <a className="shopbar-cart" href={`${SHOP}/cart`} aria-label="Your cart" tabIndex={show ? 0 : -1}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
      </a>
    </div>
  );
}
