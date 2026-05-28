'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Check, Clock, Heart, Layers, MapPin, Package, RefreshCcw, ShieldCheck, Truck, User, Wallet, X } from 'lucide-react';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
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

const NOTIF_ITEMS = [
  ['Price drop alerts', 'When wishlisted items go on sale at your saved boutiques'],
  ['Back in stock', 'When out-of-stock wishlist items return'],
  ['Order updates', 'Status changes — packed, shipped, delivered'],
  ['New boutiques nearby', 'When a new shop opens within 5 km'],
  ['Weekly editorial', 'Stylist-curated edits and lookbooks'],
  ['Marketing offers', 'Sale events, coupon drops, brand promotions'],
];
const NOTIF_DEFAULTS = [true, true, true, true, false, false];

function AccountView({ setView, onProductClick }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { products } = AFM_DATA;
  const [tab, setTab] = useState('orders');
  const [notifOn, setNotifOn] = useState(NOTIF_DEFAULTS);
  const [recentProds, setRecentProds] = useState([]);
  const [toast, setToast] = useState(null);
  const [showInvoice, setShowInvoice] = useState(null);
  const [editingAddr, setEditingAddr] = useState(null);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 98210 ••••• 47',
    city: 'Mumbai · Bandra West', topSize: 'M · Bust 36"', bottomSize: '28 / S',
    style: 'Ethnic · Handloom · Editorial', language: 'English · Hindi',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const ids = getRecentlyViewed();
    setRecentProds(ids.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean).slice(0, 12));
  }, []);

  const toggleNotif = (i) => setNotifOn(prev => prev.map((v, idx) => idx === i ? !v : v));

  const orders = [
    {
      id: 'AFM-ORD-2845-X9K2', date: '14 May 2026', status: 'delivered', total: 4899,
      product: products[0], qty: 1, eta: 'Delivered yesterday',
      timeline: [
        { lab: 'Placed', time: '14 May · 11:24', done: true },
        { lab: 'Confirmed', time: '14 May · 12:08', done: true },
        { lab: 'Packed', time: '14 May · 4:18', done: true },
        { lab: 'Out for delivery', time: '15 May · 9:42', done: true },
        { lab: 'Delivered', time: '15 May · 5:36 pm', done: true },
      ],
    },
    {
      id: 'AFM-ORD-2839-A4N7', date: '13 May 2026', status: 'in_transit', total: 2199,
      product: products[6] || products[3], qty: 1, eta: 'Arrives today, 5–8 pm',
      timeline: [
        { lab: 'Placed', time: '13 May · 22:01', done: true },
        { lab: 'Confirmed', time: '14 May · 08:14', done: true },
        { lab: 'Packed', time: '15 May · 11:30', done: true },
        { lab: 'Out for delivery', time: '17 May · 13:02', cur: true },
        { lab: 'Delivered', time: 'Today, 5–8 pm', done: false },
      ],
    },
    {
      id: 'AFM-ORD-2820-K3M1', date: '08 May 2026', status: 'processing', total: 1499,
      product: products[10] || products[2], qty: 2, eta: 'Vendor processing',
      timeline: [
        { lab: 'Placed', time: '08 May · 14:55', done: true },
        { lab: 'Confirmed', time: '08 May · 16:12', cur: true },
        { lab: 'Packed', time: '—', done: false },
        { lab: 'Out for delivery', time: '—', done: false },
        { lab: 'Delivered', time: 'Est. 22 May', done: false },
      ],
    },
  ];

  return (
    <main>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background: toast.type==='error' ? '#DC2626' : 'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', maxWidth:340 }}>
          {toast.msg}
        </div>
      )}

      {/* Invoice modal */}
      {showInvoice && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
             onClick={() => setShowInvoice(null)}>
          <div style={{ background:'#fff', borderRadius:20, padding:32, maxWidth:480, width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ margin:0, font:'600 20px Playfair Display', color:'var(--navy-800)' }}>Invoice · {showInvoice.id}</h3>
              <button style={{ background:'transparent', border:0, cursor:'pointer', color:'var(--fg-muted)' }} onClick={() => setShowInvoice(null)}><X size={18}/></button>
            </div>
            <div style={{ font:'400 13px Poppins', color:'var(--fg-body)', lineHeight:1.7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, borderBottom:'1px solid var(--afm-border)', marginBottom:8 }}>
                <span>Order date</span><strong>{showInvoice.date}</strong>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, borderBottom:'1px solid var(--afm-border)', marginBottom:8 }}>
                <span>{showInvoice.product?.name}</span><strong>₹{showInvoice.total.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, borderBottom:'1px solid var(--afm-border)', marginBottom:8 }}>
                <span>Local delivery</span><strong style={{ color:'var(--success-500)' }}>Free</strong>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:600, color:'var(--navy-800)' }}>
                <span>Total paid</span><span>₹{showInvoice.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="afm-btn afm-btn-primary" style={{ marginTop:20, width:'100%' }}
                    onClick={() => { showToast('Invoice PDF emailed to priya.s@gmail.com'); setShowInvoice(null); }}>
              Email invoice PDF →
            </button>
          </div>
        </div>
      )}

      <div className="container acc-page">
        <aside className="acc-side">
          <div className="user">
            <div className="av">P</div>
            <div>
              <div className="name">Priya Sharma</div>
              <div className="since">Member since 2024</div>
            </div>
          </div>
          <h5>Shop</h5>
          <nav>
            <a className={tab === 'orders' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('orders')}><Package size={14}/> Orders &amp; tracking</a>
            <a style={{ cursor:'pointer' }} onClick={() => setView('wishlist')}><Heart size={14}/> Wishlist</a>
            <a className={tab === 'returns' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('returns')}><RefreshCcw size={14}/> Returns &amp; refunds</a>
            <a className={tab === 'recently_viewed' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('recently_viewed')}><Layers size={14}/> Recently viewed</a>
          </nav>
          <h5>Account</h5>
          <nav>
            <a className={tab === 'profile' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('profile')}><User size={14}/> Profile</a>
            <a className={tab === 'addresses' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('addresses')}><MapPin size={14}/> Saved addresses</a>
            <a className={tab === 'payments' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('payments')}><Wallet size={14}/> Payments &amp; wallet</a>
            <a className={tab === 'notifications' ? 'on' : ''} style={{ cursor:'pointer' }} onClick={() => setTab('notifications')}><Bell size={14}/> Notification settings</a>
          </nav>
          <h5>Help</h5>
          <nav>
            <Link href="/legal/privacy"><ShieldCheck size={14}/> Help center</Link>
            <Link href="/legal/privacy"><ShieldCheck size={14}/> Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <a style={{ color: 'var(--danger-500)', cursor:'pointer' }} onClick={() => { showToast('Signed out successfully'); setTimeout(() => router.push('/'), 1000); }}><X size={14}/> Sign out</a>
          </nav>
        </aside>

        <div className="acc-main">
          <h1>Your <em>account</em>.</h1>
          <div className="sub">3 active orders · 28 items wishlisted · ₹420 in Apna Wallet</div>

          <div className="acc-tabs">
            <span className={`tab ${tab === 'orders' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('orders')}>Orders ({orders.length})</span>
            <span className={`tab ${tab === 'returns' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('returns')}>Returns</span>
            <span className={`tab ${tab === 'addresses' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('addresses')}>Addresses</span>
            <span className={`tab ${tab === 'payments' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('payments')}>Payments</span>
            <span className={`tab ${tab === 'notifications' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('notifications')}>Notifications</span>
            <span className={`tab ${tab === 'profile' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('profile')}>Profile</span>
          </div>

          {tab === 'orders' && (
            <div>
              {orders.map(o => {
                const statusLine = o.status === 'delivered'
                  ? { cls: '', txt: 'Delivered · rate your purchase', sub: o.eta, btn: 'Rate boutique' }
                  : o.status === 'in_transit'
                    ? { cls: 'info', txt: 'On the way', sub: o.eta, btn: 'Track live' }
                    : { cls: 'warn', txt: 'Vendor is preparing your order', sub: o.eta, btn: 'Contact shop' };
                return (
                  <article key={o.id} className="order-card">
                    <div className="head">
                      <div><div className="ll">Order placed</div><div className="vv">{o.date}</div></div>
                      <div><div className="ll">Total</div><div className="vv">₹{o.total.toLocaleString('en-IN')}</div></div>
                      <div><div className="ll">Order ID</div><div className="vv id">{o.id}</div></div>
                      <div className="actions">
                        <button className="adm-btn" onClick={() => setShowInvoice(o)}>View invoice</button>
                        <button className="adm-btn" onClick={() => router.push('/legal/privacy')}>Help</button>
                      </div>
                    </div>
                    <div className="body">
                      <div className="thumb" style={{ backgroundImage: `url(${o.product.img}), ${o.product.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      <div className="info">
                        <div className="name">{o.product.name}</div>
                        <div className="store">by {o.product.store}</div>
                        <div className="meta">Qty {o.qty} · Size M · Bandra West, Mumbai</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="adm-btn" onClick={() => { addToCart(o.product, 'M', o.product.colors?.[0] || '#001F3F'); showToast(`${o.product.name} added to bag!`); }}>Buy again</button>
                        {o.status === 'delivered' && (
                          <button className="adm-btn adm-btn-primary" onClick={() => { showToast('Return request initiated — pickup scheduled within 24 hours'); }}>Return</button>
                        )}
                      </div>
                    </div>
                    <div className={`status-line ${statusLine.cls}`}>
                      <span className="ic">{o.status === 'delivered' ? <Check size={14}/> : o.status === 'in_transit' ? <Truck size={14}/> : <RefreshCcw size={14}/>}</span>
                      <div className="text">{statusLine.txt}<small>{statusLine.sub}</small></div>
                      <button className="track-btn" onClick={() => {
                        if (o.status === 'delivered') showToast('Thanks! Your review has been noted ⭐');
                        else if (o.status === 'in_transit') showToast(`Tracking: Out for delivery · Est. ${o.eta}`);
                        else showToast('Shop contacted — they will respond within 2 hours');
                      }}>{statusLine.btn}</button>
                    </div>
                    <div className="track-timeline">
                      {o.timeline.map((t, i) => (
                        <div key={i} className={`track-step ${t.done ? 'done' : t.cur ? 'cur' : ''}`}>
                          <div className="dot">{t.done ? '✓' : t.cur ? '●' : ''}</div>
                          <div className="lab">{t.lab}</div>
                          <div className="time">{t.time}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Saved addresses <span className="count">3</span></h3>
              {[
                { lab: 'HOME · default', name: 'Priya Sharma', body: '14, Carter Road, near Carter Sq Café · Bandra West · Mumbai 400050', phone: '+91 98210 ••••• 47' },
                { lab: 'WORK', name: 'Priya Sharma', body: 'Indiabulls Centre, 14th floor · Senapati Bapat Marg · Mumbai 400013', phone: '+91 98210 ••••• 47' },
                { lab: 'MOTHER', name: 'Lata Sharma', body: '7, Saraswati Vihar · CG Road · Ahmedabad 380009', phone: '+91 99250 ••••• 12' },
              ].map((a, i) => (
                <div key={i} className="cart-addr" style={{ marginBottom: 10 }}>
                  <span className="ic"><MapPin size={16}/></span>
                  <div className="info">
                    <div className="lab">{a.lab}</div>
                    <div className="name">{a.name}</div>
                    {editingAddr === i ? (
                      <div style={{ marginTop:6 }}>
                        <input defaultValue={a.body} style={{ width:'100%', border:'1px solid var(--afm-border)', borderRadius:8, padding:'6px 10px', font:'400 13px Poppins', marginBottom:6 }}/>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="afm-btn afm-btn-primary" style={{ fontSize:12, padding:'4px 12px' }}
                                  onClick={() => { setEditingAddr(null); showToast(`Address "${a.lab}" updated`); }}>Save</button>
                          <button className="afm-btn afm-btn-ghost" style={{ fontSize:12, padding:'4px 12px' }} onClick={() => setEditingAddr(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="body">{a.body}</div>
                        <div className="phone">{a.phone}</div>
                      </>
                    )}
                  </div>
                  {editingAddr !== i && <button className="change" onClick={() => setEditingAddr(i)}>Edit</button>}
                </div>
              ))}
              {showAddAddr ? (
                <div style={{ padding:'12px 16px', border:'1px solid var(--afm-border)', borderRadius:12, marginTop:8 }}>
                  <input placeholder="Address label (HOME, WORK, etc.)" value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)}
                         style={{ width:'100%', border:'1px solid var(--afm-border)', borderRadius:8, padding:'8px 12px', font:'400 13px Poppins', marginBottom:8 }}/>
                  <input placeholder="Full address, area, PIN" style={{ width:'100%', border:'1px solid var(--afm-border)', borderRadius:8, padding:'8px 12px', font:'400 13px Poppins', marginBottom:8 }}/>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="afm-btn afm-btn-primary" style={{ fontSize:12 }}
                            onClick={() => { setShowAddAddr(false); setNewAddrLabel(''); showToast('New address saved!'); }}>Save address</button>
                    <button className="afm-btn afm-btn-ghost" style={{ fontSize:12 }} onClick={() => setShowAddAddr(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="afm-btn afm-btn-ghost" style={{ marginTop: 8 }} onClick={() => setShowAddAddr(true)}>+ Add new address</button>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Saved payment methods</h3>
              <div className="sub-head">Cards are tokenised via Razorpay — we never see the number.</div>
              <div className="cart-addr" style={{ marginBottom: 10 }}>
                <span className="ic" style={{ background: 'var(--navy-800)' }}><Wallet size={14}/></span>
                <div className="info">
                  <div className="lab">HDFC Bank · CREDIT</div>
                  <div className="name">Priya Sharma</div>
                  <div className="body">•••• •••• •••• 4209 · expires 11/27</div>
                </div>
                <button className="change" onClick={() => showToast('HDFC card set as default payment method')}>Default</button>
              </div>
              <div className="cart-addr" style={{ marginBottom: 10 }}>
                <span className="ic" style={{ background: 'var(--magenta-600)' }}><Wallet size={14}/></span>
                <div className="info">
                  <div className="lab">UPI</div>
                  <div className="name">priya@oksbi</div>
                  <div className="body">Verified · last used 2 days ago</div>
                </div>
                <button className="change" onClick={() => showToast('UPI management — update your VPA in the app')}>Manage</button>
              </div>
              <div className="cart-addr" style={{ background: 'var(--gold-100)' }}>
                <span className="ic" style={{ background: 'var(--gold-500)' }}><Wallet size={14}/></span>
                <div className="info">
                  <div className="lab">APNA WALLET</div>
                  <div className="name">₹420 available</div>
                  <div className="body">Earned via reviews · 1 ₹ = 1 wallet point on apparel above ₹999</div>
                </div>
                <button className="change" onClick={() => showToast('Wallet top-up via UPI or card — coming in the app')}>Top up</button>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Profile &amp; preferences</h3>
              <div className="sub-head">Used to personalise nearby shop suggestions + size recommendations.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                {[
                  ['Full name', 'name'],
                  ['Email', 'email'],
                  ['Phone', 'phone'],
                  ['Default city', 'city'],
                  ['Sizes — top', 'topSize'],
                  ['Sizes — bottom', 'bottomSize'],
                  ['Style preferences', 'style'],
                  ['Language', 'language'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <div style={{ font: '500 11px Poppins', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 4 }}>{label}</div>
                    <input
                      value={profileForm[key]}
                      onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width:'100%', border:'1px solid var(--afm-border)', borderRadius:8, padding:'7px 10px', font:'500 14px Poppins', color:'var(--navy-800)', background:'#fff' }}
                    />
                  </div>
                ))}
              </div>
              <button className="afm-btn afm-btn-primary" style={{ marginTop: 22 }}
                      onClick={() => showToast('Profile changes saved successfully!')}>Save changes</button>
            </div>
          )}

          {tab === 'returns' && (
            <div>
              <article className="order-card">
                <div className="head">
                  <div><div className="ll">Return initiated</div><div className="vv">10 May 2026</div></div>
                  <div><div className="ll">Refund amount</div><div className="vv">₹4,899</div></div>
                  <div><div className="ll">Return ID</div><div className="vv id">AFM-RET-1042-P7W3</div></div>
                  <div className="actions">
                    <button className="adm-btn" onClick={() => showToast('Connecting you to support — avg. response 2 hours')}>Contact support</button>
                  </div>
                </div>
                <div className="body">
                  <div className="thumb" style={{ backgroundImage: `url(${orders[0].product.img}), ${orders[0].product.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="info">
                    <div className="name">{orders[0].product.name}</div>
                    <div className="store">by {orders[0].product.store}</div>
                    <div className="meta">Qty 1 · Size M · Reason: Wrong size received</div>
                  </div>
                </div>
                <div className="status-line">
                  <span className="ic"><Clock size={14}/></span>
                  <div className="text">Refund in progress<small>₹4,899 will be credited to your HDFC card within 3–5 business days</small></div>
                </div>
                <div className="track-timeline">
                  {[
                    { lab: 'Return requested', time: '10 May · 18:22', done: true },
                    { lab: 'Pickup scheduled', time: '11 May · 10:00', done: true },
                    { lab: 'Item collected', time: '11 May · 14:35', done: true },
                    { lab: 'Boutique acknowledged', time: '12 May · 09:18', cur: true },
                    { lab: 'Refund credited', time: 'Est. 16 May', done: false },
                  ].map((t, i) => (
                    <div key={i} className={`track-step ${t.done ? 'done' : t.cur ? 'cur' : ''}`}>
                      <div className="dot">{t.done ? '✓' : t.cur ? '●' : ''}</div>
                      <div className="lab">{t.lab}</div>
                      <div className="time">{t.time}</div>
                    </div>
                  ))}
                </div>
              </article>
              <div style={{ marginTop: 18, padding: '14px 18px', background: 'var(--neutral-50)', borderRadius: 12, font: '400 13px Poppins', color: 'var(--fg-muted)' }}>
                <strong style={{ color: 'var(--navy-800)' }}>Return policy reminder:</strong> Returns are free within 7 days. The same delivery partner picks up from your door — no drop-off needed.{' '}
                <Link href="/legal/returns" style={{ color: 'var(--magenta-600)', textDecoration: 'underline' }}>Full policy →</Link>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Notification settings</h3>
              <div className="sub-head" style={{ marginBottom: 16 }}>Choose which alerts you'd like to receive via push, email, and SMS.</div>
              {NOTIF_ITEMS.map(([t, s], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--afm-border)' }}>
                  <div>
                    <div style={{ font: '500 14px Poppins', color: 'var(--navy-800)' }}>{t}</div>
                    <div style={{ font: '400 12px Poppins', color: 'var(--fg-muted)', marginTop: 2 }}>{s}</div>
                  </div>
                  <button
                    aria-label={notifOn[i] ? `Disable ${t}` : `Enable ${t}`}
                    onClick={() => toggleNotif(i)}
                    style={{ width: 44, height: 24, borderRadius: 99, background: notifOn[i] ? 'var(--magenta-600)' : 'var(--neutral-300)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', [notifOn[i] ? 'right' : 'left']: 3, top: 3, width: 18, height: 18, borderRadius: 99, background: '#fff', transition: 'left 0.2s, right 0.2s' }}></span>
                  </button>
                </div>
              ))}
              <button className="afm-btn afm-btn-primary" style={{ marginTop: 20 }}
                      onClick={() => showToast('Notification preferences saved!')}>Save preferences</button>
            </div>
          )}
          {tab === 'recently_viewed' && (
            <div>
              <h3 style={{ margin: '0 0 6px' }}>Recently viewed</h3>
              <div className="sub-head" style={{ marginBottom: 20 }}>Products you browsed recently — across all your sessions on this device.</div>
              {recentProds.length === 0
                ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--fg-muted)', font: '400 14px Poppins' }}>
                    <Layers size={32} style={{ opacity: 0.3, marginBottom: 12 }}/>
                    <div>No browsing history yet.</div>
                    <div style={{ marginTop: 4, fontSize: 12 }}>Products you view will appear here for quick access.</div>
                    <button className="afm-btn afm-btn-ghost" style={{ marginTop: 16 }} onClick={() => onProductClick(AFM_DATA.products[0]?.id)}>Browse products</button>
                  </div>
                ) : (
                  <div className="product-grid">
                    {recentProds.map(p => (
                      <article key={p.id} className="product-card" style={{ animation: 'none', opacity: 1, cursor: 'pointer' }} onClick={() => onProductClick(p.id)}>
                        <div className="img" style={{ backgroundImage: `url(${p.img}), ${p.bg}`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div className="body">
                          <div className="store">by {p.store}</div>
                          <div className="name">{p.name}</div>
                          <div className="price-row"><span className="price">₹{p.price.toLocaleString('en-IN')}</span></div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



export default function CustomerDashboard() {
  const router = useRouter();
  const nav = (v) => { const m = { home:'/', nearby:'/nearby-shops', product:'/product', cart:'/cart', wishlist:'/wishlist' }; router.push(m[v] ?? '/'); };
  return (
    <>
      <Header setView={nav} />
      <AccountView setView={nav} onProductClick={(id) => router.push('/product/' + id)} />
      <Footer />
    </>
  );
}
