'use client';

import React, { useState, Fragment, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Camera, Check, ChevronRight, MapPin, Maximize2, RefreshCcw, RotateCw, Search, ShieldCheck, ShoppingBag, Star, Sun, Truck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { trackView, getRecentlyViewed } from '@/lib/recentlyViewed';

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}




function PdTrustStrip() {
  return (
    <div className="pd-trust-strip">
      <div className="cell"><div className="ico"><Truck size={16}/></div><div><div className="t">Free same-day</div><div className="s">From verified shops</div></div></div>
      <div className="cell"><div className="ico"><RefreshCcw size={16}/></div><div><div className="t">7-day returns</div><div className="s">No-questions-asked</div></div></div>
      <div className="cell"><div className="ico"><ShieldCheck size={16}/></div><div><div className="t">Secure payments</div><div className="s">UPI · Card · COD</div></div></div>
      <div className="cell"><div className="ico"><Check size={16}/></div><div><div className="t">Verified by Apna</div><div className="s">On-site vendor audit</div></div></div>
    </div>
  );
}

function AiRecommendation({ onSeeTheLook }) {
  return (
    <div className="ai-row">
      <div className="av">A</div>
      <div className="text">
        <div className="label">Apna AI · for Priya</div>
        <div className="h">Pair this saree with a Banarasi clutch from Mira Weaves?</div>
        <div className="s">Customers who bought from Aanya Atelier also added Mira Weaves' embroidered clutches 4× more often than average. Same neighborhood — both arrive together.</div>
      </div>
      <button className="ai-cta" onClick={onSeeTheLook}>See the look →</button>
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }) {
  const [show, setShow] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!rating || !body.trim()) return;
    setSubmitted(true);
    setShow(false);
    onSubmitted?.({ rating, title, body });
  };

  if (submitted) return (
    <div className="review-form-thanks">
      <span>✓</span> Thank you! Your review is pending moderation and will appear shortly.
    </div>
  );

  return (
    <div style={{ marginBottom: 24 }}>
      {!show
        ? <AfmButton variant="ghost" size="sm" onClick={() => setShow(true)}>Write a review</AfmButton>
        : (
          <form className="review-form" onSubmit={submit}>
            <div className="rf-title">Share your experience</div>
            <div className="rf-stars">
              {[1,2,3,4,5].map(s => (
                <button type="button" key={s}
                  className={`rf-star ${s <= (hover || rating) ? 'on' : ''}`}
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}>★</button>
              ))}
              <span className="rf-star-label">{['','Poor','Fair','Good','Very good','Excellent'][hover || rating]}</span>
            </div>
            <input className="rf-input" placeholder="Review title (optional)" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}/>
            <textarea className="rf-textarea" placeholder="Tell others what you thought — fit, quality, fabric, delivery…" value={body} onChange={e => setBody(e.target.value)} rows={4} required maxLength={1000}/>
            <div style={{ display: 'flex', gap: 10 }}>
              <AfmButton variant="primary" size="sm">Submit review</AfmButton>
              <AfmButton variant="ghost" size="sm" onClick={() => setShow(false)}>Cancel</AfmButton>
            </div>
          </form>
        )}
    </div>
  );
}

