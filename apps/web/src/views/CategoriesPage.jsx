'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronRight, Heart, Layers, RotateCw, ShieldCheck, ShoppingBag, Star, Store, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const sv = variant === 'primary' ? 'default' : variant === 'ghost' ? 'outline' : variant === 'on-dark' ? 'secondary' : 'ghost';
  return <Button variant={sv} size={size} onClick={onClick} className={className}>{children}</Button>;
}




function CategoryView({ category, onProductClick, onAddToCart, wishlist, toggleWishlist, setView }) {
  const I = AfmIcons;
  const { products, categories, boutiques, testimonials, reviews, ratingBreakdown } = AFM_DATA;

  // resolve category by id or fall back to first
  const cat = categories.find(c => c.id === category) || categories[0];

  const subCats = {
    women: [
      { id: 'sarees',  label: 'Sarees',     ct: '4.2k', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80&auto=format&fit=crop' },
      { id: 'kurtas',  label: 'Kurtas',     ct: '3.1k', img: 'https://images.unsplash.com/photo-1623013438264-d2a8b4f1cb16?w=300&q=80&auto=format&fit=crop' },
      { id: 'lehenga', label: 'Lehengas',   ct: '1.8k', img: 'https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=300&q=80&auto=format&fit=crop' },
      { id: 'dress',   label: 'Dresses',    ct: '2.7k', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&auto=format&fit=crop' },
      { id: 'tops',    label: 'Tops',       ct: '1.6k', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80&auto=format&fit=crop' },
      { id: 'denim',   label: 'Denim',      ct: '980',  img: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=300&q=80&auto=format&fit=crop' },
      { id: 'co-ord',  label: 'Co-ord sets', ct: '720', img: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=300&q=80&auto=format&fit=crop' },
    ],
    men: [
      { id: 'shirts',   label: 'Shirts',    ct: '2.4k', img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80&auto=format&fit=crop' },
      { id: 'tshirts',  label: 'T-shirts',  ct: '3.6k', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80&auto=format&fit=crop' },
      { id: 'kurtas-m', label: 'Kurta sets', ct: '1.2k', img: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=300&q=80&auto=format&fit=crop' },
      { id: 'jeans',    label: 'Jeans',     ct: '1.8k', img: 'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?w=300&q=80&auto=format&fit=crop' },
      { id: 'trousers', label: 'Trousers',  ct: '920',  img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&q=80&auto=format&fit=crop' },
      { id: 'sherwani', label: 'Sherwani',  ct: '320',  img: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=300&q=80&auto=format&fit=crop' },
    ],
    ethnic: [
      { id: 'sarees-e', label: 'Sarees',     ct: '4.2k', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&q=80&auto=format&fit=crop' },
      { id: 'lehenga-e',label: 'Lehengas',   ct: '1.8k', img: 'https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=300&q=80&auto=format&fit=crop' },
      { id: 'anar',    label: 'Anarkali',    ct: '1.1k', img: 'https://images.unsplash.com/photo-1623013438264-d2a8b4f1cb16?w=300&q=80&auto=format&fit=crop' },
      { id: 'bridal',  label: 'Bridal',      ct: '640',  img: 'https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=300&q=80&auto=format&fit=crop' },
      { id: 'duppata', label: 'Dupattas',    ct: '420',  img: 'https://images.unsplash.com/photo-1583391733981-8698e58491c5?w=300&q=80&auto=format&fit=crop' },
    ],
    street: [
      { id: 'tees',    label: 'Tees',         ct: '1.8k', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80&auto=format&fit=crop' },
      { id: 'hoodies', label: 'Hoodies',      ct: '620',  img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&q=80&auto=format&fit=crop' },
      { id: 'jackets', label: 'Jackets',      ct: '380',  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80&auto=format&fit=crop' },
      { id: 'cargo',   label: 'Cargo pants',  ct: '420',  img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80&auto=format&fit=crop' },
    ],
  };
  const subs = subCats[cat.id] || subCats.women;
  const [activeSub, setActiveSub] = useState('all');

  // Filter actual catalog by the current category (and sub-cat if selected) — never tile unrelated items
  const catMap = {
    women:  (p) => p.gender === 'women' || ['ethnic','women'].includes(p.category),
    men:    (p) => p.gender === 'men',
    ethnic: (p) => p.category === 'ethnic',
    street: (p) => p.category === 'street',
    kids:   (p) => p.gender === 'kids',
    foot:   (p) => p.subcat === 'footwear',
    acc:    (p) => p.subcat === 'accessory',
    lux:    (p) => p.price >= 5000,
  };
  const baseFiltered = products.filter(catMap[cat.id] || (() => true));

  // when a sub-cat is selected, narrow further by matching subcat or label
  const subKey = activeSub.replace(/-.*$/, '');
  const filtered = activeSub === 'all'
    ? baseFiltered
    : baseFiltered.filter(p => p.subcat === subKey || p.subcat?.startsWith(subKey));

  // Build the grid: use real category-matching items first, then repeat them (not unrelated products)
  const pool = filtered.length > 0 ? filtered : baseFiltered;
  const grid = pool.length === 0 ? [] : [...Array(Math.min(16, pool.length * 3))].map((_, i) => {
    const p = pool[i % pool.length];
    return {
      ...p,
      id: `${p.id}-${i}`,
      price: Math.max(499, p.price + (i * 73) % 1200 - 600),
      rating: Math.min(5, +(p.rating + ((i % 4) - 2) * 0.1).toFixed(1)),
    };
  });

  return (
    <main>
      {/* HERO */}
      <section className="cat-hero" style={{ backgroundImage: `url(${cat.img})` }}>
        <div className="container cat-hero-inner">
          <div className="crumb">
            <a onClick={() => setView('home')} style={{ color: 'inherit', cursor: 'pointer' }}>Home</a>
            <ChevronRight size={11}/>
            <span>Categories</span>
            <ChevronRight size={11}/>
            <span style={{ color: '#fff' }}>{cat.label}</span>
          </div>
          <h1><em>{cat.label}</em> · curated.</h1>
          <p>Hand-picked pieces from {boutiques.filter(b => b.verified).length}+ verified boutiques in your city. New arrivals every Friday, with same-day delivery and AR try-on on flagship items.</p>
          <div className="meta">
            <span className="m"><span className="ic"><Layers size={14}/></span><strong>{cat.items}</strong> pieces</span>
            <span className="m"><span className="ic"><Store size={14}/></span><strong>{boutiques.length * 24}</strong> boutiques</span>
            <span className="m"><span className="ic"><ShieldCheck size={14}/></span>All <strong>Apna Verified</strong></span>
            <span className="m"><span className="ic"><Truck size={14}/></span>Free <strong>same-day</strong> delivery</span>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <div className="cat-toolbar">
        <div className="container inner">
          <span className="cat-result-count">Showing <strong>1–{Math.min(grid.length, baseFiltered.length * 3)}</strong> of <strong>{cat.items}</strong> {activeSub !== 'all' ? `· filtered to ${activeSub}` : ''}</span>
          <div className="group">
            <span className="nearby-chip on">All</span>
            <span className="nearby-chip">In stock</span>
            <span className="nearby-chip">New arrivals</span>
            <span className="nearby-chip">On sale</span>
            <span className="nearby-chip">Verified shop</span>
            <span className="nearby-chip">Same-day</span>
          </div>
          <div className="right">
            <span className="nearby-chip">Sort · Relevance ▾</span>
            <span className="nearby-chip" style={{ background: 'var(--magenta-100)', color: 'var(--magenta-700)', borderColor: 'transparent' }}>Grid · 4 col</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* SUB-CATEGORY STRIP */}
        <div className="subcat-strip">
          <div className={`subcat-tile ${activeSub === 'all' ? 'on' : ''}`} onClick={() => setActiveSub('all')}>
            <div className="img-wrap" style={{ background: 'var(--gradient-aurora)' }}></div>
            <div className="lab">All</div>
            <div className="ct">{cat.items}</div>
          </div>
          {subs.map(s => (
            <div key={s.id} className={`subcat-tile ${activeSub === s.id ? 'on' : ''}`} onClick={() => setActiveSub(s.id)}>
              <div className="img-wrap" style={{ backgroundImage: `url(${s.img})` }}></div>
              <div className="lab">{s.label}</div>
              <div className="ct">{s.ct}</div>
            </div>
          ))}
        </div>

        {/* DEAL BAND */}
        <div className="cat-deal-band">
          <div className="text">
            <span className="label">Deal of the day</span>
            <h3>Up to <em>50 % off</em> on verified ethnic wear.</h3>
            <p style={{ font: '400 13px Poppins', color: 'rgba(255,255,255,0.78)', margin: 0 }}>Hand-finished by 4 boutiques in Bandra and Khar. Ends midnight.</p>
            <div className="countdown">
              <div className="seg"><div className="n">04</div><div className="l">Hrs</div></div>
              <div className="seg"><div className="n">18</div><div className="l">Min</div></div>
              <div className="seg"><div className="n">42</div><div className="l">Sec</div></div>
            </div>
          </div>
          <div className="images">
            <div className="img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=600&q=80&auto=format&fit=crop)' }}></div>
            <div className="img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80&auto=format&fit=crop)' }}></div>
          </div>
        </div>

        {/* MAIN: FILTERS + GRID */}
        <div className="cat-body">
          <aside className="cat-filters">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <h3 style={{ font: '600 16px Playfair Display', margin: 0, color: 'var(--navy-800)' }}>Filters</h3>
              <button className="cat-clear">Clear all</button>
            </div>

            <div className="cat-filter-block">
              <h4>Price <span className="ct">₹499 – ₹12,000</span></h4>
              <div className="price-slider">
                <div className="range"><span>₹999</span><span>₹6,500</span></div>
                <div className="track">
                  <div className="fill"></div>
                  <div className="handle" style={{ left: '15%' }}></div>
                  <div className="handle" style={{ left: '75%' }}></div>
                </div>
              </div>
            </div>

            <div className="cat-filter-block">
              <h4>Size</h4>
              <div className="cat-size-grid">
                {['XS','S','M','L','XL','XXL','3XL','Free'].map(s =>
                  <span key={s} className={`sz ${s === 'M' ? 'on' : ''}`}>{s}</span>
                )}
              </div>
            </div>

            <div className="cat-filter-block">
              <h4>Color</h4>
              <div className="cat-color-swatches">
                {['#001F3F','#FF1493','#C9A24A','#0B0F18','#FFFFFF','#E11D48','#0EA868','#2563EB','#F6EFDB','#475569'].map((c,i) =>
                  <span key={c} className={`cat-color-sw ${i === 0 || i === 1 ? 'on' : ''}`} style={{ background: c }}></span>
                )}
              </div>
            </div>

            <div className="cat-filter-block">
              <h4>Boutique <span className="ct">{boutiques.length}</span></h4>
              {boutiques.map(b => (
                <div key={b.id} className={`cat-filter-line ${b.verified ? 'on' : ''}`}>
                  <span className="cb">{b.verified && <Check size={12}/>}</span>
                  {b.name}
                  <span className="ct">{Math.floor(Math.random() * 80) + 12}</span>
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Rating</h4>
              {[5,4,3,2].map(r => (
                <div key={r} className={`cat-filter-line ${r >= 4 ? 'on' : ''}`}>
                  <span className="cb">{r >= 4 && <Check size={12}/>}</span>
                  <span style={{ color: 'var(--gold-500)' }}>{'★'.repeat(r)}</span>
                  <span style={{ color: 'var(--neutral-300)' }}>{'★'.repeat(5-r)}</span>
                  &amp; up
                  <span className="ct">{[168, 32, 11, 4][5-r]}</span>
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Discount</h4>
              {['10 % or more','25 % or more','40 % or more','50 % or more'].map((d, i) => (
                <div key={d} className={`cat-filter-line ${i === 1 ? 'on' : ''}`}>
                  <span className="cb">{i === 1 && <Check size={12}/>}</span>
                  {d}
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Delivery</h4>
              <div className="cat-filter-line on">
                <span className="cb"><Check size={12}/></span>
                Same-day delivery
                <span className="ct">187</span>
              </div>
              <div className="cat-filter-line">
                <span className="cb"></span>
                Free delivery
                <span className="ct">{cat.items}</span>
              </div>
              <div className="cat-filter-line">
                <span className="cb"></span>
                COD available
                <span className="ct">{cat.items}</span>
              </div>
            </div>
          </aside>

          <div>
            <div className="cat-grid-head">
              <h2 className="h">All pieces in <em>{cat.label}</em></h2>
              <span className="cat-result-count"><strong>{cat.items}</strong> total · refreshed 4 min ago</span>
            </div>

            <div className="product-grid">
              {grid.slice(0, 8).map(p => {
                const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
                return (
                  <article key={p.id} className="product-card" onClick={() => onProductClick(p)}>
                    <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      <div className="badges">
                        {p.badges?.includes('new') && <span className="b b-new">New</span>}
                        {disc > 0 && <span className="b b-sale">-{disc}%</span>}
                        {p.is3d && <span className="b b-3d"><RotateCw size={11}/></span>}
                      </div>
                      <button className={`heart ${wishlist?.has(p.id.split('-')[0]) ? 'on' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist?.(p.id.split('-')[0]); }}>
                        <Heart size={16}/>
                      </button>
                      {p.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                      <button className="quick-add" onClick={(e) => { e.stopPropagation(); onAddToCart(p, 'M', p.colors?.[0] || '#001F3F'); }}>
                        <ShoppingBag size={14}/> Quick add
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

            {/* Editorial banner mid-grid */}
            <div className="cat-editorial">
              <div className="text">
                <span className="eye">Editorial · The wedding edit</span>
                <h3>The <em>handloom</em> bride.</h3>
                <p>A 14-look guide curated by stylist Anaita Shroff Adajania — every piece is from a verified boutique within 10 km of you. Read the editorial, shop the look, save the moodboard.</p>
                <AfmButton variant="primary">Read the edit →</AfmButton>
              </div>
              <div className="img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=900&q=80&auto=format&fit=crop)' }}></div>
            </div>

            {/* AI band */}
            <div className="nearby-ai-band" style={{ marginTop: 0 }}>
              <div className="av">A</div>
              <div className="txt">
                <div className="label">Apna AI · trending for you</div>
                <div className="h">Pieces 4× more popular than usual in your size + neighborhood this week.</div>
                <div className="s">Based on Mumbai-Bandra wishlist activity over the last 7 days.</div>
              </div>
              <button className="cta">Show me →</button>
            </div>

            <div className="cat-grid-head" style={{ marginTop: 40 }}>
              <h2 className="h">More <em>just for you</em></h2>
              <span className="cat-result-count">Personalised by Apna AI</span>
            </div>

            <div className="product-grid">
              {grid.slice(8, 16).map(p => {
                const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
                return (
                  <article key={p.id} className="product-card" onClick={() => onProductClick(p)}>
                    <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      <div className="badges">
                        {disc > 0 && <span className="b b-sale">-{disc}%</span>}
                        {p.is3d && <span className="b b-3d"><RotateCw size={11}/></span>}
                      </div>
                      <button className="heart" onClick={(e) => { e.stopPropagation(); toggleWishlist?.(p.id.split('-')[0]); }}>
                        <Heart size={16}/>
                      </button>
                      {p.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                    </div>
                    <div className="body">
                      <div className="store">by {p.store}</div>
                      <div className="name">{p.name}</div>
                      <div className="price-row">
                        <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                        <span className="rate"><span className="star"><Star size={11}/></span>{p.rating}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="cat-pagination">
              <span className="p disabled">‹</span>
              <span className="p on">1</span>
              <span className="p">2</span>
              <span className="p">3</span>
              <span className="p range">…</span>
              <span className="p">128</span>
              <span className="p">›</span>
            </div>

            {/* App download nudge */}
            <div className="nearby-app-cta" style={{ marginTop: 56 }}>
              <div>
                <div className="label">Mobile-first features</div>
                <h3>Save your <em>filters &amp; sizes</em> in the app.</h3>
                <p>One-tap reorder, push offers from your wishlisted boutiques, voice-search, and AR try-on on supported devices.</p>
                <div className="stores">
                  <a href="#"> App Store</a>
                  <a href="#">▶ Google Play</a>
                </div>
              </div>
              <div className="phones">
                <div className="phone" style={{ transform: 'rotate(-4deg)' }}><div className="scr" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&auto=format&fit=crop)' }}></div></div>
                <div className="phone" style={{ transform: 'rotate(4deg) translateY(20px)' }}><div className="scr" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1623013438264-d2a8b4f1cb16?w=400&q=80&auto=format&fit=crop)' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



export default CategoryView;
