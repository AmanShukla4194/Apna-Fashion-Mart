'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Check, Filter, Layers, MapPin, RefreshCcw, Search, ShieldCheck, ShoppingBag, Sun, Truck, User, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const sv = variant === 'primary' ? 'default' : variant === 'ghost' ? 'outline' : variant === 'on-dark' ? 'secondary' : 'ghost';
  return <Button variant={sv} size={size} onClick={onClick} className={className}>{children}</Button>;
}




function NearbyView({ onShopSelect }) {
  const I = AfmIcons;
  const { boutiques, filters, radii } = AFM_DATA;
  const [sel, setSel] = useState(boutiques[0].id);
  const [activeFilters, setActiveFilters] = useState(new Set(['Verified only']));
  const [activeRadius, setActiveRadius] = useState('5 km');

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
              <div className="map-stage" style={{ width: '100%', height: '100%' }}>
                <div className="grid"></div>
                <div className="road" style={{ top: '22%', left: '8%', right: '5%', height: 5 }}></div>
                <div className="road" style={{ top: '54%', left: '15%', right: '10%', height: 4 }}></div>
                <div className="road" style={{ left: '40%', top: '5%', bottom: '12%', width: 4 }}></div>
                <div className="road" style={{ left: '68%', top: '8%', bottom: '5%', width: 3 }}></div>
                <div className="user-radius" style={{ left: 'calc(50% - 140px)', top: 'calc(50% - 140px)', width: 280, height: 280 }}></div>
                <div className="user-pin" style={{ left: 'calc(50% - 9px)', top: 'calc(50% - 9px)' }}></div>
                {boutiques.map(b => (
                  <div key={b.id} className={`map-pin ${b.verified ? 'gold' : ''}`} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
                    <svg width="36" height="48" viewBox="0 0 36 48" fill="none">
                      <path d="M18 1 C 9 1, 2 8, 2 18 C 2 30, 18 47, 18 47 C 18 47, 34 30, 34 18 C 34 8, 27 1, 18 1 Z" fill={b.verified ? '#1DA1F2' : '#001F3F'} stroke="rgba(255,255,255,0.16)"/>
                      <circle cx="18" cy="18" r="11" fill="#fff"/>
                      <text x="18" y="22.5" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="11" fontStyle="italic" fontWeight="700" fill="#FF1493">{b.initial.charAt(0)}</text>
                    </svg>
                  </div>
                ))}
                <div className="map-topbar">
                  <Search size={16}/>
                  <input className="search" placeholder="Search by area, boutique, category…"/>
                  <span className="chip on"><Filter size={11} style={{ marginRight: 4 }}/>3</span>
                </div>
              </div>
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
                <a href="#"> Download on the App Store</a>
                <a href="#">▶ Get it on Google Play</a>
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



export default NearbyView;
