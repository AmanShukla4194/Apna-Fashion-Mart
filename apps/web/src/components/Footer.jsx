'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}



function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src="/afm-logo.webp" alt="Apna Fashion Mart" style={{ width: 200, height: 'auto', filter: 'invert(0.92) hue-rotate(180deg)', display: 'block', marginBottom: 18 }} />
            <p className="tagline"><em>Your</em> neighborhood, in vogue.</p>
            <p style={{ marginTop: 18, color: 'rgba(255,255,255,0.6)', fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
              Premium hyperlocal fashion marketplace connecting verified local boutiques with nearby customers across India.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link href="/categories?c=women">Women</Link></li>
              <li><Link href="/categories?c=men">Men</Link></li>
              <li><Link href="/categories?c=kids">Kids</Link></li>
              <li><Link href="/categories?c=ethnic">Ethnic Wear</Link></li>
              <li><Link href="/categories?c=street">Streetwear</Link></li>
              <li><Link href="/categories?c=acc">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h4>For Boutiques</h4>
            <ul>
              <li><Link href="/legal/vendor">Open your storefront</Link></li>
              <li><Link href="/legal/vendor#verify">Verification process</Link></li>
              <li><Link href="/legal/vendor#commission">Commission &amp; payouts</Link></li>
              <li><Link href="/legal/vendor#standards">Listing standards</Link></li>
              <li><Link href="/legal/vendor">Vendor Agreement</Link></li>
            </ul>
          </div>
          <div>
            <h4>Apna Fashion Mart</h4>
            <ul>
              <li><a href="https://www.latticeteams.com" target="_blank" rel="noreferrer">Our story · Lattice Teams</a></li>
              <li><Link href="/nearby-shops">Cities we serve</Link></li>
              <li><Link href="/legal/privacy">Privacy</Link></li>
              <li><Link href="/legal/terms">Terms of Service</Link></li>
              <li><a href="mailto:contact@latticeteams.com">Contact &amp; support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2023 – 2026 Lattice Teams. All rights reserved. · Apna Fashion Mart is a Lattice Teams product</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <span>Built for clients worldwide · <a href="https://www.latticeteams.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.65)' }}>latticeteams.com</a></span>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/vendor">Vendor Agreement</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}



export default Footer;
