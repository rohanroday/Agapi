import { useEffect } from 'react';
import { gsap, ScrollTrigger, getLenis, resolveSplash } from '../../lib/motion.jsx';

const MIN_MS = 1700;  // long enough to read as an intro, short enough to never feel like a wait
const MAX_MS = 5000;  // slow connections: go anyway, the hero keeps loading behind the reveal

/* The splash markup lives in index.html so it paints before this bundle arrives.
   This component drives it: the drop fills with real load progress, falls into a ripple,
   and the panel lifts away on its mountain edge. */
export default function Splash() {
  useEffect(() => {
    const root = document.documentElement;
    const el = document.getElementById('splash');

    const release = () => {
      root.classList.remove('splash-lock');
      getLenis()?.start();
      ScrollTrigger.refresh();
    };
    if (!el || root.classList.contains('no-splash')) {
      el?.remove();
      release();
      resolveSplash();
      return;
    }

    const level = el.querySelector('.sp-level');
    const count = el.querySelector('.sp-count');
    const drop = el.querySelector('.sp-drop');
    const logo = el.querySelector('.sp-logo');
    const ripple = el.querySelector('.sp-ripple');
    const foot = el.querySelector('.sp-foot');
    const panel = el.querySelector('.sp-panel');

    /* real progress: fonts are a quarter, the hero's first frames (or its poster) the rest */
    let fonts = 0, hero = window.__agapiHero || 0;
    document.fonts?.ready.then(() => { fonts = 1; });
    const onHero = (e) => { hero = Math.max(hero, e.detail); };
    addEventListener('agapi:hero-progress', onHero);
    const target = () => 0.25 * fonts + 0.75 * hero;

    const t0 = performance.now();
    let shown = 0, lastTxt = '', exiting = false, raf;
    const tick = (now) => {
      const elapsed = now - t0;
      // ease toward the real number, but never faster than the minimum intro allows
      const cap = Math.min(1, elapsed / MIN_MS);
      const goal = elapsed > MAX_MS ? 1 : Math.min(target(), cap);
      shown += (goal - shown) * 0.09;
      if (goal === 1 && 1 - shown < 0.004) shown = 1;
      const txt = String(Math.round(shown * 100));
      if (txt !== lastTxt) { lastTxt = txt; count.textContent = txt; }
      level.setAttribute('y', (84 - 84 * shown).toFixed(2));
      if (shown === 1 && !exiting) { exiting = true; exit(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let tl;
    function exit() {
      // the drop falls to where the logo sat and lands in a ripple
      const d = drop.getBoundingClientRect(), l = logo.getBoundingClientRect(), c = ripple.offsetParent.getBoundingClientRect();
      const fall = (l.top + l.height / 2) - (d.top + d.height * 0.85);
      gsap.set(ripple, { left: d.left + d.width / 2 - c.left, top: l.top + l.height / 2 - c.top });
      const ripple2 = ripple.cloneNode();
      ripple.after(ripple2);

      tl = gsap.timeline({
        onComplete: () => {
          el.remove();
          try { sessionStorage.setItem('agapi-splash', '1'); } catch (e) { /* private mode */ }
        },
      });
      tl.to(foot, { autoAlpha: 0, y: 10, duration: 0.4, ease: 'power2.in' }, 0)
        .to(logo, { autoAlpha: 0, y: 14, scale: 0.96, duration: 0.45, ease: 'power2.in' }, 0)
        .to(drop, { y: fall, scaleY: 1.18, scaleX: 0.92, duration: 0.55, ease: 'power3.in' }, 0.12)
        .to(drop, { autoAlpha: 0, duration: 0.08 }, 0.64)
        .fromTo(ripple, { scale: 0.15, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.64)
        .fromTo(ripple2, { scale: 0.1, autoAlpha: 0.8 }, { scale: 2.2, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0.8)
        // the mountain lifts and the hero is underneath
        .to(panel, { y: () => -(panel.offsetHeight + el.querySelector('.sp-edge').getBoundingClientRect().height + 8), duration: 1.15, ease: 'expo.inOut' }, 0.82)
        .add(() => { release(); resolveSplash(); }, 1.15);
    }

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('agapi:hero-progress', onHero);
      tl?.kill();
    };
  }, []);

  return null;
}