function ReviewSummary({ reviews, breakdown, rating }) {
  return (
    <div className="review-summary">
      <div className="score">
        <div className="n">{rating}</div>
        <div className="stars">★ ★ ★ ★ ★</div>
        <div className="ct">{reviews.length * 54} verified reviews</div>
      </div>
      <div className="bars">
        {breakdown.map(b => (
          <div key={b.stars} className="bar-row">
            <span className="stars">{b.stars} ★</span>
            <span className="bar"><span className="fill" style={{ width: `${b.pct}%` }}></span></span>
            <span className="ct">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ r }) {
  return (
    <article className="review-card">
      <div className="head">
        <div className="av">{r.name.charAt(0)}</div>
        <div>
          <div className="who">
            {r.name}
            {r.verified && (
              <span className="v" title="Verified buyer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#1DA1F2" style={{ verticalAlign: '-2px', marginLeft: 4 }}>
                  <path d="M9 12l2 2 4-4M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" stroke="#1DA1F2" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          <div className="meta">{r.when}{r.verified && ' · Verified buyer'}</div>
        </div>
      </div>
      <div className="stars">{'★'.repeat(r.rating)}<span style={{ color: 'var(--neutral-300)' }}>{'★'.repeat(5 - r.rating)}</span></div>
      <h4 className="title">{r.title}</h4>
      <p className="body">{r.body}</p>
      {r.photos.length > 0 && (
        <div className="photos">
          {r.photos.map((p, i) => <div key={i} className="ph" style={{ backgroundImage: `url(${p})` }}></div>)}
        </div>
      )}
    </article>
  );
}

function AppPromoCard({ onAppLink }) {
  return (
    <div className="app-promo-card">
      <div>
        <div className="label">Mobile-first features</div>
        <div className="h">AR try-on lives in the <em>app.</em></div>
        <div className="s">Plus push offers from boutiques near you, voice-search, and 1-tap reorder.</div>
        <div className="badges">
          <a href="#" onClick={onAppLink}> App Store</a>
          <a href="#" onClick={onAppLink}>▶ Google Play</a>
        </div>
      </div>
      <div className="qr"></div>
    </div>
  );
}

function ProductView({ product, onAddToCart, onProductClick }) {
  const p = product || AFM_DATA.products[0];
  const { products, specs, inBox, sizeChart, reviews, ratingBreakdown } = AFM_DATA;
  const [tab, setTab] = useState('3d');
  const [bottomTab, setBottomTab] = useState('specs');
  const [size, setSize] = useState(p.sizes[1] || 'M');
  const [color, setColor] = useState(p.colors[0]);

  const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const similar = products.filter(x => x.subcat === p.subcat && x.id !== p.id).slice(0, 4);
  const sameStore = products.filter(x => x.store === p.store && x.id !== p.id && x.subcat !== p.subcat).slice(0, 4);
  const alsoViewed = products.filter(x => x.category === p.category && x.gender === p.gender && x.id !== p.id).slice(0, 8);

  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [pdToast, setPdToast] = useState(null);
  const [qaInput, setQaInput] = useState('');

  const showPdToast = (msg) => { setPdToast(msg); setTimeout(() => setPdToast(null), 3500); };

  useEffect(() => {
    const ids = getRecentlyViewed().filter(id => String(id) !== String(p.id));
    const prods = ids.map(id => products.find(x => String(x.id) === String(id))).filter(Boolean).slice(0, 8);
    setRecentlyViewedProducts(prods);
  }, [p.id]);

  return (
    <main>
      {pdToast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', maxWidth:340 }}>
          {pdToast}
        </div>
      )}
      <div className="container">
        <div style={{ padding: '24px 0 0', font: '400 12px Poppins, sans-serif', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Home</span><ChevronRight size={12}/><span>Ethnic wear</span><ChevronRight size={12}/><span>Sarees</span><ChevronRight size={12}/>
          <span style={{ color: 'var(--navy-800)', fontWeight: 500 }}>{p.name}</span>
        </div>

        <div className="pd-wrap">
          {/* ===== Viewer ===== */}
          <div className="pd-viewer">
            <div className="pd-tabs">
              <span className={`pd-tab ${tab === '3d' ? 'on' : ''}`} onClick={() => setTab('3d')}>3D</span>
              <span className={`pd-tab ${tab === '360' ? 'on' : ''}`} onClick={() => setTab('360')}>360°</span>
              <span className={`pd-tab ${tab === 'photos' ? 'on' : ''}`} onClick={() => setTab('photos')}>Photos</span>
              <span className={`pd-tab ${tab === 'tryon' ? 'on' : ''}`} onClick={() => setTab('tryon')}>AR try-on</span>
            </div>

            <div className="pd-3d-stage">
              <div className="pd-3d-figure" style={{ backgroundImage: `url(${p.img}), ${p.darkBg || p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="pd-3d-shadow"></div>

              <div className="pd-3d-controls">
                <button title="Reset" onClick={() => showPdToast('3D view reset to default angle')}><RotateCw size={16}/></button>
                <button title="Fullscreen" onClick={() => showPdToast('Fullscreen 3D viewer available in the mobile app')}><Maximize2 size={16}/></button>
                <button title="Lighting" onClick={() => showPdToast('Lighting: Studio mode active')}><Sun size={16}/></button>
              </div>

              <span className="pd-zoom-hint"><Search size={11}/> Hover to zoom · drag to rotate</span>
              <span style={{ position: 'absolute', bottom: 16, left: 24, font: '500 10px Poppins, sans-serif', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>
                Frame 12 / 36
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{
                  width: 56, height: 72, borderRadius: 10,
                  backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: `${20 + i*15}% center`,
                  border: i === 0 ? '2px solid var(--magenta-600)' : '1px solid var(--afm-border)',
                  opacity: i === 0 ? 1 : 0.7, cursor: 'pointer'
                }}></div>
              ))}
              <div style={{ width: 56, height: 72, borderRadius: 10, background: 'var(--navy-800)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 11px Poppins', cursor: 'pointer' }}>+8</div>
            </div>

            <PdTrustStrip/>
          </div>

          {/* ===== Info rail ===== */}
          <div className="pd-info pd-buybox-sticky">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div className="pd-store">by {p.store}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'linear-gradient(135deg, #1DA1F2, #0E72C6)', color: '#fff', borderRadius: 99, font: '600 11px Poppins, sans-serif', boxShadow: '0 0 16px rgba(29,161,242,0.4)' }}>
                <Check size={11}/> Verified Boutique
              </span>
            </div>
            <h1 className="pd-name">{p.name}</h1>
            <div className="pd-rating">
              <span style={{ color: 'var(--gold-500)', display: 'inline-flex', gap: 1 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14}/>)}
              </span>
              <strong style={{ color: 'var(--navy-800)' }}>{p.rating}</strong> · 218 reviews
              <span style={{ width: 4, height: 4, borderRadius: 99, background: 'var(--neutral-300)' }}></span>
              <MapPin size={12}/> {p.distance} away
            </div>

            <div className="pd-price-row">
              <span className="pd-price-cur">₹{p.price.toLocaleString('en-IN')}</span>
              {p.oldPrice && <span className="pd-price-old">₹{p.oldPrice.toLocaleString('en-IN')}</span>}
              {disc > 0 && <span className="pd-price-disc">−{disc}%</span>}
            </div>
            <div style={{ font: '400 12px Poppins', color: 'var(--success-500)', marginTop: -8, marginBottom: 18 }}>
              Inclusive of all taxes · Free local delivery
            </div>

            <div className="pd-group-label">Size · {size}</div>
            <div className="pd-sizes">
              {p.sizes.map(s => (
                <button key={s} className={`pd-size ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
              <button className="pd-size oos">XXL</button>
            </div>
            <button style={{ background: 'transparent', border: 0, color: 'var(--magenta-600)', font: '500 12px Poppins', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer', marginBottom: 18, padding: 0 }}
                    onClick={() => setBottomTab('size')}>📏 View size chart &amp; fit guide</button>

            <div className="pd-group-label">Color</div>
            <div className="pd-colors">
              {p.colors.map(c => (
                <button key={c} className={`pd-color ${color === c ? 'on' : ''}`} onClick={() => setColor(c)} style={{ background: c }} aria-label={c}></button>
              ))}
            </div>

            <div className="pd-cta-row">
              <AfmButton variant="primary" onClick={() => onAddToCart(p, size, color)}>
                <ShoppingBag size={18}/> Add to bag · ₹{p.price.toLocaleString('en-IN')}
              </AfmButton>
              <AfmButton variant="ghost" onClick={() => showPdToast('AR try-on available in the Apna iOS and Android app')}>
                <Camera size={16}/> AR try-on
              </AfmButton>
            </div>

            <div className="pd-meta-card">
              <span className="v" style={{ background: 'linear-gradient(135deg, #1DA1F2, #0E72C6)' }}><Check size={14}/></span>
              <div>
                <strong style={{ color: 'var(--navy-800)' }}>{p.store}</strong> · {p.distance} · Free same-day delivery
                <div style={{ font: '400 11px Poppins, sans-serif', color: 'var(--fg-muted)', marginTop: 2 }}>Order in the next 2 hr 14 min · arrives by 7 pm today</div>
              </div>
            </div>

            <AppPromoCard onAppLink={(e) => { e.preventDefault(); showPdToast('iOS and Android app coming soon!'); }}/>
          </div>
        </div>

        {/* ===== AI Recommendations ===== */}
        <AiRecommendation onSeeTheLook={() => alsoViewed[0] && onProductClick(alsoViewed[0].id)} />

        {/* ===== KEY FEATURES HIGHLIGHT ===== */}
        <section style={{ marginTop: 56 }}>
          <div className="section-eye" style={{ marginBottom: 6 }}>Why this piece</div>
          <h2 style={{ fontSize: 28, margin: 0, font: '600 28px Playfair Display, serif', letterSpacing: '-0.02em' }}>Three reasons this <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>stands apart</em>.</h2>
          <div className="features-highlight">
            <div className="feature-tile">
              <div className="ic"><ShieldCheck size={18}/></div>
              <h4>32 g real-zari weave</h4>
              <p>Hand-woven over 9 days by a single Varanasi karkhana. Zari is genuine silver-coated copper, never poly.</p>
            </div>
            <div className="feature-tile">
              <div className="ic"><Camera size={18}/></div>
              <h4>AR try-on (mobile)</h4>
              <p>Open in the iOS or Android app to drape the saree onto a mannequin or yourself with our pose-tracked AR.</p>
            </div>
            <div className="feature-tile">
              <div className="ic"><Truck size={18}/></div>
              <h4>Bandra → you in 26 hr</h4>
              <p>Aanya Atelier is 1.4 km from your saved address. Free local courier on this order. COD also available.</p>
            </div>
          </div>
        </section>

        {/* ===== FREQUENTLY BOUGHT TOGETHER ===== */}
        <section className="fbt">
          <div className="section-eye" style={{ marginBottom: 6 }}>Frequently bought together</div>
          <h2 style={{ fontSize: 24, margin: '0 0 18px', font: '600 24px Playfair Display, serif', letterSpacing: '-0.02em' }}>Complete the <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>look</em>.</h2>
          <div className="fbt-row">
            <div className="fbt-cards">
              {[p, ...alsoViewed.slice(0, 2)].map((it, i) => (
                <Fragment key={it.id}>
                  {i > 0 && <span className="fbt-plus">+</span>}
                  <div className={`fbt-card ${i === 0 ? 'checked' : 'checked'}`}>
                    <span className={`fbt-check on`}><Check size={12}/></span>
                    <div className="img" style={{ backgroundImage: `url(${it.img})` }}></div>
                    <div className="body">
                      <div className="name">{it.name}</div>
                      <div className="price">₹{it.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            <div className="fbt-totals">
              <div className="lbl">Bundle total</div>
              <div className="total">₹{[p, ...alsoViewed.slice(0, 2)].reduce((s, x) => s + x.price, 0).toLocaleString('en-IN')}</div>
              <div className="save">You save ₹1,240 vs buying separately</div>
              <AfmButton variant="primary">Add 3 items to bag</AfmButton>
            </div>
          </div>
        </section>

        {/* ===== OFFERS + PAYMENT ===== */}
        <section className="offers-strip">
          <div className="offers-card">
            <h4><span className="ic"><Wallet size={14}/></span>Available offers · 4</h4>
            <ul className="offers-list">
              <li><span className="pin"></span><span><strong>Bank offer</strong> · 10 % off on HDFC credit cards · max ₹500. Code <code>HDFC10</code></span></li>
              <li><span className="pin"></span><span><strong>App-only</strong> · Extra 5 % off on first order via the iOS / Android app</span></li>
              <li><span className="pin"></span><span><strong>Verified-shop combo</strong> · Pair with Mira Weaves clutch · save ₹600</span></li>
              <li><span className="pin"></span><span><strong>No-cost EMI</strong> · 3 / 6 / 9 months · all major cards</span></li>
            </ul>
          </div>
          <div className="offers-card">
            <h4><span className="ic" style={{ background: 'var(--info-100)', color: 'var(--info-500)' }}><ShieldCheck size={14}/></span>Secure payment options</h4>
            <p style={{ font: '400 12px Poppins', color: 'var(--fg-muted)', margin: '0 0 12px' }}>All transactions encrypted · processed via Razorpay · India-issued cards accepted.</p>
            <div className="payment-methods">
              <span className="pm">UPI</span>
              <span className="pm">Razorpay</span>
              <span className="pm">Visa</span>
              <span className="pm">Mastercard</span>
              <span className="pm">Rupay</span>
              <span className="pm">Net Banking</span>
              <span className="pm">PayLater</span>
              <span className="pm" style={{ background: 'var(--success-100)', color: '#0E7C4D', borderColor: 'transparent' }}>COD</span>
            </div>
            <div style={{ marginTop: 14, font: '400 12px Poppins', color: 'var(--fg-muted)' }}>
              COD fee waived above ₹1,499 for verified-shop orders
            </div>
          </div>
        </section>

        {/* ===== STORE STORY ===== */}
        <section className="story-panel">
          <div className="photo" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80&auto=format&fit=crop)' }}></div>
          <div className="text">
            <div className="eye">About the boutique</div>
            <h3>Three generations of <em>handloom</em> at Aanya Atelier.</h3>
            <p>Aanya Atelier opened on Carter Road in 1987 as a single-room store run by Mrs. Vandana Mehra. Three generations on, the family still hand-finishes every pallu in Varanasi — and every Apna Verified piece carries a discreet weaver-signature watermark.</p>
            <p>The shop has been continuously rated 4.8 ★ across 1,200+ reviews and was one of the first ten boutiques to earn the Apna Verified badge in early 2025.</p>
            <div className="meta">— Verified since Feb 2025 · 1.4 km from your saved address</div>
          </div>
        </section>

        {/* ===== TABBED LONG-FORM ===== */}
        <section style={{ marginTop: 56 }}>
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--afm-border)', marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              ['specs', 'Specifications'],
              ['box', "What's in the box"],
              ['size', 'Size guide'],
              ['ship', 'Shipping & returns'],
              ['care', 'Care'],
            ].map(([k, label]) => (
              <button key={k} onClick={() => setBottomTab(k)}
                      style={{ background: 'transparent', border: 0, padding: '14px 4px',
                               font: `${bottomTab === k ? 600 : 500} 13px Poppins`,
                               color: bottomTab === k ? 'var(--magenta-600)' : 'var(--fg-muted)',
                               borderBottom: bottomTab === k ? '2px solid var(--magenta-600)' : '2px solid transparent',
                               marginBottom: -1, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {bottomTab === 'specs' && (
            <div>
              <p style={{ font: '400 14px/1.65 Poppins', color: 'var(--fg-body)', maxWidth: 720 }}>
                Hand-woven silk saree finished in Varanasi. Aanya Atelier sources directly from third-generation handloom weavers. The pallu carries a discreet AFM verified-shop watermark and a weaver signature.
              </p>
              <div className="specs-grid">
                {specs.map(s => (
                  <div key={s.k} className="spec-row"><span className="k">{s.k}</span><span className="v">{s.v}</span></div>
                ))}
              </div>
            </div>
          )}

          {bottomTab === 'box' && (
            <div>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '0 0 6px' }}>What you'll receive</h3>
              <p style={{ font: '400 13px Poppins', color: 'var(--fg-muted)', maxWidth: 580, margin: '0 0 14px' }}>Every order from a verified boutique includes a signed authenticity certificate and reusable packaging.</p>
              <div className="box-contents">
                {inBox.map(item => (
                  <div key={item} className="item"><span className="ic">✓</span>{item}</div>
                ))}
              </div>
            </div>
          )}

          {bottomTab === 'size' && (
            <div>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '0 0 6px' }}>Blouse size chart · inches</h3>
              <p style={{ font: '400 13px Poppins', color: 'var(--fg-muted)', maxWidth: 580, margin: '0 0 6px' }}>Blouse piece is unstitched — tailor to your exact measurements. Use this chart as a starting point.</p>
              <table className="size-chart">
                <thead><tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th><th>Saree length</th></tr></thead>
                <tbody>{sizeChart.map(r => <tr key={r.label}><td><strong>{r.label}</strong></td><td>{r.bust}</td><td>{r.waist}</td><td>{r.hip}</td><td>{r.length}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          {bottomTab === 'ship' && (
            <div style={{ maxWidth: 720 }}>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '0 0 10px' }}>Shipping</h3>
              <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-body)' }}>Free same-day delivery within 10 km of Aanya Atelier (Bandra West) on orders above ₹999. Outside that radius, standard 2–3 day Shiprocket delivery applies.</p>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '24px 0 10px' }}>Returns</h3>
              <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-body)' }}>7-day no-questions-asked. Hand the package to the same delivery partner — refund initiated when the boutique acknowledges receipt. Original price refunded to source payment method within 5 business days.</p>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '24px 0 10px' }}>COD</h3>
              <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-body)' }}>Cash on Delivery available across Mumbai, Bengaluru, Delhi and Jaipur. ₹40 COD fee waived for verified-shop orders above ₹1,499.</p>
            </div>
          )}

          {bottomTab === 'care' && (
            <div style={{ maxWidth: 720 }}>
              <h3 style={{ font: '600 18px Playfair Display', color: 'var(--navy-800)', margin: '0 0 10px' }}>How to care for handloom silk</h3>
              <ul style={{ font: '400 14px/1.8 Poppins', color: 'var(--fg-body)', paddingLeft: 20 }}>
                <li>Dry-clean only. Do not machine-wash, do not soak.</li>
                <li>Iron on low heat with a cotton cloth between the iron and the saree.</li>
                <li>Store folded with a cotton wrap. Refold every 6 months to avoid permanent creases at the zari border.</li>
                <li>Keep away from direct sunlight when stored — natural dyes fade.</li>
                <li>Carry a muslin pouch for the pallu when travelling.</li>
              </ul>
            </div>
          )}
        </section>

        {/* ===== COMPARISON ===== */}
        <section style={{ marginTop: 64 }}>
          <div className="section-eye" style={{ marginBottom: 6 }}>Compare</div>
          <h2 style={{ fontSize: 28, margin: 0, font: '600 28px Playfair Display, serif', letterSpacing: '-0.02em' }}>This piece <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>vs</em> similar at other boutiques.</h2>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="this-col">
                  <div className="shop-mini">
                    <div className="th" style={{ backgroundImage: `url(${p.img})` }}></div>
                    <div className="lab">{p.name}<br/><span style={{ font: '400 10px Poppins', color: 'var(--fg-muted)' }}>by {p.store}</span></div>
                  </div>
                </th>
                {similar.slice(0,2).map(s => (
                  <th key={s.id}>
                    <div className="shop-mini">
                      <div className="th" style={{ backgroundImage: `url(${s.img})` }}></div>
                      <div className="lab">{s.name}<br/><span style={{ font: '400 10px Poppins', color: 'var(--fg-muted)' }}>by {s.store}</span></div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><td>Price</td><td className="this-col"><strong>₹{p.price.toLocaleString('en-IN')}</strong></td>{similar.slice(0,2).map(s => <td key={s.id}>₹{s.price.toLocaleString('en-IN')}</td>)}</tr>
              <tr><td>Rating</td><td className="this-col"><span style={{ color: 'var(--gold-500)' }}>★</span> {p.rating}</td>{similar.slice(0,2).map(s => <td key={s.id}><span style={{ color: 'var(--gold-500)' }}>★</span> {s.rating}</td>)}</tr>
              <tr><td>Verified Boutique</td><td className="this-col yes">✓ Yes</td>{similar.slice(0,2).map((s, i) => <td key={s.id} className={i === 0 ? 'yes' : 'no'}>{i === 0 ? '✓ Yes' : '— No'}</td>)}</tr>
              <tr><td>Same-day delivery</td><td className="this-col yes">✓ Free</td><td className="yes">✓ Free</td><td>₹40</td></tr>
              <tr><td>3D / 360° viewer</td><td className="this-col yes">✓ 36 frames</td><td>— Photos only</td><td>✓ 24 frames</td></tr>
              <tr><td>AR try-on</td><td className="this-col yes">✓ Yes</td><td className="no">— No</td><td className="no">— No</td></tr>
              <tr><td>Returns</td><td className="this-col yes">7 days, free</td><td>7 days, free</td><td>3 days only</td></tr>
              <tr><td>COD</td><td className="this-col yes">✓ Free above ₹1,499</td><td className="yes">✓ ₹40 fee</td><td className="yes">✓ ₹50 fee</td></tr>
            </tbody>
          </table>
        </section>

        {/* ===== Q&A ===== */}
        <section style={{ marginTop: 64 }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <div>
              <div className="section-eye">From other shoppers</div>
              <h2 style={{ fontSize: 32 }}>Customer <em>questions &amp; answers</em>.</h2>
            </div>
            <AfmButton variant="ghost" size="sm">All 24 questions →</AfmButton>
          </div>
          <div className="qa-list">
            {[
              { q: 'Is the blouse piece included or is it sold separately?',
                a: 'Included. The pallu unstitched blouse piece (0.8 m) comes with every saree at no extra cost. You can tailor it to your measurements at any local tailor.',
                by: 'Answered by Aanya Atelier · verified seller · 2 days ago' },
              { q: 'Is the zari real or synthetic?',
                a: 'Real silver-coated copper zari, weight 32 g per saree. The authenticity certificate that ships with every piece confirms this.',
                by: 'Answered by 12 verified buyers · most recent: Priya S · 1 week ago' },
              { q: 'Can I try this in store before buying?',
                a: 'Yes — the boutique is in Bandra West. Tap "Book a try-on appointment" on the shop page. Free, 30-min slots.',
                by: 'Answered by Apna Customer Care · 3 days ago' },
              { q: 'How does AR try-on work? Do I need a specific phone?',
                a: 'AR try-on uses ARKit (iOS 14+) and ARCore (Android Pixel 4+ / flagship phones from 2021 onward). Open the product in the app to check compatibility.',
                by: 'Answered by Apna AI · 6 hours ago' },
            ].map((item, i) => (
              <article key={i} className="qa-card">
                <div className="q"><span className="badge">Q.</span>{item.q}</div>
                <div className="a"><span className="badge" style={{ color: 'var(--success-500)' }}>A.</span><div>{item.a}<span className="by">— {item.by}</span></div></div>
              </article>
            ))}
          </div>
          <div className="qa-ask">
            <input
              className="input"
              placeholder="Ask a question about this product…"
              value={qaInput}
              onChange={e => setQaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && qaInput.trim()) { showPdToast('Question submitted! The boutique will respond within 24 hours.'); setQaInput(''); } }}
            />
            <AfmButton variant="primary" size="sm" onClick={() => { if (qaInput.trim()) { showPdToast('Question submitted! The boutique will respond within 24 hours.'); setQaInput(''); } else { showPdToast('Please type your question first'); } }}>Ask</AfmButton>
          </div>
        </section>

        {/* ===== REVIEWS ===== */}
        <section style={{ marginTop: 64 }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <div>
              <div className="section-eye">From verified buyers</div>
              <h2 style={{ fontSize: 32 }}>Customer <em>reviews</em>.</h2>
            </div>
          </div>

          <ReviewSummary reviews={reviews} breakdown={ratingBreakdown} rating={p.rating}/>
          <ReviewForm productId={p.id} />

          <div className="review-list">
            {reviews.map(r => <ReviewCard key={r.name} r={r}/>)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <AfmButton variant="ghost">See all 218 reviews</AfmButton>
          </div>
        </section>

        {/* ===== SIMILAR (same sub-category) ===== */}
        {similar.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <div className="section-eye">Similar to this · {p.subcat}</div>
                <h2 style={{ fontSize: 32 }}>More <em>{p.subcat}s</em> we love.</h2>
              </div>
              <AfmButton variant="ghost" size="sm">Browse all →</AfmButton>
            </div>
            <div className="product-grid">
              {similar.map(s => {
                const sd = s.oldPrice ? Math.round((1 - s.price / s.oldPrice) * 100) : 0;
                return (
                  <article key={s.id} className="product-card" style={{ animation: 'none', opacity: 1, cursor: 'pointer' }} onClick={() => onProductClick(s)}>
                    <div className="img" style={{ backgroundImage: `url(${s.img}), ${s.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      {sd > 0 && <div className="badges"><span className="b b-sale">-{sd}%</span></div>}
                      {s.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                    </div>
                    <div className="body">
                      <div className="store">by {s.store}</div>
                      <div className="name">{s.name}</div>
                      <div className="price-row"><span className="price">₹{s.price.toLocaleString('en-IN')}</span><span className="rate"><span className="star"><Star size={11}/></span>{s.rating}</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== MORE FROM SAME STORE (different sub-cat) ===== */}
        {sameStore.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <div className="section-eye">From {p.store}</div>
                <h2 style={{ fontSize: 32 }}>More from this <em>boutique</em>.</h2>
              </div>
              <AfmButton variant="ghost" size="sm">Visit boutique →</AfmButton>
            </div>
            <div className="product-grid">
              {sameStore.map(s => {
                const sd = s.oldPrice ? Math.round((1 - s.price / s.oldPrice) * 100) : 0;
                return (
                  <article key={s.id} className="product-card" style={{ animation: 'none', opacity: 1, cursor: 'pointer' }} onClick={() => onProductClick(s)}>
                    <div className="img" style={{ backgroundImage: `url(${s.img}), ${s.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      {sd > 0 && <div className="badges"><span className="b b-sale">-{sd}%</span></div>}
                      {s.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                    </div>
                    <div className="body">
                      <div className="store">by {s.store}</div>
                      <div className="name">{s.name}</div>
                      <div className="price-row"><span className="price">₹{s.price.toLocaleString('en-IN')}</span><span className="rate"><span className="star"><Star size={11}/></span>{s.rating}</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===== AI · ALSO VIEWED ===== */}
        <section style={{ marginTop: 64 }}>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <div>
              <div className="section-eye">Apna AI · also viewed</div>
              <h2 style={{ fontSize: 32 }}>Pairs <em>well with</em> this piece.</h2>
            </div>
          </div>
          <div className="recent-strip">
            {alsoViewed.map(s => (
              <div key={s.id} className="recent-card">
                <div className="img" style={{ backgroundImage: `url(${s.img}), ${s.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="body">
                  <div className="store">by {s.store}</div>
                  <div className="name">{s.name}</div>
                  <div className="price">₹{s.price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== RECENTLY VIEWED ===== */}
        {(recentlyViewedProducts.length > 0 || alsoViewed.length > 0) && (
          <section style={{ margin: '64px 0 80px' }}>
            <div className="section-head" style={{ marginBottom: 18 }}>
              <div>
                <div className="section-eye">Continue browsing</div>
                <h2 style={{ fontSize: 32 }}>Recently <em>viewed</em>.</h2>
              </div>
            </div>
            <div className="recent-strip">
              {(recentlyViewedProducts.length > 0 ? recentlyViewedProducts : [...alsoViewed].reverse()).map(s => (
                <div key={s.id} className="recent-card" style={{ cursor: 'pointer' }} onClick={() => onProductClick(s.id)}>
                  <div className="img" style={{ backgroundImage: `url(${s.img}), ${s.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="body">
                    <div className="store">by {s.store}</div>
                    <div className="name">{s.name}</div>
                    <div className="price">₹{s.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}



const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function normalizeApiProduct(p) {
  return {
    id: p.id,
    name: p.name,
    store: p.shop_name || 'Local Boutique',
    shopId: p.shop_id,
    price: p.price,
    oldPrice: p.compare_price || null,
    img: p.images?.[0] || null,
    bg: 'linear-gradient(135deg, #FFE4F0 0%, #FFF0F7 100%)',
    rating: parseFloat(p.avg_rating) || 0,
    badges: [],
    colors: p.colors?.length > 0 ? p.colors : ['#001F3F', '#FF1493', '#C9A24A', '#000000'],
    sizes: p.sizes?.length > 0 ? p.sizes : ['XS', 'S', 'M', 'L', 'XL'],
    description: p.description || '',
    tags: p.tags || [],
    is3d: false,
  };
}

export default function ProductDetailPage({ id }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = React.useState(
    AFM_DATA.products?.find(p => String(p.id) === String(id)) ?? null
  );
  const [loading, setLoading] = React.useState(!product);

  useEffect(() => {
    // If it's not a seed data product, fetch from API
    if (!AFM_DATA.products?.find(p => String(p.id) === String(id))) {
      setLoading(true);
      fetch(`${API_URL}/products/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setProduct(normalizeApiProduct(data));
          else setProduct(AFM_DATA.products?.[0] ?? null);
        })
        .catch(() => setProduct(AFM_DATA.products?.[0] ?? null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (product) trackView(product.id);
  }, [product?.id]);

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <ProductView
        product={product}
        onAddToCart={(p, size, color) => addToCart({ ...p, shop_id: p.shopId }, size, color)}
        onProductClick={(pid) => router.push('/product/' + pid)}
      />
      <Footer />
    </>
  );
}
