'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Check, Heart, Layers, MapPin, Package, RefreshCcw, ShieldCheck, Truck, User, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const sv = variant === 'primary' ? 'default' : variant === 'ghost' ? 'outline' : variant === 'on-dark' ? 'secondary' : 'ghost';
  return <Button variant={sv} size={size} onClick={onClick} className={className}>{children}</Button>;
}




function AccountView({ setView, onProductClick }) {
  const I = AfmIcons;
  const { products } = AFM_DATA;
  const [tab, setTab] = useState('orders');

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
            <a className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}><Package size={14}/> Orders &amp; tracking</a>
            <a onClick={() => setView('wishlist')}><Heart size={14}/> Wishlist</a>
            <a className={tab === 'returns' ? 'on' : ''} onClick={() => setTab('returns')}><RefreshCcw size={14}/> Returns &amp; refunds</a>
            <a><Layers size={14}/> Recently viewed</a>
          </nav>
          <h5>Account</h5>
          <nav>
            <a className={tab === 'profile' ? 'on' : ''} onClick={() => setTab('profile')}><User size={14}/> Profile</a>
            <a className={tab === 'addresses' ? 'on' : ''} onClick={() => setTab('addresses')}><MapPin size={14}/> Saved addresses</a>
            <a className={tab === 'payments' ? 'on' : ''} onClick={() => setTab('payments')}><Wallet size={14}/> Payments &amp; wallet</a>
            <a className={tab === 'notifications' ? 'on' : ''} onClick={() => setTab('notifications')}><Heart size={14}/> Notification settings</a>
          </nav>
          <h5>Help</h5>
          <nav>
            <a><ShieldCheck size={14}/> Help center</a>
            <a href="legal.html?doc=privacy"><ShieldCheck size={14}/> Privacy</a>
            <a href="legal.html?doc=terms">Terms</a>
            <a style={{ color: 'var(--danger-500)' }}><X size={14}/> Sign out</a>
          </nav>
        </aside>

        <div className="acc-main">
          <h1>Your <em>account</em>.</h1>
          <div className="sub">3 active orders · 28 items wishlisted · ₹420 in Apna Wallet</div>

          <div className="acc-tabs">
            <span className={`tab ${tab === 'orders' ? 'on' : ''}`} onClick={() => setTab('orders')}>Orders ({orders.length})</span>
            <span className={`tab ${tab === 'returns' ? 'on' : ''}`} onClick={() => setTab('returns')}>Returns (0)</span>
            <span className={`tab ${tab === 'addresses' ? 'on' : ''}`} onClick={() => setTab('addresses')}>Addresses (3)</span>
            <span className={`tab ${tab === 'payments' ? 'on' : ''}`} onClick={() => setTab('payments')}>Payments</span>
            <span className={`tab ${tab === 'profile' ? 'on' : ''}`} onClick={() => setTab('profile')}>Profile</span>
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
                        <button className="adm-btn">View invoice</button>
                        <button className="adm-btn">Help</button>
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
                        <button className="adm-btn">Buy again</button>
                        {o.status === 'delivered' && <button className="adm-btn adm-btn-primary">Return</button>}
                      </div>
                    </div>
                    <div className={`status-line ${statusLine.cls}`}>
                      <span className="ic">{o.status === 'delivered' ? <Check size={14}/> : o.status === 'in_transit' ? <Truck size={14}/> : <RefreshCcw size={14}/>}</span>
                      <div className="text">{statusLine.txt}<small>{statusLine.sub}</small></div>
                      <button className="track-btn">{statusLine.btn}</button>
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
                    <div className="body">{a.body}</div>
                    <div className="phone">{a.phone}</div>
                  </div>
                  <button className="change">Edit</button>
                </div>
              ))}
              <button className="afm-btn afm-btn-ghost" style={{ marginTop: 8 }}>+ Add new address</button>
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
                <button className="change">Default</button>
              </div>
              <div className="cart-addr" style={{ marginBottom: 10 }}>
                <span className="ic" style={{ background: 'var(--magenta-600)' }}><Wallet size={14}/></span>
                <div className="info">
                  <div className="lab">UPI</div>
                  <div className="name">priya@oksbi</div>
                  <div className="body">Verified · last used 2 days ago</div>
                </div>
                <button className="change">Manage</button>
              </div>
              <div className="cart-addr" style={{ background: 'var(--gold-100)' }}>
                <span className="ic" style={{ background: 'var(--gold-500)' }}><Wallet size={14}/></span>
                <div className="info">
                  <div className="lab">APNA WALLET</div>
                  <div className="name">₹420 available</div>
                  <div className="body">Earned via reviews · 1 ₹ = 1 wallet point on apparel above ₹999</div>
                </div>
                <button className="change">Top up</button>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Profile &amp; preferences</h3>
              <div className="sub-head">Used to personalise nearby shop suggestions + size recommendations.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                {[
                  ['Full name', 'Priya Sharma'],
                  ['Email', 'priya.s@gmail.com'],
                  ['Phone', '+91 98210 ••••• 47'],
                  ['Default city', 'Mumbai · Bandra West'],
                  ['Sizes — top', 'M · Bust 36"'],
                  ['Sizes — bottom', '28 / S'],
                  ['Style preferences', 'Ethnic · Handloom · Editorial'],
                  ['Language', 'English · Hindi'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ font: '500 11px Poppins', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 4 }}>{k}</div>
                    <div style={{ font: '500 14px Poppins', color: 'var(--navy-800)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <button className="afm-btn afm-btn-primary" style={{ marginTop: 22 }}>Save changes</button>
            </div>
          )}

          {tab === 'returns' && (
            <div className="wish-empty" style={{ background: '#fff' }}>
              <img src="/brand-icons/hanger-glyph.svg" alt=""/>
              <h2>No <em>returns</em> in flight.</h2>
              <p>When you initiate a return, it'll show up here with its status. Returns are free + picked up by the same delivery partner.</p>
              <AfmButton variant="ghost">Read our return policy</AfmButton>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Notification settings</h3>
              {[
                ['Price drop alerts', 'When wishlisted items go on sale at your saved boutiques', true],
                ['Back in stock', 'When out-of-stock wishlist items return', true],
                ['Order updates', 'Status changes — packed, shipped, delivered', true],
                ['New boutiques nearby', 'When a new shop opens within 5 km', true],
                ['Weekly editorial', 'Stylist-curated edits and lookbooks', false],
                ['Marketing offers', 'Sale events, coupon drops, brand promotions', false],
              ].map(([t, s, on], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ font: '500 14px Poppins', color: 'var(--navy-800)' }}>{t}</div>
                    <div style={{ font: '400 12px Poppins', color: 'var(--fg-muted)', marginTop: 2 }}>{s}</div>
                  </div>
                  <span style={{ width: 44, height: 24, borderRadius: 99, background: on ? 'var(--magenta-600)' : 'var(--neutral-300)', position: 'relative' }}>
                    <span style={{ position: 'absolute', [on ? 'right' : 'left']: 3, top: 3, width: 18, height: 18, borderRadius: 99, background: '#fff' }}></span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}



export default AccountView;
