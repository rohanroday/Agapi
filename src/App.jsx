import { lazy, Suspense, useEffect, useState } from 'react';
import { ScrollTrigger, useReducedMotion, useSmoothScroll } from './lib/motion.jsx';
import Splash from './components/layout/Splash.jsx';
import Nav from './components/layout/Nav.jsx';
import Footer from './components/layout/Footer.jsx';
import ShopBar from './components/layout/ShopBar.jsx';
import Hero from './components/sections/Hero.jsx';
import Origin from './components/sections/Origin.jsx';
import Botanicals from './components/sections/Botanicals.jsx';
import Bestsellers from './components/sections/Bestsellers.jsx';
import Artisans from './components/sections/Artisans.jsx';
import Press from './components/sections/Press.jsx';
import Visit from './components/sections/Visit.jsx';
import FinalCta from './components/sections/FinalCta.jsx';
import Circle from './components/sections/Circle.jsx';

// Three.js is ~150KB; it loads after the page is up so it never delays the first paint
const PetalField = lazy(() => import('./components/effects/PetalField.jsx'));

export default function App() {
  const rm = useReducedMotion();
  const scrub = !rm; // phones scrub too now (portrait frame set); only reduced motion gets the still hero
  const [petals, setPetals] = useState(false);

  useSmoothScroll(!rm);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('scrub', scrub);
    root.classList.toggle('static', !scrub);
    ScrollTrigger.refresh();
  }, [scrub]);

  useEffect(() => {
    if (rm) { setPetals(false); return; }
    const start = () => (window.requestIdleCallback || setTimeout)(() => setPetals(true), { timeout: 2500 });
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
  }, [rm]);

  // hidden tabs pause CSS loops too
  useEffect(() => {
    const onVis = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <>
      <Splash />
      <a className="skip" href="#main">Skip to content</a>
      <div className="env" aria-hidden="true"><div className="env-glow" /></div>
      {petals && <Suspense fallback={null}><PetalField /></Suspense>}
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero scrub={scrub} />
        <Origin />
        <Botanicals />
        <Bestsellers />
        <Artisans />
        <Press />
        <Visit />
        <FinalCta />
        <Circle />
      </main>
      <Footer />
      <ShopBar />
    </>
  );
}
