import { useRef } from 'react';
import { Reveal, SplitHeading, useParallax } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

export default function Visit() {
  const img = useRef(null);
  useParallax(img, 8);
  return (
    <section className="visit" id="visit">
      <div className="wrap visit-grid">
        <Reveal as="figure" className="visit-photo" y={70}>
          <img ref={img} src="/assets/img/store.webp" alt="Inside the Agapi store in Gangtok, wooden shelves and a painted mountain wall" loading="lazy" width="1800" height="1350" />
        </Reveal>
        <div className="visit-copy">
          <Reveal><p className="kicker">Visit us</p></Reveal>
          <SplitHeading className="h-xl">Our first store is open in Gangtok.</SplitHeading>
          <Reveal stagger y={24}>
            <p>Come in, smell the oils, try the balms. You can also refill your favourite products here and at selected refill storefronts. More stores are on the way.</p>
            <div className="row">
              <a className="btn btn-dark" href="https://www.google.com/maps/search/Agapi+Sikkim+Gangtok" target="_blank" rel="noopener">Get directions</a>
              <a className="btn btn-ghost-dark" href={`${SHOP}/pages/contact`}>Contact us</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
