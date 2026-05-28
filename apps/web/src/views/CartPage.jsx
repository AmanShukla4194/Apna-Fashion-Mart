'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Check, Heart, MapPin, Minus, Package, Plus, RefreshCcw, ShieldCheck, Trash2, Truck, X } from 'lucide-react';
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

const VALID_COUPONS = {
  WELCOME500: { desc: 'Flat ₹500 off above ₹2,000', fn: (sub) => sub > 2000 ? 500 : 0 },
  HDFC10:     { desc: '10% off HDFC cards · max ₹500', fn: (sub) => Math.min(Math.round(sub * 0.10), 500) },
  APNA5:      { desc: 'App-only 5% off first order', fn: (sub) => Math.round(sub * 0.05) },
};

const SAVED_ADDRESSES = [
  { lab: 'HOME · default', name: 'Priya Sharma', body: '14, Carter Road, near Carter Sq Café · Bandra West · Mumbai 400050', phone: '+91 98210 ••••• 47' },
  { lab: 'WORK', name: 'Priya Sharma', body: 'Indiabulls Centre, 14th floor · Senapati Bapat Marg · Mumbai 400013', phone: '+91 98210 ••••• 47' },
  { lab: 'MOTHER', name: 'Lata Sharma', body: '7, Saraswati Vihar · CG Road · Ahmedabad 380009', phone: '+91 99250 ••••• 12' },
];

