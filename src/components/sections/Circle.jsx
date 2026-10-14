import { Reveal } from '../../lib/motion.jsx';
import { SHOP } from '../../data/links.js';

export default function Circle() {
  return (
    <section className="circle" id="circle">
      <Reveal className="wrap circle-grid" stagger y={30}>
        <div>
          <h2 className="h-lg">Join the Agapi Circle</h2>
          <p>Be the first to hear about new releases, seasonal blends and offers rooted in Himalayan wellness.</p>
        </div>
        {/* Shopify blocks cross-site newsletter posts, so sign up happens on the store's own form */}
        <div className="circle-cta">
          <a className="btn btn-accent btn-lg" href={`${SHOP}/#shopify-section-template--25818209059114__newsletter_AmUDNw`}>Join the Circle</a>
          <p className="form-note">Takes you to the sign up on agapisikkim.com.</p>
        </div>
      </Reveal>
    </section>
  );
}
