'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart, Layers, MapPin, Menu, Search, ShieldCheck, ShoppingBag, Store, User, X,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Header({ view, setView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationLabel, setLocationLabel] = useState('Detecting location…');
  const { cartCount, openCart } = useCart();
  const router = useRouter();
  const go = (v) => { setView?.(v); setMenuOpen(false); };

  useEffect(() => {
    if (!navigator?.geolocation) {
      setLocationLabel('Set your location');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en', 'User-Agent': 'ApnaFashionMart/1.0' } }
          );
          const { address = {} } = await res.json();
          const area = address.suburb || address.neighbourhood || address.village || address.town || '';
          const city = address.city || address.town || address.county || '';
          const pincode = address.postcode || '';
          const parts = [area, city].filter(Boolean).join(', ');
          setLocationLabel((parts + (pincode ? ' ' + pincode : '')).trim() || 'Location detected');
        } catch {
          setLocationLabel('Set your location');
        }
      },
      () => setLocationLabel('Set your location'),
      { timeout: 8000 }
    );
  }, []);
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push('/categories?q=' + encodeURIComponent(searchQuery.trim()));
      setSearchQuery('');
    }
  };

  return (
    <header className="afm-header">
      <div className="afm-utility">
        <div className="inner">
          <span className="item deliver">
            <span className="ic"><MapPin size={11}/></span>
            Deliver to <strong>{locationLabel}</strong>
          </span>
          <span className="item">English</span>
          <div className="right">
            <Link href="/account" onClick={() => setView?.('account')}>Track order</Link>
            <Link href="/legal/privacy">Help center</Link>
            <Link href="/account" onClick={() => setView?.('account')}>My orders</Link>
            <Link href="/become-a-seller">Become a partner</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="bar">
          <Link className="afm-logo" href="/" onClick={() => setView?.('home')}>
            <img src="/afm-logo.webp" alt="Apna Fashion Mart" style={{ height: 52, width: 'auto', display: 'block' }} />
            <div className="text">
              <span className="top">Apna Fashion</span>
              <span className="sub">MART</span>
            </div>
          </Link>

          <div className="afm-search">
            <Search size={18} />
            <input
              placeholder="Search trending styles, boutiques, neighborhoods…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <nav className="afm-nav">
            <Link className={view === 'home' ? 'active' : ''} href="/" onClick={() => setView?.('home')}>Home</Link>
            <Link className={view === 'nearby' ? 'active' : ''} href="/nearby-shops" onClick={() => setView?.('nearby')}>Nearby Shops</Link>
            <Link className={view === 'categories' ? 'active' : ''} href="/categories" onClick={() => setView?.('categories')}>Categories</Link>
            <a href="#download" onClick={(e) => { e.preventDefault(); const el = document.querySelector('.app-band'); if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' }); }}>Get the app</a>
            <Link className="afm-icon-btn" href="/wishlist" aria-label="Wishlist" onClick={() => setView?.('wishlist')}><Heart size={20} /></Link>
            <button className="afm-icon-btn" aria-label="Bag" onClick={openCart}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="afm-cart-count">{cartCount}</span>}
            </button>
          </nav>

          <div className="afm-account">
            <Link href="/login" className="afm-btn afm-btn-ghost">Customer Login</Link>
            <Link href="/shop-login" className="afm-btn afm-btn-primary">Shop Owner Login</Link>
          </div>

          <button className="afm-mobile-toggle" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22}/>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`afm-mobile-menu ${menuOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}>
        <div className="panel">
          <div className="head">
            <h3>Menu</h3>
            <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Close"><X size={18}/></button>
          </div>
          <Link className={`item ${view === 'home' ? 'on' : ''}`} href="/" onClick={() => go('home')}><Search size={16}/> Home</Link>
          <Link className={`item ${view === 'nearby' ? 'on' : ''}`} href="/nearby-shops" onClick={() => go('nearby')}><MapPin size={16}/> Nearby Shops</Link>
          <Link className={`item ${view === 'categories' ? 'on' : ''}`} href="/categories" onClick={() => go('categories')}><Layers size={16}/> Categories</Link>
          <Link className={`item ${view === 'wishlist' ? 'on' : ''}`} href="/wishlist" onClick={() => go('wishlist')}><Heart size={16}/> Wishlist</Link>
          <button className={`item ${view === 'cart' ? 'on' : ''}`} onClick={() => { openCart(); setMenuOpen(false); }}>
            <ShoppingBag size={16}/> Your bag
            {cartCount > 0 && <span style={{ marginLeft: 'auto', background: 'var(--magenta-600)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{cartCount}</span>}
          </button>
          <Link className={`item ${view === 'account' ? 'on' : ''}`} href="/account" onClick={() => go('account')}><User size={16}/> Account &amp; orders</Link>
          <div className="sep"></div>
          <Link className="item" href="/legal/privacy"><ShieldCheck size={16}/> Help center</Link>
          <Link className="item" href="/legal/vendor"><Store size={16}/> Become a partner</Link>
          <Link className="item" href="/legal/privacy">Privacy</Link>
          <Link className="item" href="/legal/terms">Terms</Link>
          <div className="actions">
            <Link href="/login" className="afm-btn afm-btn-ghost">Customer Login</Link>
            <Link href="/shop-login" className="afm-btn afm-btn-primary">Shop Owner Login</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
