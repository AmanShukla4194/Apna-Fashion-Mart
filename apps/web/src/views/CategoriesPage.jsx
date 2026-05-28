'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronRight, Heart, Layers, RotateCw, ShieldCheck, ShoppingBag, Star, Store, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}

function CategoryView({ category, onProductClick, onAddToCart, wishlist, toggleWishlist, setView }) {
  const { products, categories, boutiques, testimonials, reviews, ratingBreakdown } = AFM_DATA;
  const aiSectionRef = useRef(null);

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

  // Toolbar quick-filters
  const [toolbarFilters, setToolbarFilters] = useState(new Set(['all']));
  const toggleToolbar = (key) => {
    setToolbarFilters(prev => {
      const s = new Set(prev);
      if (key === 'all') return new Set(['all']);
      s.delete('all');
      s.has(key) ? s.delete(key) : s.add(key);
      if (s.size === 0) s.add('all');
      return s;
    });
    setPage(1);
  };

  // Sort
  const [sortMode, setSortMode] = useState('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortLabels = { relevance: 'Relevance', price_asc: 'Price: low to high', price_desc: 'Price: high to low', rating: 'Top rated', newest: 'Newest first' };

  // Grid columns
  const [gridCols, setGridCols] = useState(4);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Sidebar filters
  const [activeSizes, setActiveSizes] = useState(new Set());
  const [activeColors, setActiveColors] = useState(new Set());
  const [activeBoutiques, setActiveBoutiques] = useState(new Set());
  const [activeRatings, setActiveRatings] = useState(new Set());
  const [activeDiscounts, setActiveDiscounts] = useState(new Set());
  const [activeDelivery, setActiveDelivery] = useState(new Set());

  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const clearAll = () => {
    setToolbarFilters(new Set(['all']));
    setActiveSizes(new Set());
    setActiveColors(new Set());
    setActiveBoutiques(new Set());
    setActiveRatings(new Set());
    setActiveDiscounts(new Set());
    setActiveDelivery(new Set());
    setActiveSub('all');
    setSortMode('relevance');
    setPage(1);
    showToast('All filters cleared');
  };

  const toggleSet = (setter, key) => {
    setter(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
    setPage(1);
  };

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
  const subKey = activeSub.replace(/-.*$/, '');
  let filtered = activeSub === 'all'
    ? baseFiltered
    : baseFiltered.filter(p => p.subcat === subKey || p.subcat?.startsWith(subKey));

  // Apply toolbar filters
  if (!toolbarFilters.has('all')) {
    if (toolbarFilters.has('in-stock')) filtered = filtered.filter(() => true);
    if (toolbarFilters.has('new')) filtered = filtered.filter(p => p.badges?.includes('new'));
    if (toolbarFilters.has('on-sale')) filtered = filtered.filter(p => p.oldPrice && p.oldPrice > p.price);
    if (toolbarFilters.has('verified')) filtered = filtered.filter(p => p.verified !== false);
    if (toolbarFilters.has('same-day')) filtered = filtered.filter(() => true);
  }

  // Apply sidebar filters
  if (activeSizes.size > 0) filtered = filtered.filter(p => p.sizes?.some(s => activeSizes.has(s)));
  if (activeRatings.size > 0) filtered = filtered.filter(p => p.rating >= Math.min(...[...activeRatings].map(Number)));
  if (activeDiscounts.size > 0) {
    const minDisc = Math.min(...[...activeDiscounts].map(Number));
    filtered = filtered.filter(p => p.oldPrice && Math.round((1 - p.price/p.oldPrice)*100) >= minDisc);
  }

  const pool = filtered.length > 0 ? filtered : baseFiltered;
  let grid = pool.length === 0 ? [] : [...Array(Math.min(48, pool.length * 3))].map((_, i) => {
    const p = pool[i % pool.length];
    return { ...p, id: `${p.id}-${i}`, price: Math.max(499, p.price + (i * 73) % 1200 - 600), rating: Math.min(5, +(p.rating + ((i % 4) - 2) * 0.1).toFixed(1)) };
  });

  // Sort grid
  if (sortMode === 'price_asc') grid = [...grid].sort((a, b) => a.price - b.price);
  else if (sortMode === 'price_desc') grid = [...grid].sort((a, b) => b.price - a.price);
  else if (sortMode === 'rating') grid = [...grid].sort((a, b) => b.rating - a.rating);

  const totalPages = Math.ceil(grid.length / PAGE_SIZE);
  const paginated = grid.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstHalf = paginated.slice(0, PAGE_SIZE / 2);
  const secondHalf = paginated.slice(PAGE_SIZE / 2);

  const hasActiveFilters = !toolbarFilters.has('all') || activeSizes.size > 0 || activeColors.size > 0 || activeBoutiques.size > 0 || activeRatings.size > 0 || activeDiscounts.size > 0 || activeDelivery.size > 0;

  return (
    <main>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>
          {toast}
        </div>
      )}

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
          <span className="cat-result-count">Showing <strong>1–{Math.min(paginated.length, grid.length)}</strong> of <strong>{cat.items}</strong> {activeSub !== 'all' ? `· filtered to ${activeSub}` : ''}</span>
          <div className="group">
            {[['all','All'],['in-stock','In stock'],['new','New arrivals'],['on-sale','On sale'],['verified','Verified shop'],['same-day','Same-day']].map(([k, label]) => (
              <span key={k} className={`nearby-chip ${toolbarFilters.has(k) ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => toggleToolbar(k)}>{label}</span>
            ))}
          </div>
          <div className="right" style={{ position:'relative' }}>
            <span className="nearby-chip" style={{ cursor:'pointer' }} onClick={() => setShowSortMenu(v => !v)}>
              Sort · {sortLabels[sortMode]} ▾
            </span>
            {showSortMenu && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', right:120, background:'#fff', border:'1px solid var(--afm-border)', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:200, minWidth:220, overflow:'hidden' }}>
                {Object.entries(sortLabels).map(([k, label]) => (
                  <div key={k} style={{ padding:'10px 16px', font:`${sortMode===k?600:400} 13px Poppins`, color:'var(--navy-800)', cursor:'pointer', background: sortMode===k ? 'var(--magenta-50, #fff5fb)' : '#fff' }}
                       onClick={() => { setSortMode(k); setShowSortMenu(false); setPage(1); }}>
                    {label}{sortMode===k ? ' ✓' : ''}
                  </div>
                ))}
              </div>
            )}
            <span className="nearby-chip" style={{ background: 'var(--magenta-100)', color: 'var(--magenta-700)', borderColor: 'transparent', cursor:'pointer' }}
                  onClick={() => setGridCols(prev => prev === 4 ? 2 : 4)}>
              Grid · {gridCols} col
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* SUB-CATEGORY STRIP */}
        <div className="subcat-strip">
          <div className={`subcat-tile ${activeSub === 'all' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => { setActiveSub('all'); setPage(1); }}>
            <div className="img-wrap" style={{ background: 'var(--gradient-aurora)' }}></div>
            <div className="lab">All</div>
            <div className="ct">{cat.items}</div>
          </div>
          {subs.map(s => (
            <div key={s.id} className={`subcat-tile ${activeSub === s.id ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => { setActiveSub(s.id); setPage(1); }}>
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
              <button className="cat-clear" onClick={clearAll} style={{ cursor:'pointer' }}>Clear all{hasActiveFilters ? ' ●' : ''}</button>
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
                  <span key={s} className={`sz ${activeSizes.has(s) ? 'on' : ''}`} style={{ cursor:'pointer' }}
                        onClick={() => toggleSet(setActiveSizes, s)}>{s}</span>
                )}
              </div>
            </div>

            <div className="cat-filter-block">
              <h4>Color</h4>
              <div className="cat-color-swatches">
                {['#001F3F','#FF1493','#C9A24A','#0B0F18','#FFFFFF','#E11D48','#0EA868','#2563EB','#F6EFDB','#475569'].map((c,i) =>
                  <span key={c} className={`cat-color-sw ${activeColors.has(c) ? 'on' : ''}`} style={{ background: c, cursor:'pointer' }}
                        onClick={() => toggleSet(setActiveColors, c)}></span>
                )}
              </div>
            </div>

            <div className="cat-filter-block">
              <h4>Boutique <span className="ct">{boutiques.length}</span></h4>
              {boutiques.map(b => (
                <div key={b.id} className={`cat-filter-line ${activeBoutiques.has(b.id) ? 'on' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => toggleSet(setActiveBoutiques, b.id)}>
                  <span className="cb">{activeBoutiques.has(b.id) && <Check size={12}/>}</span>
                  {b.name}
                  <span className="ct">{Math.floor(Math.random() * 80) + 12}</span>
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Rating</h4>
              {[5,4,3,2].map(r => (
                <div key={r} className={`cat-filter-line ${activeRatings.has(String(r)) ? 'on' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => toggleSet(setActiveRatings, String(r))}>
                  <span className="cb">{activeRatings.has(String(r)) && <Check size={12}/>}</span>
                  <span style={{ color: 'var(--gold-500)' }}>{'★'.repeat(r)}</span>
                  <span style={{ color: 'var(--neutral-300)' }}>{'★'.repeat(5-r)}</span>
                  &amp; up
                  <span className="ct">{[168, 32, 11, 4][5-r]}</span>
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Discount</h4>
              {[['10','10 % or more'],['25','25 % or more'],['40','40 % or more'],['50','50 % or more']].map(([val, label]) => (
                <div key={val} className={`cat-filter-line ${activeDiscounts.has(val) ? 'on' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => toggleSet(setActiveDiscounts, val)}>
                  <span className="cb">{activeDiscounts.has(val) && <Check size={12}/>}</span>
                  {label}
                </div>
              ))}
            </div>

            <div className="cat-filter-block">
              <h4>Delivery</h4>
              {[['same-day','Same-day delivery',187],['free','Free delivery',cat.items],['cod','COD available',cat.items]].map(([key, label, ct]) => (
                <div key={key} className={`cat-filter-line ${activeDelivery.has(key) ? 'on' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => toggleSet(setActiveDelivery, key)}>
                  <span className="cb">{activeDelivery.has(key) && <Check size={12}/>}</span>
                  {label}
                  <span className="ct">{ct}</span>
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="cat-grid-head">
              <h2 className="h">All pieces in <em>{cat.label}</em></h2>
              <span className="cat-result-count"><strong>{cat.items}</strong> total · refreshed 4 min ago</span>
            </div>

            <div className="product-grid" style={gridCols === 2 ? { gridTemplateColumns: 'repeat(2, 1fr)' } : undefined}>
              {firstHalf.map(p => {
                const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
                return (
                  <article key={p.id} className="product-card" style={{ cursor:'pointer' }} onClick={() => onProductClick(p)}>
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
                <AfmButton variant="primary" onClick={() => setView('nearby')}>Read the edit →</AfmButton>
              </div>
              <div className="img" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1610189019687-b96d5d44b96f?w=900&q=80&auto=format&fit=crop)' }}></div>
            </div>

            {/* AI band */}
            <div ref={aiSectionRef} className="nearby-ai-band" style={{ marginTop: 0 }}>
              <div className="av">A</div>
              <div className="txt">
                <div className="label">Apna AI · trending for you</div>
                <div className="h">Pieces 4× more popular than usual in your size + neighborhood this week.</div>
                <div className="s">Based on Mumbai-Bandra wishlist activity over the last 7 days.</div>
              </div>
              <button className="cta" onClick={() => { setSortMode('rating'); setPage(1); showToast('Showing top-rated trending pieces for your area'); }}>Show me →</button>
            </div>

            <div className="cat-grid-head" style={{ marginTop: 40 }}>
              <h2 className="h">More <em>just for you</em></h2>
              <span className="cat-result-count">Personalised by Apna AI</span>
            </div>

            <div className="product-grid" style={gridCols === 2 ? { gridTemplateColumns: 'repeat(2, 1fr)' } : undefined}>
              {secondHalf.map(p => {
                const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
                return (
                  <article key={p.id} className="product-card" style={{ cursor:'pointer' }} onClick={() => onProductClick(p)}>
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
              <span className={`p ${page === 1 ? 'disabled' : ''}`} style={{ cursor: page > 1 ? 'pointer' : 'default' }}
                    onClick={() => page > 1 && setPage(p => p - 1)}>‹</span>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pg = i + 1;
                return <span key={pg} className={`p ${page === pg ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setPage(pg)}>{pg}</span>;
              })}
              {totalPages > 6 && <span className="p range">…</span>}
              {totalPages > 5 && <span className="p" style={{ cursor:'pointer' }} onClick={() => setPage(totalPages)}>{totalPages}</span>}
              <span className={`p ${page === totalPages ? 'disabled' : ''}`} style={{ cursor: page < totalPages ? 'pointer' : 'default' }}
                    onClick={() => page < totalPages && setPage(p => p + 1)}>›</span>
            </div>

            {/* App download nudge */}
            <div className="nearby-app-cta" style={{ marginTop: 56 }}>
              <div>
                <div className="label">Mobile-first features</div>
                <h3>Save your <em>filters &amp; sizes</em> in the app.</h3>
                <p>One-tap reorder, push offers from your wishlisted boutiques, voice-search, and AR try-on on supported devices.</p>
                <div className="stores">
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast('iOS app coming soon!'); }}> App Store</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast('Android app coming soon!'); }}>▶ Google Play</a>
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



export default function CategoriesPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = React.useState(new Set());
  const toggleWishlist = (id) => setWishlist(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const nav = (v) => { const m = { home:'/', nearby:'/nearby-shops', cart:'/cart', wishlist:'/wishlist', account:'/account' }; router.push(m[v] ?? '/'); };
  return (
    <>
      <Header setView={nav} />
      <CategoryView
        category="all"
        onProductClick={(id) => router.push('/product/' + id)}
        onAddToCart={addToCart}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        setView={nav}
      />
      <Footer />
    </>
  );
}
