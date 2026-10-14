import { catalog } from '../../data/catalog.js';
import { productUrl } from '../../data/links.js';

export default function ProductCard({ handle, className = '', style }) {
  const it = catalog.items[handle];
  if (!it) return null;
  return (
    <a className={`card ${className}`.trim()} href={productUrl(handle)} style={style}>
      <div className="card-img">
        <img src={it.a} alt={it.t} loading="lazy" width="800" height="1000" />
        {it.b && it.b !== it.a && <img src={it.b} alt="" loading="lazy" width="800" height="1000" />}
      </div>
      <div className="card-meta">
        <h4>{it.t}</h4>
        <span className="price">{it.f ? 'From ' : ''}Rs. {it.p.toLocaleString('en-IN')}</span>
      </div>
      <span className="card-shop">Shop now <i>→</i></span>
    </a>
  );
}
