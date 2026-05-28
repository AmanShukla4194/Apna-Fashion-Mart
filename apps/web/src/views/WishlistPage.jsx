'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, RotateCw, ShoppingBag, Star, X } from 'lucide-react';
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

function WishlistView({ wishlist, toggleWishlist, onProductClick, onAddToCart, setView }) {
  const { products } = AFM_DATA;
  const baseItems = products.filter(p => wishlist?.has(p.id));
  const allItems = baseItems.length > 0 ? baseItems : products.slice(0, 6);
  const isEmpty = baseItems.length === 0;

  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCollection, setActiveCollection] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showNewColl, setShowNewColl] = useState(false);
  const [newCollName, setNewCollName] = useState('');
  const [collections, setCollections] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const sortLabels = { recent: 'Recently added', price_asc: 'Price: low to high', price_desc: 'Price: high to low', rating: 'Top rated' };

  let items = activeCollection === 'ethnic'
    ? allItems.filter(p => p.category === 'ethnic')
    : activeCollection === 'street'
    ? allItems.filter(p => p.category === 'street')
    : allItems;

  if (activeFilter === 'in-stock') items = items.filter(() => true);
  else if (activeFilter === 'on-sale') items = items.filter(p => p.oldPrice && p.oldPrice > p.price);
  else if (activeFilter === 'price-drop') items = items.filter(p => p.oldPrice && p.oldPrice > p.price);
  else if (activeFilter === 'verified') items = items.filter(p => p.verified !== false);

  if (sortOrder === 'price_asc') items = [...items].sort((a, b) => a.price - b.price);
  else if (sortOrder === 'price_desc') items = [...items].sort((a, b) => b.price - a.price);
  else if (sortOrder === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);

  const moveAllToBag = () => {
    items.forEach(p => onAddToCart(p, p.sizes?.[1] || 'M', p.colors?.[0] || '#001F3F'));
    showToast(`${items.length} items moved to bag!`);
  };

  const addCollection = () => {
    if (!newCollName.trim()) return;
    setCollections(prev => [...prev, { name: newCollName.trim(), id: Date.now() }]);
    showToast(`Collection "${newCollName.trim()}" created!`);
    setNewCollName('');
    setShowNewColl(false);
  };

  return (
    <main>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', maxWidth:320 }}>
          {toast.msg}
        </div>
      )}

      <section className="wish-hero">
        <div className="container">
          <div className="eye">Your private edit</div>
          <h1>Your <em>wishlist</em>.</h1>
          <p>Pieces you've saved across {Math.max(1, new Set(items.map(i => i.store)).size)} boutiques. We'll tell you when prices drop or items go out of stock.</p>
          <div className="stats">
            <span><strong>{items.length}</strong> items saved</span>
            <span className="pin"></span>
            <span><strong>{new Set(items.map(i => i.store)).size}</strong> boutiques</span>
            <span className="pin"></span>
            <span>Total value · <strong>₹{items.reduce((s, p) => s + p.price, 0).toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </section>

      <div className="wish-toolbar">
        <div className="container inner">
          <span className="cat-result-count"><strong>{items.length}</strong> items</span>
          <span className={`nearby-chip ${activeFilter === 'all' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveFilter('all')}>All</span>
          <span className={`nearby-chip ${activeFilter === 'in-stock' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveFilter('in-stock')}>In stock</span>
          <span className={`nearby-chip ${activeFilter === 'on-sale' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveFilter('on-sale')}>On sale</span>
          <span className={`nearby-chip ${activeFilter === 'price-drop' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveFilter('price-drop')}>Price drop</span>
          <span className={`nearby-chip ${activeFilter === 'verified' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveFilter('verified')}>Verified shop</span>
          <div className="right" style={{ position:'relative' }}>
            <span className="nearby-chip" style={{ cursor:'pointer' }} onClick={() => setShowSortMenu(v => !v)}>
              Sort · {sortLabels[sortOrder]} ▾
            </span>
            {showSortMenu && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'#fff', border:'1px solid var(--afm-border)', borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', zIndex:100, minWidth:220, overflow:'hidden' }}>
                {Object.entries(sortLabels).map(([k, label]) => (
                  <div key={k} style={{ padding:'10px 16px', font:`${sortOrder===k?600:400} 13px Poppins`, color:'var(--navy-800)', cursor:'pointer', background: sortOrder===k ? 'var(--magenta-50, #fff5fb)' : '#fff' }}
                       onClick={() => { setSortOrder(k); setShowSortMenu(false); }}>
                    {label}{sortOrder===k ? ' ✓' : ''}
                  </div>
                ))}
              </div>
            )}
            <span className="nearby-chip" style={{ background: 'var(--magenta-100)', color: 'var(--magenta-700)', borderColor: 'transparent', cursor:'pointer' }}
                  onClick={moveAllToBag}>
              Move all to bag
            </span>
          </div>
        </div>
      </div>

      <div className="container wish-page">
        {/* Collections */}
        <div style={{ font: '500 11px Poppins', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--magenta-600)', marginBottom: 8 }}>Your collections</div>
        <h2 style={{ font: '600 26px Playfair Display', color: 'var(--navy-800)', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Curated <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>moodboards</em>.</h2>
        <div className="wish-collection-strip">
          <div className={`wish-coll ${activeCollection === 'all' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveCollection('all')}>
            <div className="preview">
              {allItems.slice(0, 4).map((p, i) => p
                ? <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>
                : <div key={i} className="p empty"></div>)}
            </div>
            <div className="name">All saved</div>
            <div className="ct">{allItems.length} pieces · default</div>
          </div>
          <div className={`wish-coll ${activeCollection === 'ethnic' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveCollection('ethnic')}>
            <div className="preview">
              {allItems.filter(p => p.category === 'ethnic').slice(0, 4).map((p, i) =>
                <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>)}
              {Array.from({length: Math.max(0, 4 - allItems.filter(p => p.category === 'ethnic').slice(0, 4).length)}).map((_, i) =>
                <div key={`e${i}`} className="p empty"></div>)}
            </div>
            <div className="name">Wedding · Aug</div>
            <div className="ct">{allItems.filter(p => p.category === 'ethnic').length} pieces</div>
          </div>
          <div className={`wish-coll ${activeCollection === 'street' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setActiveCollection('street')}>
            <div className="preview">
              {allItems.filter(p => p.category === 'street').slice(0, 4).map((p, i) =>
                <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>)}
              {Array.from({length: Math.max(0, 4 - allItems.filter(p => p.category === 'street').slice(0, 4).length)}).map((_, i) =>
                <div key={`s${i}`} className="p empty"></div>)}
            </div>
            <div className="name">Casual rotation</div>
            <div className="ct">{allItems.filter(p => p.category === 'street').length} pieces</div>
          </div>
          {collections.map(c => (
            <div key={c.id} className="wish-coll" style={{ cursor:'pointer' }} onClick={() => setActiveCollection(String(c.id))}>
              <div className="preview">
                <div className="p empty"></div><div className="p empty"></div>
                <div className="p empty"></div><div className="p empty"></div>
              </div>
              <div className="name">{c.name}</div>
              <div className="ct">0 pieces</div>
            </div>
          ))}
          <div className="wish-coll" style={{ background: 'var(--neutral-50)', border: '1px dashed var(--neutral-300)', cursor:'pointer' }}
               onClick={() => setShowNewColl(true)}>
            <div className="preview">
              <div className="p empty"></div><div className="p empty"></div>
              <div className="p empty"></div><div className="p empty"></div>
            </div>
            <div className="name">+ New collection</div>
            <div className="ct">Organise your saves</div>
          </div>
        </div>

        {/* New collection input */}
        {showNewColl && (
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, padding:'12px 16px', background:'#fff', border:'1px solid var(--afm-border)', borderRadius:12 }}>
            <input
              autoFocus
              style={{ flex:1, border:'1px solid var(--afm-border)', borderRadius:8, padding:'8px 12px', font:'400 14px Poppins' }}
              placeholder="Collection name (e.g. Festive 2026)"
              value={newCollName}
              onChange={e => setNewCollName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCollection(); if (e.key === 'Escape') setShowNewColl(false); }}
            />
            <AfmButton variant="primary" size="sm" onClick={addCollection}>Create</AfmButton>
            <button style={{ background:'transparent', border:0, cursor:'pointer', color:'var(--fg-muted)' }} onClick={() => setShowNewColl(false)}><X size={16}/></button>
          </div>
        )}

        {/* Price drop alerts strip */}
        <div className="wish-alerts">
          <span className="ic"><ShoppingBag size={18}/></span>
          <div style={{ flex: 1 }}>
            <h4>Price drop alerts are <em>on</em></h4>
            <p>We'll email + push-notify you when wishlisted items go on sale at the boutique you saved them from.</p>
          </div>
          <span className="toggle"></span>
        </div>

        {isEmpty && (
          <div className="wish-empty" style={{ marginTop: 32 }}>
            <img src="/brand-icons/hanger-glyph.svg" alt=""/>
            <h2>You haven't <em>saved</em> anything yet.</h2>
            <p>Tap the heart on any product to save it here. Wishlists sync across the web and mobile app — and we'll tell you when something goes on sale.</p>
            <AfmButton variant="primary" onClick={() => setView('nearby')}>Browse nearby boutiques</AfmButton>
            <div style={{ marginTop: 32, font: '500 11px Poppins', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--fg-muted)' }}>Below: pieces other shoppers in Bandra wishlisted this week</div>
          </div>
        )}

        {/* Wishlist grid */}
        <div className="wish-grid">
          {items.map(p => {
            const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
            return (
              <article key={p.id} className="product-card" style={{ cursor:'pointer' }} onClick={() => onProductClick(p)}>
                <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div className="badges">
                    {disc > 0 && <span className="b b-sale">-{disc}%</span>}
                    {p.is3d && <span className="b b-3d"><RotateCw size={11}/></span>}
                  </div>
                  <button className="heart on" onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}>
                    <Heart size={16}/>
                  </button>
                  {p.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                  <button className="quick-add" onClick={(e) => { e.stopPropagation(); onAddToCart(p, p.sizes?.[1] || 'M', p.colors?.[0] || '#001F3F'); showToast(`${p.name} added to bag!`); }}>
                    <ShoppingBag size={14}/> Move to bag
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

        {/* AI Recommendations based on wishlist */}
        <section style={{ marginTop: 56 }}>
          <div className="section-eye" style={{ marginBottom: 6 }}>Apna AI · based on your saves</div>
          <h2 style={{ fontSize: 28, margin: 0, font: '600 28px Playfair Display', letterSpacing: '-0.02em' }}>You'd probably <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>love</em> these too.</h2>
          <div className="recent-strip" style={{ marginTop: 18 }}>
            {products.filter(p => !wishlist?.has(p.id)).slice(0, 8).map(p => (
              <div key={p.id} className="recent-card" style={{ cursor:'pointer' }} onClick={() => onProductClick(p)}>
                <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <button className="heart" style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 99, background: 'rgba(255,255,255,0.85)', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy-800)' }}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}>
                    <Heart size={13}/>
                  </button>
                </div>
                <div className="body">
                  <div className="store">by {p.store}</div>
                  <div className="name">{p.name}</div>
                  <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* App promo */}
        <div className="nearby-app-cta" style={{ marginTop: 56 }}>
          <div>
            <div className="label">Mobile-first features</div>
            <h3>Wishlists are <em>better in the app.</em></h3>
            <p>Push notification the second a wishlisted item drops in price, comes back in stock, or appears at a boutique near you.</p>
            <div className="stores">
              <a href="#" onClick={(e) => { e.preventDefault(); showToast('iOS app coming soon!'); }}> App Store</a>
              <a href="#" onClick={(e) => { e.preventDefault(); showToast('Android app coming soon!'); }}>▶ Google Play</a>
            </div>
          </div>
          <div className="phones">
            <div className="phone" style={{ transform: 'rotate(-4deg)' }}><div className="scr" style={{ backgroundImage: `url(${items[0]?.img})` }}></div></div>
            <div className="phone" style={{ transform: 'rotate(4deg) translateY(20px)' }}><div className="scr" style={{ backgroundImage: `url(${items[1]?.img || items[0]?.img})` }}></div></div>
          </div>
        </div>
      </div>
    </main>
  );
}



export default function WishlistPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = React.useState(new Set());
  const toggleWishlist = (id) => setWishlist(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const nav = (v) => { const m = { home:'/', nearby:'/nearby-shops', cart:'/cart', account:'/account' }; router.push(m[v] ?? '/'); };
  return (
    <>
      <Header setView={nav} />
      <WishlistView
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        onProductClick={(id) => router.push('/product/' + id)}
        onAddToCart={addToCart}
        setView={nav}
      />
      <Footer />
    </>
  );
}
