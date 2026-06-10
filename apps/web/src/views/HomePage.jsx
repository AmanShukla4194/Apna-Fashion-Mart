'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Check, ChevronRight, Heart, MapPin, Plus, RefreshCcw, RotateCw, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { apiRequest } from '@/lib/aws/config';

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}



function HomeView({ setView, onProductClick, onAddToCart, wishlist, toggleWishlist, onCategoryClick, apiProducts = [], apiShops = [] }) {
  const { boutiques, products, trust, cities, categories, howItWorks, testimonials, appFeatures } = AFM_DATA;
  const [appToast, setAppToast] = React.useState(false);
  const showAppToast = (e) => { e.preventDefault(); setAppToast(true); setTimeout(() => setAppToast(false), 3000); };

  // Use real API data when available, fall back to seed data
  const displayProducts = apiProducts.length > 0 ? apiProducts : products;
  const displayShops = apiShops.length > 0 ? apiShops : boutiques;

  return (
    <>
    <Header setView={setView} />
    <main>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-collage">
          <div className="cell c1"></div>
          <div className="cell c2"></div>
          <div className="cell c3"></div>
          <div className="cell c4"></div>
          <div className="cell c5"></div>
          <div className="cell c6"></div>
          <div className="cell c7"></div>
          <div className="cell c8"></div>
          <div className="cell c9"></div>
          <div className="cell c10"></div>
          <div className="cell c11"></div>
          <div className="cell c12"></div>
          <div className="cell c13"></div>
          <div className="cell c14"></div>
          <div className="cell c15"></div>
          <div className="cell c16"></div>
          <div className="cell c17"></div>
          <div className="cell c18"></div>
          <div className="cell c19"></div>
          <div className="cell c20"></div>
          <div className="cell c21"></div>
          <div className="cell c22"></div>
          <div className="cell c23"></div>
          <div className="cell c24"></div>
        </div>

        <div className="hero-3d-badge">
          <div className="ring">
            <span className="lbl"><em>3D</em>view</span>
          </div>
          <span className="sub">Drag · rotate · zoom</span>
        </div>

        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: '#FF55B0' }}></span>
              Apna style · Apna store
            </span>
            <h1><em>Your</em> neighborhood,<br/>in vogue.</h1>
            <p>Discover verified local boutiques near you. Browse, wishlist, order — or just walk in. Mumbai · Bengaluru · Delhi · Jaipur, and growing.</p>
            <div className="hero-cta-row">
              <AfmButton variant="primary" onClick={() => setView('nearby')}>
                <MapPin size={18} />
                Find Shops Near Me
              </AfmButton>
              <AfmButton variant="on-dark" onClick={() => setView('product')}>
                Browse Featured →
              </AfmButton>
            </div>
          </div>

          <aside className="hero-floating">
            <div className="stat-num"><em>1,247</em></div>
            <div className="stat-label">Boutiques verified in your city</div>
            <div className="avatars">
              {displayShops.slice(0,4).map(b => (
                <div key={b.id} className="avatar" style={{ background: b.bg }}>{b.initial.charAt(0)}</div>
              ))}
              <div className="avatar" style={{ background: 'rgba(255,255,255,0.06)', fontSize: 11, letterSpacing: '0.02em' }}>+1.2k</div>
            </div>
            <div className="city-strip">
              {cities.map(c => <span key={c} className="city-chip">{c}</span>)}
            </div>
          </aside>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section style={{ padding: '60px 0 0' }}>
        <div className="container">
          <div className="stats-strip">
            <div className="stat-cell">
              <div className="num"><em>1,247</em></div>
              <div className="lab">Verified boutiques</div>
            </div>
            <div className="stat-cell">
              <div className="num"><em>4</em> <span style={{ fontSize: 22, fontWeight: 500, color: 'var(--fg-muted)' }}>cities</span></div>
              <div className="lab">Mumbai · Bengaluru · Delhi · Jaipur</div>
            </div>
            <div className="stat-cell">
              <div className="num"><em>48 hr</em></div>
              <div className="lab">From signup to verified</div>
            </div>
            <div className="stat-cell">
              <div className="num"><em>4.8</em><span style={{ color: 'var(--gold-500)', fontSize: 28 }}> ★</span></div>
              <div className="lab">App store rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eye">In four steps</div>
              <h2>How <em>Apna</em> works.</h2>
              <p className="section-sub">Sign in, drop a pin, find a piece, try it on — all within an evening. No app store, no waiting.</p>
            </div>
          </div>
          <div className="steps stagger">
            {howItWorks.map(s => (
              <article key={s.n} className="step reveal">
                <div className="num">{s.n}</div>
                <h4>{s.t}</h4>
                <p>{s.s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-mist">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eye">Verified · Hand-picked</div>
              <h2>Featured <em>boutiques</em> near you.</h2>
              <p className="section-sub">Independent storefronts, vetted on-site, curated for your neighborhood.</p>
            </div>
            <AfmButton variant="ghost" onClick={() => setView('nearby')}>
              View all boutiques
              <ArrowRight size={16} />
            </AfmButton>
          </div>

          <div className="featured-grid stagger">
            {displayShops.map(b => (
              <article key={b.id} className={`boutique-card reveal ${b.verified ? 'gold' : ''}`} onClick={() => setView('product')}>
                <div className="boutique-cover" style={{ backgroundImage: `url(${b.img}), ${b.bg}` }}>
                  <span className="boutique-dist"><MapPin size={11}/>{b.distance}</span>
                  {b.verified && <span className="boutique-verified"><Check size={16}/></span>}
                  <div className="boutique-cover-inner">
                    <h3 className="boutique-cover-name">{b.name}</h3>
                    <div className="boutique-cover-meta">
                      <MapPin size={11}/> {b.area}
                    </div>
                  </div>
                </div>
                <div className="boutique-body">
                  <div className="boutique-tags">
                    {b.tags.map(t => <span key={t} className="boutique-tag">{t}</span>)}
                  </div>
                  <div className="boutique-cta">
                    <span className="rating"><span className="star"><Star size={12}/></span>{b.rating} <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>· {b.reviews}</span></span>
                    <span className="view">View boutique <ChevronRight size={14}/></span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eye">Browse by aisle</div>
              <h2>Shop every <em>category</em>.</h2>
              <p className="section-sub">From handloom ethnic wear to streetwear sneakers — every aisle, hand-picked from local boutiques.</p>
            </div>
          </div>
          <div className="cats stagger">
            {categories.map(c => (
              <div key={c.id} className="cat reveal-scale"
                   style={{ backgroundImage: `url(${c.img})` }}
                   onClick={() => onCategoryClick?.(c.id)}>
                <div>
                  <div className="lab">{c.label}</div>
                  <div className="ct">{c.items} pieces</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS — velvet ===== */}
      <section className="section section-velvet">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eye">Just dropped · This week</div>
              <h2>New <em>arrivals</em>.</h2>
              <p className="section-sub">Fresh pieces from local studios, before they hit the rest of the internet.</p>
            </div>
            <AfmButton variant="on-dark" onClick={() => setView('product')}>
              Browse all
              <ArrowRight size={16}/>
            </AfmButton>
          </div>

          <div className="product-grid">
            {displayProducts.slice(0,8).map(p => {
              const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
              return (
                <article key={p.id} className="product-card reveal" onClick={() => onProductClick(p)}>
                  <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div className="badges">
                      {p.badges?.includes('new') && <span className="b b-new">New</span>}
                      {p.badges?.includes('sale') && disc > 0 && <span className="b b-sale">-{disc}%</span>}
                      {p.is3d && <span className="b b-3d"><RotateCw size={11}/></span>}
                    </div>
                    <button
                      className={`heart ${wishlist.has(p.id) ? 'on' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                      aria-label="Wishlist"
                    >
                      <Heart size={16}/>
                    </button>
                    {p.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                    <button className="quick-add" onClick={(e) => { e.stopPropagation(); onAddToCart(p, 'M', p.colors?.[0] || '#001F3F'); }}>
                      <ShoppingBag size={14}/> Quick add to bag
                    </button>
                  </div>
                  <div className="body">
                    <div className="store">by {p.store}</div>
                    <div className="name">{p.name}</div>
                    <div className="price-row">
                      <div>
                        {p.oldPrice && <div className="price-old">₹{p.oldPrice.toLocaleString('en-IN')}</div>}
                        <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                      </div>
                      <span className="rate"><span className="star"><Star size={11}/></span>{p.rating}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CITY MARQUEE ===== */}
      <div className="marquee" aria-hidden="true">
        <div className="row">
          {[...cities, ...cities, ...cities].map((c, i) => (
            <span key={i} className="item"><span className="pin"></span>{c}</span>
          ))}
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-eye">From the community</div>
              <h2><em>Loved</em> by shoppers, trusted by boutiques.</h2>
              <p className="section-sub">3,200+ reviews · 4.8 average · across the App Store, Play Store and Google.</p>
            </div>
          </div>
          <div className="tests">
            {testimonials.map(t => (
              <div key={t.name} className="test">
                <div className="rate">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} style={{ display: 'inline-block' }} />)}
                </div>
                <div className="quote">"{t.quote}"</div>
                <div className="person">
                  <div className="av">{t.name.charAt(0)}</div>
                  <div>
                    <div className="who">{t.name}</div>
                    <div className="area">{t.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== APP DOWNLOAD BAND ===== */}
      <section className="app-band">
        {appToast && (
          <div style={{ position:'fixed', bottom:24, right:24, background:'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>
            iOS and Android app coming soon!
          </div>
        )}
        <div className="container app-band-inner">
          <div className="app-band-text">
            <div className="app-band-eye">Now on iOS &amp; Android</div>
            <h2>The boutique<br/>in <em>your pocket.</em></h2>
            <p>Same boutiques. Same pieces. Faster ordering, push offers from shops near you, AR try-on, and live order tracking.</p>
            <ul className="app-features">
              {appFeatures.map(f => <li key={f}><span className="dot"></span>{f}</li>)}
            </ul>
            <div className="app-stores">
              <a className="app-store-btn" href="#" onClick={showAppToast}>
                <span className="ic"></span>
                <span><span className="lab1">Download on the</span><span className="lab2">App Store</span></span>
              </a>
              <a className="app-store-btn" href="#" onClick={showAppToast}>
                <span className="ic">▶</span>
                <span><span className="lab1">Get it on</span><span className="lab2">Google Play</span></span>
              </a>
            </div>
            <div className="app-band-qr">
              <div className="qr"></div>
              <div className="txt"><strong>Scan to install</strong>Open this on your phone camera</div>
            </div>
          </div>
          <div className="app-phones">
            <div className="app-phone left">
              <div className="notch"></div>
              <div className="screen" style={{ background: 'linear-gradient(160deg, #001F3F, #6D1B5C 60%, #FF1493)' }}>
                <div style={{ position: 'absolute', inset: 0, padding: '60px 18px', color: '#fff' }}>
                  <div style={{ font: '500 9px Poppins', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.7 }}>Apna style · Apna store</div>
                  <div style={{ font: 'italic 600 26px/1.1 "Playfair Display", serif', marginTop: 12 }}>Your <span style={{ color: '#FFEDF7' }}>neighborhood,</span> in vogue.</div>
                </div>
              </div>
            </div>
            <div className="app-phone mid">
              <div className="notch"></div>
              <div className="screen" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80&auto=format&fit=crop)' }}>
              </div>
            </div>
            <div className="app-phone right">
              <div className="notch"></div>
              <div className="screen" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=600&q=80&auto=format&fit=crop)' }}>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="container">
          <div className="trust" style={{ border: '1px solid var(--afm-border)', borderRadius: 24, background: '#fff' }}>
            {trust.map(t => {
              const Ico = t.ico === 'shield-check' ? ShieldCheck
                : t.ico === 'pin' ? MapPin
                : t.ico === 'truck' ? Truck
                : RefreshCcw;
              return (
                <div key={t.t} className="trust-tile">
                  <Ico className="ico"/>
                  <h3>{t.t}</h3>
                  <p>{t.s}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="section-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <div className="section-eye" style={{ textAlign: 'center' }}>Answers</div>
              <h2 style={{ textAlign: 'center' }}>Frequent <em>questions.</em></h2>
              <p className="section-sub" style={{ textAlign: 'center', margin: '0 auto' }}>Need something specific? Tap your boutique's chat from any product page.</p>
            </div>
          </div>
          <div className="faq-list">
            {[
              { q: 'How are boutiques verified?', a: 'Every shop is visited in person by an Apna ops associate. We check the storefront, inventory, GST/KYC documents and product quality before issuing the blue verified badge — which can be revoked at any time.' },
              { q: 'What does the 3D / 360° viewer show?', a: 'Hero products from verified boutiques are photographed on a 36-frame turntable. You drag to rotate, pinch to zoom, and tap "Try on" for AR (supported on flagship iPhones and Pixel devices).' },
              { q: 'How fast is delivery?', a: 'Free same-day delivery on orders above ₹999 from verified partner boutiques within 10 km. Other shops self-fulfill or arrange courier — you can also collect in person.' },
              { q: 'How do returns work?', a: '7-day no-questions-asked. Hand the package to the same delivery partner; refund initiated when the boutique acknowledges receipt.' },
              { q: 'Is COD available?', a: 'Yes, COD is available across all four launch cities. Online payments via UPI, Razorpay (cards / wallets / netbanking) are also supported.' },
              { q: 'How can my boutique join?', a: 'Tap "Become a Boutique" up top. KYC + GST + first 10 product photos. We aim to onboard within 48 hours of complete submission.' },
            ].map((f, i) => (
              <details key={i} className="faq-item" open={i === 0}>
                <summary>
                  <span className="q">{f.q}</span>
                  <span className="ico"><Plus size={14}/></span>
                </summary>
                <div className="a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section style={{ padding: '0 0 120px' }}>
        <div className="container">
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'var(--gradient-aurora)', backgroundSize: '200% 200%',
            animation: 'aurora-drift 24s ease-in-out infinite alternate',
            borderRadius: 32, padding: '80px 64px', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 1080, margin: '0 auto'
          }}>
            <span className="hero-eyebrow" style={{ marginBottom: 16 }}>For your boutique</span>
            <h2 style={{ color: '#fff', fontSize: 'clamp(36px, 5vw, 64px)', margin: '0 0 16px', maxWidth: 720 }}>
              Open your storefront. <em style={{ fontStyle: 'italic', color: '#FFEDF7' }}>Onboard in 48 hours.</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 520, fontSize: 17, marginBottom: 28 }}>
              Vetted, verified, and visible to thousands of nearby customers from day one. Zero setup fee. Pay only on a sale.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <AfmButton variant="primary" onClick={() => setView('vendor-dashboard')}>Apply to become our partner</AfmButton>
              <AfmButton variant="on-dark" onClick={() => setView('legal-vendor')}>Read the playbook</AfmButton>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}



function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    store: p.shop_name || 'Local Boutique',
    price: p.price,
    oldPrice: p.compare_price || null,
    img: p.images?.[0] || null,
    bg: 'linear-gradient(135deg, #FFE4F0 0%, #FFF0F7 100%)',
    rating: parseFloat(p.avg_rating) || 0,
    badges: [],
    colors: p.colors || ['#001F3F'],
    sizes: p.sizes || [],
    is3d: false,
  };
}

function normalizeShop(s) {
  return {
    id: s.id,
    name: s.name,
    initial: (s.name || 'S').charAt(0).toUpperCase(),
    img: s.logo_url || null,
    bg: 'linear-gradient(135deg, #FFE4F0 0%, #FFF0F7 100%)',
    verified: s.is_verified || false,
    distance: s.distance_km ? `${s.distance_km} km` : '',
    area: s.city || '',
    tags: Array.isArray(s.tags) ? s.tags : [],
    rating: parseFloat(s.avg_rating) || 0,
    reviews: s.review_count || 0,
  };
}

export default function HomePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = React.useState(new Set());
  const [apiProducts, setApiProducts] = React.useState([]);
  const [apiShops, setApiShops] = React.useState([]);

  React.useEffect(() => {
    apiRequest('/products?limit=8')
      .then(data => {
        const list = data?.products || [];
        if (list.length > 0) setApiProducts(list.map(normalizeProduct));
      })
      .catch(() => {});

    apiRequest('/shops?limit=8')
      .then(data => {
        const list = data?.shops || [];
        if (list.length > 0) setApiShops(list.map(normalizeShop));
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = (id) => setWishlist(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const nav = (v) => { const m = { home:'/', nearby:'/nearby-shops', cart:'/cart', wishlist:'/wishlist', account:'/account', categories:'/categories', category:'/categories', checkout:'/checkout', 'vendor-dashboard':'/vendor-dashboard', 'legal-vendor':'/legal/vendor' }; router.push(m[v] ?? '/'); };
  return (
    <HomeView
      setView={nav}
      onProductClick={(p) => router.push('/product/' + (p?.id || p))}
      onAddToCart={addToCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      onCategoryClick={(cat) => router.push('/categories?cat=' + encodeURIComponent(cat))}
      apiProducts={apiProducts}
      apiShops={apiShops}
    />
  );
}
