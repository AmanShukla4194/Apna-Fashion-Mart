'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Heart, RotateCw, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const sv = variant === 'primary' ? 'default' : variant === 'ghost' ? 'outline' : variant === 'on-dark' ? 'secondary' : 'ghost';
  return <Button variant={sv} size={size} onClick={onClick} className={className}>{children}</Button>;
}



function WishlistView({ wishlist, toggleWishlist, onProductClick, onAddToCart, setView }) {
  const I = AfmIcons;
  const { products } = AFM_DATA;
  // Show items the user has wishlisted + pad with a few for visual richness
  const baseItems = products.filter(p => wishlist?.has(p.id));
  const items = baseItems.length > 0 ? baseItems : products.slice(0, 6);
  const isEmpty = baseItems.length === 0;

  return (
    <main>
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
          <span className="nearby-chip on">All</span>
          <span className="nearby-chip">In stock</span>
          <span className="nearby-chip">On sale</span>
          <span className="nearby-chip">Price drop</span>
          <span className="nearby-chip">Verified shop</span>
          <div className="right">
            <span className="nearby-chip">Sort · Recently added ▾</span>
            <span className="nearby-chip" style={{ background: 'var(--magenta-100)', color: 'var(--magenta-700)', borderColor: 'transparent' }}>Move all to bag</span>
          </div>
        </div>
      </div>

      <div className="container wish-page">
        {/* Collections */}
        <div style={{ font: '500 11px Poppins', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--magenta-600)', marginBottom: 8 }}>Your collections</div>
        <h2 style={{ font: '600 26px Playfair Display', color: 'var(--navy-800)', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Curated <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>moodboards</em>.</h2>
        <div className="wish-collection-strip">
          <div className="wish-coll on">
            <div className="preview">
              {items.slice(0, 4).map((p, i) => p
                ? <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>
                : <div key={i} className="p empty"></div>)}
            </div>
            <div className="name">All saved</div>
            <div className="ct">{items.length} pieces · default</div>
          </div>
          <div className="wish-coll">
            <div className="preview">
              {items.filter(p => p.category === 'ethnic').slice(0, 4).map((p, i) =>
                <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>)}
              {Array.from({length: Math.max(0, 4 - items.filter(p => p.category === 'ethnic').slice(0, 4).length)}).map((_, i) =>
                <div key={`e${i}`} className="p empty"></div>)}
            </div>
            <div className="name">Wedding · Aug</div>
            <div className="ct">{items.filter(p => p.category === 'ethnic').length} pieces</div>
          </div>
          <div className="wish-coll">
            <div className="preview">
              {items.filter(p => p.category === 'street').slice(0, 4).map((p, i) =>
                <div key={i} className="p" style={{ backgroundImage: `url(${p.img})` }}></div>)}
              {Array.from({length: Math.max(0, 4 - items.filter(p => p.category === 'street').slice(0, 4).length)}).map((_, i) =>
                <div key={`s${i}`} className="p empty"></div>)}
            </div>
            <div className="name">Casual rotation</div>
            <div className="ct">{items.filter(p => p.category === 'street').length} pieces</div>
          </div>
          <div className="wish-coll" style={{ background: 'var(--neutral-50)', border: '1px dashed var(--neutral-300)' }}>
            <div className="preview">
              <div className="p empty"></div><div className="p empty"></div>
              <div className="p empty"></div><div className="p empty"></div>
            </div>
            <div className="name">+ New collection</div>
            <div className="ct">Organise your saves</div>
          </div>
        </div>

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
              <article key={p.id} className="product-card" onClick={() => onProductClick(p)}>
                <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div className="badges">
                    {disc > 0 && <span className="b b-sale">-{disc}%</span>}
                    {p.is3d && <span className="b b-3d"><RotateCw size={11}/></span>}
                  </div>
                  <button className="heart on" onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}>
                    <Heart size={16}/>
                  </button>
                  {p.is3d && <span className="view3d-pill"><RotateCw size={11}/> View in 3D</span>}
                  <button className="quick-add" onClick={(e) => { e.stopPropagation(); onAddToCart(p, p.sizes?.[1] || 'M', p.colors?.[0] || '#001F3F'); }}>
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
              <div key={p.id} className="recent-card" onClick={() => onProductClick(p)}>
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
              <a href="#"> App Store</a>
              <a href="#">▶ Google Play</a>
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



export default WishlistView;
