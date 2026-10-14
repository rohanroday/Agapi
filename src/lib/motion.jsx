import { Children, cloneElement, createElement, isValidElement, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // mobile URL bar show/hide must not re-layout triggers
export { gsap, ScrollTrigger };

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smoothstep = (p, e0, e1) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Seeded so "random" offsets are identical on every load.
export function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export const RM_QUERY = '(prefers-reduced-motion: reduce)';
export const PORTRAIT_QUERY = '(max-aspect-ratio: 1/1)';
// phones and tablets: the hero plays as a video instead of a long scroll scrub
export const PLAY_QUERY = '(max-width: 899px), (max-aspect-ratio: 1/1)';

function useMedia(query) {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const update = () => setMatch(m.matches);
    m.addEventListener('change', update);
    update();
    return () => m.removeEventListener('change', update);
  }, [query]);
  return match;
}
export const useReducedMotion = () => useMedia(RM_QUERY);
export const usePortrait = () => useMedia(PORTRAIT_QUERY);
export const usePlayMode = () => useMedia(PLAY_QUERY);

/* ---------- Splash: resolves when the intro lifts away (immediately when it is skipped) ---------- */
let resolveSplashDone;
export const splashDone = new Promise((r) => (resolveSplashDone = r));
export const resolveSplash = () => resolveSplashDone();
export const splashLocked = () => document.documentElement.classList.contains('splash-lock');

/* ---------- Lenis smooth scroll, driven by GSAP's ticker so both share one clock ---------- */
let lenis = null;
export const getLenis = () => lenis;
// children mount before App creates Lenis, so scroll listeners register here instead of on the instance
const scrollListeners = new Set();
export function onSmoothScroll(fn) {
  scrollListeners.add(fn);
  return () => scrollListeners.delete(fn);
}

export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false, // phones keep their native momentum, which already feels right
      anchors: { offset: -72 },
    });
    if (splashLocked()) lenis.stop(); // the splash releases it
    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      scrollListeners.forEach((fn) => fn(e));
    });
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
    };
  }, [enabled]);
}

/* ---------- Reveal: eased entrance once in view (optionally staggering its children) ---------- */
export function Reveal({ as = 'div', className = '', stagger = false, y = 40, children, ...rest }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (rm) { gsap.set(el, { clearProps: 'all' }); el.classList.add('in'); return; }
    const targets = stagger ? el.children : el;
    const ctx = gsap.context(() => {
      if (stagger) gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(targets, { autoAlpha: 0, y },
        { autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: stagger ? 0.09 : 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onComplete: () => el.classList.add('in') });
    }, el);
    return () => ctx.revert();
  }, [rm, stagger, y]);
  return createElement(as, { ref, className: `reveal ${className}`.trim(), ...rest }, children);
}

/* ---------- SplitHeading: words rise out of a mask, built in JSX so React owns the DOM ---------- */
function splitNode(node, key) {
  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((part, i) =>
      /^\s+$/.test(part) || part === ''
        ? part
        : <span className="wm" key={`${key}-${i}`}><span className="wi">{part}</span></span>);
  }
  if (isValidElement(node)) {
    return cloneElement(node, { key }, Children.map(node.props.children, (c, i) => splitNode(c, `${key}-${i}`)));
  }
  return node;
}

export function SplitHeading({ as = 'h2', className = '', children, delay = 0, ...rest }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (rm) { el.style.visibility = 'visible'; return; }
    const ctx = gsap.context(() => {
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(el.querySelectorAll('.wi'), { yPercent: 115, rotate: 4 },
        { yPercent: 0, rotate: 0, duration: 1.25, ease: 'expo.out', stagger: 0.06, delay,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    }, el);
    return () => ctx.revert();
  }, [rm, delay]);
  return createElement(as, { ref, className: `split ${className}`.trim(), ...rest },
    Children.map(children, (c, i) => splitNode(c, String(i))));
}

/* ---------- Parallax: an image drifts against the scroll, scrubbed ---------- */
export function useParallax(ref, amount = 10) {
  const rm = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || rm) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: -amount, scale: 1.12 }, {
        yPercent: amount, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    return () => ctx.revert();
  }, [ref, amount, rm]);
}