function CartView({ items, setItems, setView, onProductClick, wishlist, toggleWishlist }) {
  const { products } = AFM_DATA;
  const [slot, setSlot] = useState('today');
  const [appliedCoupon, setAppliedCoupon] = useState('WELCOME500');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [savedItems, setSavedItems] = useState(products.slice(8, 12));
  const [giftWrap, setGiftWrap] = useState(false);
  const [showAddressSelect, setShowAddressSelect] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setAppliedCoupon(code);
      setPromoCode('');
      setPromoError('');
      showToast(`Coupon ${code} applied!`);
    } else {
      setPromoError('Invalid code. Try WELCOME500, HDFC10 or APNA5.');
    }
  };

  const byStore = items.reduce((acc, it) => {
    (acc[it.store] = acc[it.store] || []).push(it);
    return acc;
  }, {});

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrp = items.reduce((s, i) => s + ((i.oldPrice || i.price) * i.qty), 0);
  const productDiscount = mrp - subtotal;
  const couponInfo = VALID_COUPONS[appliedCoupon];
  const couponDiscount = couponInfo ? couponInfo.fn(subtotal) : 0;
  const giftWrapFee = giftWrap ? 49 * items.length : 0;
  const delivery = subtotal > 999 ? 0 : 40;
  const platformFee = 9;
  const total = subtotal - couponDiscount + giftWrapFee + delivery + platformFee;
  const totalSavings = productDiscount + couponDiscount + (subtotal > 999 ? 40 : 0);

  const updateQty = (id, size, delta) => {
    setItems(items.map(i => (i.id === id && i.size === size) ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };
  const removeItem = (id, size) => setItems(items.filter(i => !(i.id === id && i.size === size)));
  const moveToSaved = (id, size) => {
    const it = items.find(i => i.id === id && i.size === size);
    if (it) {
      setItems(items.filter(i => !(i.id === id && i.size === size)));
      setSavedItems([{ ...it }, ...savedItems]);
    }
  };
  const moveToCart = (p) => {
    const exist = items.find(i => i.id === p.id);
    if (exist) updateQty(p.id, exist.size, 1);
    else setItems([...items, { id: p.id, name: p.name, store: p.store, price: p.price, oldPrice: p.oldPrice, qty: 1, size: p.sizes?.[1] || 'M', color: p.colors?.[0] || '#001F3F', bg: p.bg, initial: p.initial, img: p.img }]);
    setSavedItems(savedItems.filter(s => s.id !== p.id));
  };

  if (items.length === 0) {
    return (
      <main>
        <div className="container cart-page">
          <div className="head">
            <div>
              <h1>Your <em>bag</em>.</h1>
              <div className="sub">Empty for now — let's fix that</div>
            </div>
          </div>
          <div className="cart-section" style={{ textAlign: 'center', padding: 80 }}>
            <img src="/brand-icons/hanger-glyph.svg" alt="" style={{ width: 140, opacity: 0.7 }}/>
            <h2 style={{ font: '600 28px Playfair Display', color: 'var(--navy-800)', margin: '24px 0 6px' }}>Nothing in your bag <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>yet.</em></h2>
            <p style={{ font: '400 15px Poppins', color: 'var(--fg-muted)', margin: '0 0 24px' }}>Discover verified boutiques near you · the AI assistant can help if you don't know where to start.</p>
            <AfmButton variant="primary" onClick={() => setView('nearby')}>Find shops near me</AfmButton>
          </div>
        </div>
      </main>
    );
  }

  const addr = SAVED_ADDRESSES[selectedAddress];

  return (
    <main>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background: toast.type==='error' ? '#DC2626' : 'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', maxWidth:320 }}>
          {toast.msg}
        </div>
      )}

      <div className="container cart-page">
        <div className="head">
          <div>
            <div style={{ font: '500 11px Poppins', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--fg-muted)' }}>{items.length} items · {Object.keys(byStore).length} boutiques · Mumbai</div>
            <h1>Review your <em>bag</em>.</h1>
          </div>
          <div className="progress">
            <div className="cart-step on"><span className="n">1</span> Bag</div>
            <span className="line"></span>
            <div className="cart-step"><span className="n">2</span> Address</div>
            <span className="line"></span>
            <div className="cart-step"><span className="n">3</span> Payment</div>
            <span className="line"></span>
            <div className="cart-step"><span className="n">4</span> Done</div>
          </div>
        </div>

        <div className="cart-grid">
          <div>
            {/* DELIVERY ADDRESS */}
            <div className="cart-section">
              <h3>Deliver to</h3>
              {showAddressSelect ? (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
                  {SAVED_ADDRESSES.map((a, i) => (
                    <div key={i} className="cart-addr" style={{ cursor:'pointer', border: i === selectedAddress ? '2px solid var(--magenta-600)' : undefined }}
                         onClick={() => { setSelectedAddress(i); setShowAddressSelect(false); showToast(`Delivering to ${a.lab}`); }}>
                      <span className="ic"><MapPin size={16}/></span>
                      <div className="info">
                        <div className="lab">{a.lab}</div>
                        <div className="name">{a.name}</div>
                        <div className="body">{a.body}</div>
                      </div>
                      {i === selectedAddress && <Check size={16} style={{ color:'var(--magenta-600)', flexShrink:0 }}/>}
                    </div>
                  ))}
                  <button className="afm-btn afm-btn-ghost" style={{ marginTop:4 }} onClick={() => showToast('Add new address — feature coming soon')}>+ Add new address</button>
                </div>
              ) : (
                <div className="cart-addr">
                  <span className="ic"><MapPin size={16}/></span>
                  <div className="info">
                    <div className="lab">{addr.lab}</div>
                    <div className="name">{addr.name}</div>
                    <div className="body">{addr.body}</div>
                    <div className="phone">{addr.phone}</div>
                  </div>
                  <button className="change" onClick={() => setShowAddressSelect(true)}>Change ▾</button>
                </div>
              )}
            </div>

            {/* DELIVERY SLOT */}
            <div className="cart-section">
              <h3>When should it arrive? <span className="count">{Object.keys(byStore).length} packages</span></h3>
              <div className="sub-head">Free same-day from verified boutiques · standard delivery elsewhere</div>
              <div className="cart-delivery-grid">
                <div className={`cart-slot ${slot === 'today' ? 'on' : ''}`} onClick={() => setSlot('today')}>
                  <div className="lab">⚡ Same-day · today</div>
                  <div className="date">Wed, 17 May</div>
                  <div className="window">5 – 8 pm window</div>
                  <div className="fee">Free</div>
                </div>
                <div className={`cart-slot ${slot === 'tomorrow' ? 'on' : ''}`} onClick={() => setSlot('tomorrow')}>
                  <div className="lab">📦 Standard</div>
                  <div className="date">Thu, 18 May</div>
                  <div className="window">10 am – 6 pm</div>
                  <div className="fee">Free</div>
                </div>
                <div className={`cart-slot ${slot === 'priority' ? 'on' : ''}`} onClick={() => setSlot('priority')}>
                  <div className="lab">✨ Priority · 2 hr</div>
                  <div className="date">Wed, 17 May</div>
                  <div className="window">By 1 pm</div>
                  <div className="fee" style={{ color: 'var(--magenta-600)' }}>+ ₹99</div>
                </div>
              </div>
            </div>

            {/* CART ITEMS - GROUPED BY STORE */}
            <div className="cart-section">
              <h3>Your bag <span className="count">{items.length} {items.length === 1 ? 'item' : 'items'}</span></h3>
              <div className="sub-head">Items grouped by boutique — each ships separately from the shop</div>

              {Object.entries(byStore).map(([store, list]) => {
                const storeProduct = products.find(p => p.store === store);
                return (
                  <div key={store} className="cart-vendor-group">
                    <div className="cart-vendor-head">
                      <div className="left">
                        <div className="av" style={{ backgroundImage: `url(${storeProduct?.img})` }}></div>
                        <div>
                          <div className="name">
                            {store}
                            <span className="verified">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M12 2L14 4L17 3L18 6L21 7L20 10L22 12L20 14L21 17L18 18L17 21L14 20L12 22L10 20L7 21L6 18L3 17L4 14L2 12L4 10L3 7L6 6L7 3L10 4Z"/><path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
                            </span>
                          </div>
                          <div className="meta"><MapPin size={10}/> 1.4 km · Bandra West</div>
                        </div>
                      </div>
                      <span className="eta">Arrives today, 5–8 pm</span>
                    </div>

                    {list.map(item => (
                      <div key={item.id + item.size} className="cart-item">
                        <div className="thumb" style={{ backgroundImage: `url(${item.img}), ${item.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div className="info">
                          <div className="store">by {item.store}</div>
                          <div className="name">{item.name}</div>
                          <div className="variants">
                            <span className="var-chip">Size {item.size}</span>
                            <span className="var-chip"><span className="sw" style={{ background: item.color }}></span>Color</span>
                            <span className="var-chip">In stock</span>
                          </div>
                          <div className="delivery"><Truck size={12}/> Free same-day delivery</div>
                          <div className="promo">★ 12 % off with HDFC card · use HDFC10 at checkout</div>
                          <div className="actions">
                            <a onClick={() => moveToSaved(item.id, item.size)} style={{ cursor:'pointer' }}><Heart size={12}/> Save for later</a>
                            <span className="sep">·</span>
                            <a onClick={() => removeItem(item.id, item.size)} style={{ cursor:'pointer' }}><Trash2 size={12}/> Remove</a>
                            <span className="sep">·</span>
                            <a onClick={() => { setGiftWrap(v => !v); showToast(giftWrap ? 'Gift wrap removed' : `Gift wrap added · ₹49 per item`); }} style={{ cursor:'pointer', color: giftWrap ? 'var(--magenta-600)' : undefined }}>
                              <Package size={12}/> Gift wrap (₹49){giftWrap ? ' ✓' : ''}
                            </a>
                          </div>
                        </div>
                        <div className="right">
                          <div>
                            {item.oldPrice && <div className="price-old">₹{item.oldPrice.toLocaleString('en-IN')}</div>}
                            <div className="price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                            {item.oldPrice && <div className="save">Save ₹{((item.oldPrice - item.price) * item.qty).toLocaleString('en-IN')}</div>}
                          </div>
                          <div className="qty">
                            <button onClick={() => updateQty(item.id, item.size, -1)}><Minus size={12}/></button>
                            <span className="v">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.size, 1)}><Plus size={12}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* SAVE FOR LATER */}
            {savedItems.length > 0 && (
              <div className="cart-section">
                <h3>Saved for later <span className="count">{savedItems.length}</span></h3>
                <div className="sub-head">Items you stashed · move back to bag in one tap</div>
                {savedItems.slice(0, 4).map(s => (
                  <div key={s.id} className="cart-savefor">
                    <div className="thumb" style={{ backgroundImage: `url(${s.img}), ${s.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="info">
                      <div className="store">by {s.store}</div>
                      <div className="name">{s.name}</div>
                      <div className="price">₹{s.price.toLocaleString('en-IN')}</div>
                    </div>
                    <button className="move-btn" onClick={() => moveToCart(s)}>Move to bag</button>
                  </div>
                ))}
              </div>
            )}

            {/* TRUST STRIP */}
            <div className="cart-section">
              <h3>Why shop with <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>Apna</em></h3>
              <div className="cart-trust">
                <div className="item"><span className="ic"><ShieldCheck size={14}/></span><div><div className="t">100 % secure</div><div className="s">TLS · encrypted</div></div></div>
                <div className="item"><span className="ic"><RefreshCcw size={14}/></span><div><div className="t">7-day returns</div><div className="s">No questions</div></div></div>
                <div className="item"><span className="ic"><Truck size={14}/></span><div><div className="t">Free delivery</div><div className="s">Above ₹999</div></div></div>
                <div className="item"><span className="ic"><Check size={14}/></span><div><div className="t">Verified shops</div><div className="s">On-site audit</div></div></div>
              </div>
            </div>

            {/* AI RECOMMENDATIONS */}
            <div className="cart-section">
              <h3>Apna AI says <em style={{ fontStyle: 'italic', color: 'var(--magenta-600)' }}>complete the look</em></h3>
              <div className="sub-head">Customers who bought these pieces also added these · ships in the same delivery</div>
              <div className="recent-strip">
                {products.filter(p => !items.some(i => i.id === p.id)).slice(0, 6).map(p => (
                  <div key={p.id} className="recent-card" style={{ cursor:'pointer' }} onClick={() => onProductClick(p)}>
                    <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div className="body">
                      <div className="store">by {p.store}</div>
                      <div className="name">{p.name}</div>
                      <div className="price">₹{p.price.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY RAIL */}
          <aside>
            <div className="cart-summary">
              <h3>Bill summary</h3>
              <div className="sub">{items.length} items · {Object.keys(byStore).length} boutiques</div>

              {/* PROMO */}
              <div className="cart-promo">
                <input
                  className="input"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                />
                <button onClick={applyPromo}>Apply</button>
              </div>
              {promoError && <div style={{ font:'400 12px Poppins', color:'#DC2626', marginTop:-8, marginBottom:8 }}>{promoError}</div>}

              <div className="cart-coupons" style={{ marginBottom: 18 }}>
                <div className={`cart-coupon ${appliedCoupon === 'WELCOME500' ? 'applied' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => { setAppliedCoupon('WELCOME500'); showToast('Coupon WELCOME500 applied!'); }}>
                  <span className="code">WELCOME500</span>
                  <span className="desc">Flat ₹500 off above ₹2,000<small>Applied automatically · first order</small></span>
                  <span className="apply">{appliedCoupon === 'WELCOME500' ? '✓ Applied' : 'Apply'}</span>
                </div>
                <div className={`cart-coupon ${appliedCoupon === 'HDFC10' ? 'applied' : ''}`} style={{ cursor:'pointer' }}
                     onClick={() => { setAppliedCoupon('HDFC10'); showToast('Coupon HDFC10 applied — 10% off!'); }}>
                  <span className="code">HDFC10</span>
                  <span className="desc">10 % off · HDFC credit cards<small>Apply at payment · max ₹500</small></span>
                  <span className="apply">{appliedCoupon === 'HDFC10' ? '✓ Applied' : 'Tap to apply'}</span>
                </div>
              </div>

              {/* BILL */}
              <div className="cart-bill-row"><span className="l">Bag total (MRP)</span><span className="v">₹{mrp.toLocaleString('en-IN')}</span></div>
              <div className="cart-bill-row discount"><span className="l">Discount on MRP</span><span className="v">− ₹{productDiscount.toLocaleString('en-IN')}</span></div>
              {couponDiscount > 0 && (
                <div className="cart-bill-row discount"><span className="l">Coupon · {appliedCoupon}</span><span className="v">− ₹{couponDiscount}</span></div>
              )}
              {giftWrap && <div className="cart-bill-row"><span className="l">Gift wrap (×{items.length})</span><span className="v">₹{giftWrapFee}</span></div>}
              <div className="cart-bill-row"><span className="l">Subtotal</span><span className="v">₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="cart-bill-row"><span className="l">Local delivery</span><span className="v" style={{ color: delivery === 0 ? 'var(--success-500)' : '' }}>{delivery === 0 ? 'Free' : `₹${delivery}`}</span></div>
              <div className="cart-bill-row"><span className="l">Platform fee</span><span className="v">₹{platformFee}</span></div>
              <div className="cart-bill-row total"><span className="l">Total</span><span className="v">₹{total.toLocaleString('en-IN')}</span></div>
              <div className="you-save">★ You're saving ₹{totalSavings.toLocaleString('en-IN')} on this order</div>
              <button className="checkout" onClick={() => setView('checkout')}>
                <ShieldCheck size={16}/> Proceed to secure checkout
              </button>
              <div className="secure"><ShieldCheck size={11}/> 256-bit TLS · powered by Razorpay</div>

              <div className="cart-payment-icons">
                <span className="pm">UPI</span>
                <span className="pm">Visa</span>
                <span className="pm">Mastercard</span>
                <span className="pm">Rupay</span>
                <span className="pm">NetBank</span>
                <span className="pm">PayLater</span>
                <span className="pm" style={{ background: 'var(--success-100)', color: '#0E7C4D', borderColor: 'transparent' }}>COD</span>
              </div>

              <div style={{ marginTop: 20, padding: 14, background: 'var(--gradient-velvet)', borderRadius: 14, color: '#fff' }}>
                <div style={{ font: '500 10px Poppins', textTransform: 'uppercase', letterSpacing: '0.22em', color: '#FF55B0' }}>App-only · save more</div>
                <div style={{ font: '600 15px Playfair Display', marginTop: 4 }}>Extra 5 % off in the <em style={{ fontStyle: 'italic', color: '#FFEDF7' }}>app</em></div>
                <div style={{ font: '400 11px Poppins', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Scan or tap to open this cart in the iOS / Android app · ₹{Math.round(total * 0.05)} extra off.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}



export default function CartPage() {
  const router = useRouter();
  const { items, setItems, addToCart } = useCart();
  const [wishlist, setWishlist] = React.useState(new Set());
  const toggleWishlist = (id) => setWishlist(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });
  const nav = (v) => { const m = { home:'/', nearby:'/nearby-shops', wishlist:'/wishlist', account:'/account', checkout:'/checkout' }; router.push(m[v] ?? '/'); };
  return (
    <>
      <Header setView={nav} />
      <CartView
        items={items}
        setItems={setItems}
        setView={nav}
        onProductClick={(id) => router.push('/product/' + id)}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
      <Footer />
    </>
  );
}
