'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Check, Filter, Layers, MapPin, RefreshCcw, Search, ShieldCheck, ShoppingBag, Sun, Truck, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
const NearbyMap = dynamic(() => import('@/components/NearbyMap'), { ssr: false });

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}




function NearbyView({ onShopSelect }) {
  const { boutiques, filters, radii } = AFM_DATA;
  const [sel, setSel] = useState(boutiques[0].id);
  const [activeFilters, setActiveFilters] = useState(new Set(['Verified only']));
  const [activeRadius, setActiveRadius] = useState('5 km');
  const [userLat, setUserLat] = useState(19.0596);
  const [userLng, setUserLng] = useState(72.8295);
  const [nearbyToast, setNearbyToast] = useState(null);
  const showNearbyToast = (msg) => { setNearbyToast(msg); setTimeout(() => setNearbyToast(null), 3000); };

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
        () => {}
      );
    }
  }, []);

  const mapShops = boutiques.map(b => ({ id: b.id, name: b.name, lat: b.lat, lng: b.lng, isVerified: b.verified }));

  const toggleFilter = (f) => {
    const s = new Set(activeFilters);
    s.has(f) ? s.delete(f) : s.add(f);
    setActiveFilters(s);
  };

  // expand boutiques into a richer rendered list (12 entries to make page feel substantial)
  const richList = [...boutiques, ...boutiques, ...boutiques].map((b, i) => ({
    ...b,
    id: `${b.id}-${i}`,
    desc: i % 3 === 0
      ? `Third-generation handloom atelier specialising in ${b.tags[0].toLowerCase()} and ${b.tags[1].toLowerCase()}. New-arrivals every Friday.`
      : i % 3 === 1
        ? `Independent label founded 2018 · ${b.tags[0]} + ${b.tags[2] || b.tags[1]} fits sized XS–XXL · same-day delivery in Bandra.`
        : `Brick-and-mortar storefront with try-on appointments · 32 g real-zari verified · ships pan-India in 48 hr.`,
    deliveryFlag: i % 2 === 0,
  })).slice(0, 9);

  return (
    <main>
      {nearbyToast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>
          {nearbyToast}
        </div>
      )}
      {/* HERO */}
      <section className="nearby-hero">
        <div className="container nearby-hero-inner">
          <div>
            <span className="eye">Hyperlocal · Mumbai · Bandra West</span>
            <h1>1,247 <em>boutiques</em> within 5 km of you.</h1>
            <p>Browse independent fashion storefronts around the corner. Same-day local delivery, in-store try-on appointments, AR previews, and a blue verified badge on shops we've audited on-site.</p>
          </div>
          <div className="nearby-hero-stats">
            <div className="nearby-hero-stat">
              <div className="n"><em>387</em></div>
              <div className="l">Verified in Mumbai</div>
            </div>
            <div className="nearby-hero-stat">
              <div className="n"><em>4.7</em><span style={{ color: '#C9A24A' }}> ★</span></div>
              <div className="l">Avg rating</div>
            </div>
            <div className="nearby-hero-stat">
              <div className="n"><em>26 hr</em></div>
              <div className="l">Avg delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="nearby-filter-bar">
        <div className="container inner">
          {filters.map(f => (
            <span key={f} className={`nearby-chip ${activeFilters.has(f) ? 'on' : ''}`} onClick={() => toggleFilter(f)}>
              <span className="ic">
                {f.includes('Verified') ? <ShieldCheck size={12}/> : f.includes('Open') ? <Sun size={12}/> : f.includes('delivery') ? <Truck size={12}/> : <MapPin size={12}/>}
              </span>
              {f}
            </span>
          ))}
          <span className="sep"></span>
          {radii.map(r => (
            <span key={r} className={`nearby-chip ${activeRadius === r ? 'on' : ''}`} onClick={() => setActiveRadius(r)}>{r}</span>
          ))}
          <div className="right">
            <span className="nearby-chip"><Filter size={12} className="ic"/> More filters</span>
            <span className="nearby-chip">Sort · Nearest ↑</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* FEATURED STRIP */}
        <h2 style={{ font: '600 28px Playfair Display', color: 'var(--navy-800)', marginTop: 40, marginBottom: 4, letterSpacing: '-0.02em' }}>
          Featured <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>this week</em>.
        </h2>
        <div style={{ font: '400 14px Poppins', color: 'var(--fg-muted)', marginBottom: 4 }}>Hand-picked by the Apna editorial team · refreshes every Friday.</div>

        <div className="nearby-featured-strip">
          {boutiques.map(b => (
            <article key={b.id} className={`nearby-featured-card ${b.verified ? 'gold' : ''}`}>
              <div className="cover" style={{ backgroundImage: `url(${b.img})` }}>
                <div className="pills">
                  <span className="pill"><MapPin size={10}/> {b.distance}</span>
                  <span className="pill" style={{ background: 'rgba(255,20,147,0.85)' }}>Featured</span>
                </div>
                {b.verified && <span className="vbadge"><Check size={14}/></span>}
              </div>
              <div className="body">
                <div className="name">{b.name}</div>
                <div className="meta"><MapPin size={11}/> {b.area} · <span style={{ color: 'var(--gold-500)' }}>★</span> {b.rating} · {b.reviews} reviews</div>
                <div className="tags">{b.tags.map(t => <span key={t} className="t">{t}</span>)}</div>
                <div className="quick">
                  <button className="btn cta">Visit boutique</button>
                  <button className="btn">Save</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* AI band */}
        <div className="nearby-ai-band">
          <div className="av">A</div>
          <div className="txt">
            <div className="label">Apna AI · for Priya</div>
            <div className="h">3 boutiques near you stock the silk colours you wishlisted.</div>
            <div className="s">Based on your last 12 product views · within 2.4 km of Bandra West.</div>
          </div>
          <button className="cta">Show me →</button>
        </div>
      </div>

      {/* RICH SPLIT LIST + MAP */}
      <section className="nearby-rich-wrap">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
            <div>
              <h2 style={{ font: '600 28px Playfair Display', color: 'var(--navy-800)', margin: 0, letterSpacing: '-0.02em' }}>All <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>{richList.length}</em> boutiques nearby</h2>
              <div style={{ font: '400 13px Poppins', color: 'var(--fg-muted)', marginTop: 4 }}>Sorted by distance · all locations open today</div>
            </div>
            <span className="nearby-chip" style={{ background: 'var(--magenta-100)', color: 'var(--magenta-700)', borderColor: 'transparent' }}>Map view</span>
          </div>

          <div className="nearby-rich-grid">
            <div className="nearby-rich-list">
              {richList.map(b => (
                <article key={b.id} className={`nearby-row-rich ${sel === b.id ? 'sel' : ''}`} onClick={() => setSel(b.id)}>
                  <div className="thumb" style={{ backgroundImage: `url(${b.img})` }}></div>
                  <div className="info">
                    <div className="head">
                      <span className="name">{b.name}</span>
                      {b.verified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10" fill="#1DA1F2" stroke="none"/><path d="M9 12l2 2 4-4" stroke="#fff"/>
                        </svg>
                      )}
                    </div>
                    <div className="desc">{b.desc}</div>
                    <div className="meta">
                      <span><MapPin size={11}/> {b.distance} · {b.area.split(',')[0]}</span>
                      <span className="pill open">● Open · {b.hours}</span>
                      {b.deliveryFlag && <span className="pill delivery">Free delivery</span>}
                    </div>
                    <div className="tags">
                      {b.tags.map(t => <span key={t} className="t">{t}</span>)}
                    </div>
                  </div>
                  <div className="actions">
                    <div>
                      <div className="rating"><span className="star">★</span> {b.rating}</div>
                      <div className="review-ct">{b.reviews} reviews</div>
                    </div>
                    <button className="visit">Visit →</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="nearby-rich-map">
              <NearbyMap
                shops={mapShops}
                centerLat={userLat}
                centerLng={userLng}
                onShopClick={(id) => setSel(id)}
              />
            </div>
          </div>

          {/* INFO PAIR */}
          <div className="nearby-grid-2">
            <div className="nearby-info-card">
              <h3>What does <em>verified</em> mean?</h3>
              <p>An Apna ops associate visits the shop in person, photographs the storefront, audits a sample of inventory, and confirms GST + bank documents. The blue badge can be revoked at any time.</p>
              <ul className="features">
                <li><span className="ic"><ShieldCheck size={14}/></span> On-site audit + photographs</li>
                <li><span className="ic"><Check size={14}/></span> GST + KYC + PAN verified</li>
                <li><span className="ic"><Truck size={14}/></span> Free same-day delivery (above ₹999)</li>
                <li><span className="ic"><RefreshCcw size={14}/></span> 7-day returns, no questions</li>
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

          {/* APP CTA */}
          <div className="nearby-app-cta">
            <div>
              <div className="label">Mobile-first features</div>
              <h3>Walk in with <em>Apna</em> in your pocket.</h3>
              <p>Get directions to verified shops, AR try-on in-store, and push offers when you're within 200 m of a boutique you wishlisted.</p>
              <div className="stores">
                <a href="#" onClick={(e) => { e.preventDefault(); showNearbyToast('iOS app coming soon!'); }}> Download on the App Store</a>
                <a href="#" onClick={(e) => { e.preventDefault(); showNearbyToast('Android app coming soon!'); }}>▶ Get it on Google Play</a>
              </div>
            </div>
            <div className="phones">
              <div className="phone" style={{ transform: 'rotate(-4deg)' }}><div className="scr" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&auto=format&fit=crop)' }}></div></div>
              <div className="phone" style={{ transform: 'rotate(4deg) translateY(20px)' }}><div className="scr" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=400&q=80&auto=format&fit=crop)' }}></div></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



export default function NearbyShopsPage() {
  const router = useRouter();
  const nav = (v) => { const m = { home:'/', cart:'/cart', wishlist:'/wishlist', account:'/account', categories:'/categories' }; router.push(m[v] ?? '/'); };
  return (
    <>
      <Header setView={nav} />
      <NearbyView onShopSelect={(id) => router.push('/shop/' + id)} />
      <Footer />
    </>
  );
}
