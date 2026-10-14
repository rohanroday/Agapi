import { SHOP } from '../../data/links.js';

const COLS = [
  ['Shop', [['Mugwort', '/collections/mugwort'], ['Guras', '/collections/guras'], ['Orange peel', '/collections/orange-peel'], ['Green tea', '/collections/green-tea'], ['Everything', '/collections/all']]],
  ['Agapi', [['About us', '/pages/about-us'], ['Agapi Circle blog', '/blogs/agapi-circle'], ['Contact', '/pages/contact']]],
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div>
          <img className="foot-logo" src="/assets/img/logo-light.png" alt="Agapi, from the mountains" width="480" height="228" loading="lazy" />
          <p>Handmade, vegan skincare from Sikkim.</p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <p className="kicker light">{title}</p>
            <ul>{links.map(([label, path]) => <li key={path}><a href={SHOP + path}>{label}</a></li>)}</ul>
          </div>
        ))}
        <div>
          <p className="kicker light">Follow</p>
          <ul>
            <li><a href="https://www.instagram.com/agapisikkim/" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="https://www.facebook.com/profile.php?id=100094827503545" target="_blank" rel="noopener">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot-base"><span>© 2026 Agapi Sikkim</span><span>From the mountains, with love.</span></div>
    </footer>
  );
}
