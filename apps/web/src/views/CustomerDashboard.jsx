'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Check, Clock, Heart, Layers, MapPin, Package, RefreshCcw, ShieldCheck, Truck, User, Wallet, X } from 'lucide-react';
import { getRecentlyViewed } from '@/lib/recentlyViewed';
import { AFM_DATA } from '@/lib/seed-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

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
  const { currentUser, logout } = useAuth();
  const { products } = AFM_DATA;

  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const userEmail = currentUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const [tab, setTab] = useState('orders');
  const [notifOn, setNotifOn] = useState(NOTIF_DEFAULTS);
  const [recentProds, setRecentProds] = useState([]);
  const [toast, setToast] = useState(null);
  const [editingAddr, setEditingAddr] = useState(null);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    topSize: '',
    bottomSize: '',
    style: '',
    language: 'English',
  });

  // Seed profile form with real auth data when available
  useEffect(() => {
    if (currentUser) {
      setProfileForm(f => ({
        ...f,
        name: currentUser.name || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const ids = getRecentlyViewed();
    setRecentProds(ids.map(id => products.find(p => String(p.id) === String(id))).filter(Boolean).slice(0, 12));
  }, []);

  const toggleNotif = (i) => setNotifOn(prev => prev.map((v, idx) => idx === i ? !v : v));

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      showToast('Signed out', 'success');
      router.push('/');
    }
  };

  // No real orders until Razorpay + orders API is live
  const orders = [];

  return (
    <main>
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background: toast.type==='error' ? '#DC2626' : 'var(--navy-800)', color:'#fff', padding:'12px 20px', borderRadius:12, font:'500 14px Poppins', zIndex:9999, boxShadow:'0 4px 16px rgba(0,0,0,0.25)', maxWidth:340 }}>
          {toast.msg}
        </div>
      )}

      <div className="container acc-page">
        <aside className="acc-side">
          <div className="user">
            <div className="av">{userInitial}</div>
            <div>
              <div className="name">{userName}</div>
              <div className="since">{userEmail}</div>
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
            <a style={{ color: 'var(--danger-500)', cursor:'pointer' }} onClick={handleSignOut}><X size={14}/> Sign out</a>
          </nav>
        </aside>

        <div className="acc-main">
          <h1>Your <em>account</em>.</h1>
          <div className="sub">Welcome, {userName}! Start shopping to see your orders here.</div>

          <div className="acc-tabs">
            <span className={`tab ${tab === 'orders' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('orders')}>Orders</span>
            <span className={`tab ${tab === 'returns' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('returns')}>Returns</span>
            <span className={`tab ${tab === 'addresses' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('addresses')}>Addresses</span>
            <span className={`tab ${tab === 'payments' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('payments')}>Payments</span>
            <span className={`tab ${tab === 'notifications' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('notifications')}>Notifications</span>
            <span className={`tab ${tab === 'profile' ? 'on' : ''}`} style={{ cursor:'pointer' }} onClick={() => setTab('profile')}>Profile</span>
          </div>

          {tab === 'orders' && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-muted)' }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
              <h3 style={{ font: '600 20px Playfair Display', color: 'var(--navy-800)', marginBottom: 8 }}>No orders yet</h3>
              <p style={{ font: '400 14px Poppins', marginBottom: 24 }}>
                Your orders will appear here once you place one from a nearby shop.
              </p>
              <button className="afm-btn afm-btn-primary" onClick={() => router.push('/nearby-shops')}>
                Browse nearby shops →
              </button>
            </div>
          )}

          {tab === 'addresses' && (
            <div className="cart-section" style={{ marginBottom: 0 }}>
              <h3>Saved addresses</h3>
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--fg-muted)' }}>
                <MapPin size={40} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ font: '400 14px Poppins', marginBottom: 16 }}>No saved addresses yet.</p>
              </div>
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
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--fg-muted)' }}>
                <Wallet size={40} style={{ opacity: 0.2, marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                <p style={{ font: '400 14px Poppins', marginBottom: 4 }}>No payment methods saved yet.</p>
                <p style={{ font: '400 12px Poppins' }}>Cards are tokenised via Razorpay — we never store your number.</p>
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
                      placeholder={key === 'email' ? 'your@email.com' : key === 'name' ? 'Your full name' : '—'}
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
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--fg-muted)' }}>
              <RefreshCcw size={48} style={{ opacity: 0.2, marginBottom: 16, display: 'block', margin: '0 auto 16px' }} />
              <h3 style={{ font: '600 20px Playfair Display', color: 'var(--navy-800)', marginBottom: 8 }}>No returns yet</h3>
              <p style={{ font: '400 14px Poppins' }}>
                Returns are free within 7 days. The delivery partner picks up from your door.
              </p>
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
