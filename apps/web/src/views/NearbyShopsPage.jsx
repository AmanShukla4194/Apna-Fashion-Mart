'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

function shopUrl(shop) {
  const p = new URLSearchParams({
    n:   shop.name,
    a:   shop.address || '',
    lat: String(shop.lat),
    lng: String(shop.lng),
    ...(shop.hours   && { h: shop.hours }),
    ...(shop.phone   && { p: shop.phone }),
    ...(shop.shopType && { t: shop.shopType }),
  });
  return `/shop/${shop.id}?${p}`;
}
import {
  ArrowRight, Check, ChevronDown, Filter, MapPin, RefreshCcw,
  Search, ShieldCheck, ShoppingBag, Star, Sun, Truck, User, Wallet, X, Layers,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const NearbyMap = dynamic(() => import('@/components/NearbyMap'), { ssr: false });

// ─── constants ───────────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [
  { label: 'Within 1 km',  value: 1 },
  { label: 'Within 3 km',  value: 3 },
  { label: 'Within 5 km',  value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
];

const SORT_OPTIONS = [
  { label: 'Nearest',         value: 'nearest' },
  { label: 'Highest Rated',   value: 'rating' },
  { label: 'Most Reviewed',   value: 'reviews' },
];

const CATEGORY_FILTERS = [
  { label: "Women's Fashion", value: 'women' },
  { label: "Men's Fashion",   value: 'men' },
  { label: "Kids' Fashion",   value: 'kids' },
  { label: 'Boutique',        value: 'boutique' },
  { label: 'Ethnic Wear',     value: 'ethnic' },
  { label: 'Western Wear',    value: 'western' },
  { label: 'Footwear',        value: 'footwear' },
  { label: 'Accessories',     value: 'accessories' },
];

const RATING_FILTERS = [
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4.0 },
  { label: '3.5+', value: 3.5 },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function sortShops(shops, sortBy) {
  return [...shops].sort((a, b) => {
    if (sortBy === 'rating')  return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortBy === 'reviews') return (b.reviews ?? 0) - (a.reviews ?? 0);
    return (a.distanceKm ?? 999) - (b.distanceKm ?? 999); // nearest
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

function ShopCard({ shop, selected, onClick }) {
  const router = useRouter();
  return (
    <article
      className={`nearby-row-rich ${selected ? 'sel' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="thumb"
        style={{
          backgroundImage: shop.photoUrl ? `url(${shop.photoUrl})` : 'none',
          background: shop.photoUrl ? undefined : 'linear-gradient(135deg,#001F3F,#FF1493)',
        }}
      >
        {!shop.photoUrl && (
          <span style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#fff', fontSize:28 }}>🛍</span>
        )}
      </div>
      <div className="info">
        <div className="head">
          <span className="name">{shop.name}</span>
        </div>
        <div className="desc" style={{ fontSize: 12, color: 'var(--fg-muted)', marginBottom: 4 }}>
          {shop.address}
        </div>
        <div className="meta">
          <span><MapPin size={11}/> {shop.distanceKm} km away</span>
          {shop.isOpen === true  && <span className="pill open">● Open now</span>}
          {shop.isOpen === false && <span className="pill" style={{ background:'var(--error-100)', color:'var(--error-600)' }}>● Closed</span>}
        </div>
        {shop.hours && (
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{shop.hours}</div>
        )}
      </div>
      <div className="actions">
        <div>
          {shop.rating != null && (
            <>
              <div className="rating"><span className="star">★</span> {shop.rating.toFixed(1)}</div>
              <div className="review-ct">{shop.reviews.toLocaleString()} reviews</div>
            </>
          )}
        </div>
        <button className="visit" onClick={(e) => { e.stopPropagation(); router.push(shopUrl(shop)); }}>
          View Shop →
        </button>
      </div>
    </article>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const current = SORT_OPTIONS.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span className="nearby-chip" onClick={() => setOpen(o => !o)} style={{ gap: 6, userSelect:'none' }}>
        Sort · {current?.label} <ChevronDown size={12}/>
      </span>
      {open && (
        <div style={{
          position:'absolute', right:0, top:'calc(100% + 6px)',
          background:'#fff', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.14)',
          border:'1px solid var(--border)', zIndex:200, minWidth:180, overflow:'hidden',
        }}>
          {SORT_OPTIONS.map(opt => (
            <div key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding:'10px 16px', fontSize:13, cursor:'pointer', fontFamily:'Poppins',
                background: value === opt.value ? 'var(--magenta-50,#fff0f8)' : '#fff',
                color: value === opt.value ? 'var(--magenta-600)' : 'var(--navy-800)',
                fontWeight: value === opt.value ? 600 : 400,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {value === opt.value && <Check size={12} style={{ marginRight:6, display:'inline' }}/>}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MoreFiltersPanel({ minRating, setMinRating, category, setCategory, onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)',
      display:'flex', alignItems:'flex-start', justifyContent:'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: 340, maxWidth:'92vw', height:'100vh', overflowY:'auto',
        background:'#fff', boxShadow:'-8px 0 40px rgba(0,0,0,0.16)',
        padding:'32px 24px',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h3 style={{ font:'700 20px Playfair Display', color:'var(--navy-800)', margin:0 }}>More Filters</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-muted)' }}><X size={20}/></button>
        </div>

        <div style={{ marginBottom:24 }}>
          <p style={{ font:'600 13px Poppins', color:'var(--navy-800)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Category</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            <span
              className={`nearby-chip${!category ? ' on' : ''}`}
              onClick={() => setCategory('')}
            >All</span>
            {CATEGORY_FILTERS.map(f => (
              <span key={f.value}
                className={`nearby-chip${category === f.value ? ' on' : ''}`}
                onClick={() => setCategory(category === f.value ? '' : f.value)}
              >{f.label}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:24 }}>
          <p style={{ font:'600 13px Poppins', color:'var(--navy-800)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Minimum Rating</p>
          <div style={{ display:'flex', gap:8 }}>
            <span className={`nearby-chip${!minRating ? ' on' : ''}`} onClick={() => setMinRating(null)}>Any</span>
            {RATING_FILTERS.map(r => (
              <span key={r.value}
                className={`nearby-chip${minRating === r.value ? ' on' : ''}`}
                onClick={() => setMinRating(minRating === r.value ? null : r.value)}
              >
                <Star size={11}/> {r.label}
              </span>
            ))}
          </div>
        </div>

        <button
          className="afm-btn afm-btn-primary"
          style={{ width:'100%', marginTop:16 }}
          onClick={onClose}
        >
          Apply Filters
        </button>
        <button
          style={{ width:'100%', marginTop:10, background:'none', border:'none', font:'500 13px Poppins', color:'var(--fg-muted)', cursor:'pointer' }}
          onClick={() => { setCategory(''); setMinRating(null); }}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}

// ─── main view ───────────────────────────────────────────────────────────────

function NearbyView() {
  const [userLat, setUserLat]       = useState(null);
  const [userLng, setUserLng]       = useState(null);
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // filter state
  const [radius, setRadius]         = useState(5);
  const [openNow, setOpenNow]       = useState(false);
  const [sortBy, setSortBy]         = useState('nearest');
  const [category, setCategory]     = useState('');
  const [minRating, setMinRating]   = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // get user location once
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => { setUserLat(19.0596); setUserLng(72.8295); }, // Mumbai fallback
      { timeout: 8000 }
    );
  }, []);

  // fetch when location / radius / openNow changes
  const fetchShops = useCallback(async () => {
    if (!userLat || !userLng) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: userLat,
        lng: userLng,
        radius,
        openNow: openNow ? 'true' : 'false',
      });
      const res = await fetch(`/api/nearby-shops?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load shops');
      setShops(data.shops || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userLat, userLng, radius, openNow]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  // client-side filter + sort
  const displayShops = sortShops(
    shops.filter(s => {
      if (minRating && (s.rating ?? 0) < minRating) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.address.toLowerCase().includes(q)) return false;
      }
      return true;
    }),
    sortBy
  );

  const mapShops = displayShops.map(s => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    isVerified: false,
  }));

  const activeFilterCount = [openNow, !!category, !!minRating].filter(Boolean).length;

  return (
    <main>
      {/* HERO */}
      <section className="nearby-hero">
        <div className="container nearby-hero-inner">
          <div>
            <span className="eye">Hyperlocal · Fashion Boutiques Near You</span>
            <h1>Discover <em>boutiques</em> in your neighbourhood.</h1>
            <p>Browse independent fashion storefronts around you. Real-time results from Google Maps — clothing stores, boutiques, and fashion retailers sorted by distance.</p>
          </div>
          <div className="nearby-hero-stats">
            <div className="nearby-hero-stat">
              <div className="n"><em>{loading ? '…' : displayShops.length}</em></div>
              <div className="l">Shops found</div>
            </div>
            <div className="nearby-hero-stat">
              <div className="n"><em>{radius} km</em></div>
              <div className="l">Search radius</div>
            </div>
            <div className="nearby-hero-stat">
              <div className="n"><em>{displayShops.filter(s => s.isOpen).length}</em></div>
              <div className="l">Open now</div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="nearby-filter-bar">
        <div className="container inner">
          {/* Open Now */}
          <span
            className={`nearby-chip ${openNow ? 'on' : ''}`}
            onClick={() => setOpenNow(v => !v)}
          >
            <Sun size={12} className="ic"/> Open Now
          </span>

          <span className="sep"/>

          {/* Radius */}
          {RADIUS_OPTIONS.map(r => (
            <span
              key={r.value}
              className={`nearby-chip ${radius === r.value ? 'on' : ''}`}
              onClick={() => setRadius(r.value)}
            >
              {r.label}
            </span>
          ))}

          <div className="right">
            {/* More Filters */}
            <span
              className={`nearby-chip ${activeFilterCount > 0 ? 'on' : ''}`}
              onClick={() => setShowFilters(true)}
            >
              <Filter size={12} className="ic"/>
              More filters
              {activeFilterCount > 0 && (
                <span style={{
                  background:'var(--magenta-600)', color:'#fff',
                  borderRadius:99, width:16, height:16,
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:700, marginLeft:2,
                }}>{activeFilterCount}</span>
              )}
            </span>

            {/* Sort */}
            <SortDropdown value={sortBy} onChange={setSortBy}/>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 0 }}>
        <div className="afm-search" style={{ maxWidth: 480 }}>
          <Search size={16}/>
          <input
            placeholder="Search by shop name or area…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--fg-muted)' }}>
              <X size={14}/>
            </button>
          )}
        </div>
      </div>

      {/* SPLIT LIST + MAP */}
      <section className="nearby-rich-wrap">
        <div className="container">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20, marginTop:24 }}>
            <div>
              <h2 style={{ font:'600 28px Playfair Display', color:'var(--navy-800)', margin:0, letterSpacing:'-0.02em' }}>
                {loading ? 'Finding shops…' : (
                  <><em style={{ fontStyle:'italic', color:'var(--magenta-600)' }}>{displayShops.length}</em> fashion shops nearby</>
                )}
              </h2>
              <div style={{ font:'400 13px Poppins', color:'var(--fg-muted)', marginTop:4 }}>
                {loading ? 'Searching Google Maps…' : `Within ${radius} km · sorted by ${SORT_OPTIONS.find(o=>o.value===sortBy)?.label.toLowerCase()}`}
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div style={{
              background:'var(--error-50,#fff5f5)', border:'1px solid var(--error-200,#fecaca)',
              borderRadius:12, padding:'16px 20px', marginBottom:20,
              display:'flex', alignItems:'center', gap:12, font:'400 14px Poppins',
              color:'var(--error-700,#b91c1c)',
            }}>
              <span style={{ fontSize:20 }}>⚠️</span>
              <div>
                <strong>Could not load shops.</strong> {error}
                <button onClick={fetchShops} style={{ marginLeft:12, background:'none', border:'none', color:'var(--magenta-600)', cursor:'pointer', fontWeight:600, fontSize:13 }}>
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="nearby-rich-grid">
            {/* SHOP LIST */}
            <div className="nearby-rich-list">
              {loading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{
                    height:120, borderRadius:16, marginBottom:12,
                    background:'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                    backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite',
                  }}/>
                ))
              )}

              {!loading && displayShops.length === 0 && !error && (
                <div style={{ textAlign:'center', padding:'48px 24px', color:'var(--fg-muted)' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
                  <p style={{ font:'600 16px Poppins', color:'var(--navy-800)', margin:'0 0 6px' }}>No fashion shops found</p>
                  <p style={{ font:'400 13px Poppins', margin:'0 0 16px' }}>Try increasing the search radius or removing filters.</p>
                  <button className="afm-btn afm-btn-ghost" onClick={() => { setRadius(10); setOpenNow(false); setCategory(''); setMinRating(null); }}>
                    Reset filters
                  </button>
                </div>
              )}

              {!loading && displayShops.map(shop => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  selected={selectedId === shop.id}
                  onClick={() => setSelectedId(shop.id === selectedId ? null : shop.id)}
                />
              ))}
            </div>

            {/* MAP */}
            <div className="nearby-rich-map">
              <NearbyMap
                shops={mapShops}
                centerLat={userLat ?? 19.0596}
                centerLng={userLng ?? 72.8295}
                onShopClick={(id) => {
                  const shop = displayShops.find(s => s.id === id);
                  if (shop) router.push(shopUrl(shop));
                }}
              />
            </div>
          </div>

          {/* INFO PAIR */}
          <div className="nearby-grid-2">
            <div className="nearby-info-card">
              <h3>How <em>results</em> are sourced</h3>
              <p>Nearby shops are fetched in real time from Google Maps. Only clothing stores, boutiques, and fashion retailers are shown — restaurants, pharmacies, and unrelated businesses are excluded automatically.</p>
              <ul className="features">
                <li><span className="ic"><ShieldCheck size={14}/></span> Real-time Google Maps data</li>
                <li><span className="ic"><Check size={14}/></span> Fashion & apparel stores only</li>
                <li><span className="ic"><Truck size={14}/></span> Live open/closed status</li>
                <li><span className="ic"><RefreshCcw size={14}/></span> Updated every 5 minutes</li>
              </ul>
            </div>
            <div className="nearby-info-card">
              <h3>Run a boutique? <em>Join us.</em></h3>
              <p>We onboard 30+ boutiques every week across Mumbai, Bengaluru, Delhi and Jaipur. KYC + 10 product photos. Most shops are live within 48 hours.</p>
              <ul className="features">
                <li><span className="ic"><User size={14}/></span> 12,000+ customers active in Mumbai</li>
                <li><span className="ic"><ShoppingBag size={14}/></span> Avg vendor: ₹84k GMV/month</li>
                <li><span className="ic"><Wallet size={14}/></span> 8 – 12 % commission · weekly payouts</li>
                <li><span className="ic"><Layers size={14}/></span> Push offers + AR try-on for your pieces</li>
              </ul>
              <button className="afm-btn afm-btn-primary" style={{ marginTop: 18 }}>
                Apply to become our partner <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MORE FILTERS PANEL */}
      {showFilters && (
        <MoreFiltersPanel
          category={category}
          setCategory={setCategory}
          minRating={minRating}
          setMinRating={setMinRating}
          onClose={() => setShowFilters(false)}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}

// ─── page wrapper ─────────────────────────────────────────────────────────────

export default function NearbyShopsPage() {
  const router = useRouter();
  const nav = (v) => {
    const m = { home:'/', cart:'/cart', wishlist:'/wishlist', account:'/account', categories:'/categories' };
    router.push(m[v] ?? '/');
  };
  return (
    <>
      <Header setView={nav}/>
      <NearbyView/>
      <Footer/>
    </>
  );
}
