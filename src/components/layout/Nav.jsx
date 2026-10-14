import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, getLenis, useReducedMotion } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

const LINKS = [
  ['#botanicals', 'Botanicals'],
  ['#bestsellers', 'Bestsellers'],
  ['#origin', 'Our story'],
  ['#artisans', 'Artisans'],
  ['#visit', 'Visit'],
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const rm = useReducedMotion();

  // turns solid once the hero is behind us
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '.hero', start: 'bottom 90px',
      onEnter: () => setSolid(true), onLeaveBack: () => setSolid(false),
    });
    return () => st.kill();
  }, []);

  // full-screen mobile menu; scroll is held while it is open
  useEffect(() => {
    const el = menu.current;
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      if (!rm) {
        gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out' });
        gsap.fromTo(el.querySelectorAll('.mm-item'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.12 });
      }
      el.querySelector('a')?.focus();
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open, rm]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    const lenis = getLenis();
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(href, { offset: -72, duration: 1.4 });
      else document.querySelector(href)?.scrollIntoView();
    });
  };

  return (
    <>
      <header className={`nav${solid ? ' solid' : ''}${open ? ' menu-open' : ''}`}>
        <a className="brand" href="#top" aria-label="Agapi, back to top" onClick={(e) => go(e, '#top')}>
          <img className="logo logo-light" src="/assets/img/logo-light.png" alt="" width="480" height="228" />
          <img className="logo logo-dark" src="/assets/img/logo-dark.png" alt="" width="480" height="228" />
        </a>
        <nav aria-label="Main">
          <ul className="nav-links">
            {LINKS.map(([href, label]) => <li key={href}><a href={href} onClick={(e) => go(e, href)}>{label}</a></li>)}
          </ul>
        </nav>
        <div className="nav-end">
          <a className="cart" href={`${SHOP}/cart`} aria-label="Your cart on agapisikkim.com">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
          </a>
          <a className="btn btn-accent btn-sm nav-shop" href={`${SHOP}/collections/all`}>Shop</a>
          <button className="burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${open ? ' open' : ''}`} id="mobile-menu" ref={menu} hidden={!open}>
        <ul>
          {LINKS.map(([href, label], i) => (
            <li key={href}><span className="mm-mask"><a className="mm-item" href={href} onClick={(e) => go(e, href)}>
              <small>0{i + 1}</small>{label}
            </a></span></li>
          ))}
        </ul>
        <div className="mm-foot">
          <span className="mm-mask"><a className="btn btn-accent btn-lg mm-item" href={`${SHOP}/collections/all`}>Shop the collection</a></span>
          <span className="mm-mask"><span className="mm-item mm-social">
            <a href="https://www.instagram.com/agapisikkim/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=100094827503545" target="_blank" rel="noopener">Facebook</a>
          </span></span>
        </div>
      </div>
    </>
  );
}
