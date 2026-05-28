'use client';
import { useEffect, useState } from 'react';

export default function StickyAppCta() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => { if (window.scrollY > 700) setShow(true); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  return (
    <div className={`sticky-app-cta${show && !dismissed ? ' show' : ''}`}>
      <div className="qr-mini"></div>
      <span className="label">
        <em>Apna</em> in your pocket — push offers, AR try-on
        <span className="sub">Scan the QR or pick your store</span>
      </span>
      <div className="stores">
        <a className="ios" href="#"> App Store</a>
        <a className="and" href="#">▶ Google Play</a>
      </div>
      <button className="close" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
    </div>
  );
}
