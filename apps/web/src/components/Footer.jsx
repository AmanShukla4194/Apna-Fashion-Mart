'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const sv = variant === 'primary' ? 'default' : variant === 'ghost' ? 'outline' : variant === 'on-dark' ? 'secondary' : 'ghost';
  return <Button variant={sv} size={size} onClick={onClick} className={className}>{children}</Button>;
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
              <li><a href="category.html?c=women">Women</a></li>
              <li><a href="category.html?c=men">Men</a></li>
              <li><a href="category.html?c=kids">Kids</a></li>
              <li><a href="category.html?c=ethnic">Ethnic Wear</a></li>
              <li><a href="category.html?c=street">Streetwear</a></li>
              <li><a href="category.html?c=acc">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4>For Boutiques</h4>
            <ul>
              <li><a href="legal.html?doc=vendor">Open your storefront</a></li>
              <li><a href="legal.html?doc=vendor#verify">Verification process</a></li>
              <li><a href="legal.html?doc=vendor#commission">Commission &amp; payouts</a></li>
              <li><a href="legal.html?doc=vendor#standards">Listing standards</a></li>
              <li><a href="legal.html?doc=vendor">Vendor Agreement</a></li>
            </ul>
          </div>
          <div>
            <h4>Apna Fashion Mart</h4>
            <ul>
              <li><a href="https://www.latticeteams.com" target="_blank" rel="noreferrer">Our story · Lattice Teams</a></li>
              <li><a href="nearby.html">Cities we serve</a></li>
              <li><a href="legal.html?doc=privacy">Privacy</a></li>
              <li><a href="legal.html?doc=terms">Terms of Service</a></li>
              <li><a href="mailto:contact@latticeteams.com">Contact &amp; support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2023 – 2026 Lattice Teams. All rights reserved. · Apna Fashion Mart is a Lattice Teams product</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <span>Built for clients worldwide · <a href="https://www.latticeteams.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.65)' }}>latticeteams.com</a></span>
            <a href="legal.html?doc=privacy">Privacy</a>
            <a href="legal.html?doc=terms">Terms</a>
            <a href="legal.html?doc=vendor">Vendor Agreement</a>
          </span>
        </div>
      </div>
    </footer>
  );
}



export default Footer;
