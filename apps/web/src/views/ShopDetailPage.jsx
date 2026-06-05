'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, BadgeCheck, Clock, ExternalLink,
  MapPin, Phone, ShoppingBag, Star, Store, Tag,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getStoreById, getProductsByStore } from '@/lib/api';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

// ── helpers ───────────────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// ── loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      <Header />
      <main style={{ background: '#F8F9FB', minHeight: '80vh' }}>
        <div className="container" style={{ paddingTop: 40 }}>
          <div style={{ height: 300, borderRadius: 20, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 24 }}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 240, borderRadius: 16, background: '#f0f0f0' }}/>)}
          </div>
        </div>
      </main>
      <Footer/>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </>
  );
}

// ── unclaimed shop view (auto-generated from Geoapify) ────────────────────────

function UnclaimedShopView({ name, address, shopLat, shopLng, hours, phone, type, userLat, userLng }) {
  const router  = useRouter();
  const distKm  = (userLat && userLng && shopLat && shopLng)
    ? haversineKm(userLat, userLng, shopLat, shopLng) : null;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}`;

  return (
    <>
      <Header setView={v => { const m={home:'/',cart:'/cart',wishlist:'/wishlist',account:'/account',categories:'/categories'}; router.push(m[v]??'/'); }}/>
      <main style={{ background: '#F8F9FB', minHeight: '80vh' }}>

        {/* breadcrumb */}
        <div className="container" style={{ paddingTop: 20 }}>
          <Link href="/nearby-shops" style={{ display:'inline-flex', alignItems:'center', gap:6, font:'500 13px Poppins', color:'var(--fg-muted)', textDecoration:'none' }}>
            <ArrowLeft size={14}/> Back to Nearby Shops
          </Link>
        </div>

        {/* hero */}
        <div style={{ background:'linear-gradient(135deg,var(--navy-800) 0%,#6D1B5C 60%,var(--magenta-600) 100%)', padding:'40px 0 60px', marginTop:12 }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
              <div style={{ width:80, height:80, borderRadius:20, background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, flexShrink:0 }}>🛍</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                  <h1 style={{ font:'700 28px/1.1 Playfair Display', color:'#fff', margin:0, letterSpacing:'-0.02em' }}>{name}</h1>
                  <span style={{ background:'rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.85)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:20, padding:'3px 12px', fontSize:11, fontFamily:'Poppins', fontWeight:600 }}>
                    Not yet on AFM
                  </span>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
                  {address && <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:'Poppins' }}><MapPin size={13}/> {address}</span>}
                  {distKm  && <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:'Poppins' }}><Store size={13}/> {distKm} km from you</span>}
                  {type    && <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:'Poppins' }}><Tag size={13}/> {type}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="container" style={{ marginTop:-24 }}>
          <div className="shop-detail-grid">

            {/* left column */}
            <div>
              {/* become a seller CTA */}
              <div style={{ background:'#fff', borderRadius:20, padding:'32px 28px', marginBottom:24, border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ width:52, height:52, borderRadius:14, flexShrink:0, background:'#FFF0F8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>🏪</div>
                  <div style={{ flex:1 }}>
                    <h2 style={{ font:'700 20px Playfair Display', color:'var(--navy-800)', margin:'0 0 8px', letterSpacing:'-0.01em' }}>
                      Is this <em style={{ fontStyle:'italic', color:'var(--magenta-600)' }}>your shop?</em>
                    </h2>
                    <p style={{ font:'400 14px/1.6 Poppins', color:'var(--fg-muted)', margin:'0 0 20px' }}>
                      Thousands of nearby customers are searching for fashion. Create your free digital storefront on Apna Fashion Mart — upload products, manage orders, and grow your local business online.
                    </p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:20 }}>
                      {[['🛍','Your own product catalog'],['📦','Order management'],['📍','Appear on the local map'],['💰','Weekly payouts']].map(([icon, text]) => (
                        <div key={text} style={{ display:'flex', alignItems:'center', gap:6, font:'500 12px Poppins', color:'var(--navy-800)', background:'#F8F9FB', borderRadius:8, padding:'6px 12px' }}>
                          <span>{icon}</span> {text}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                      <Link href="/shop-login" className="afm-btn afm-btn-primary" style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                        <ShoppingBag size={16}/> Become a Seller — It's Free
                      </Link>
                      <Link href="/become-a-seller" className="afm-btn afm-btn-ghost">Learn more</Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* empty products grid */}
              <div style={{ background:'#fff', borderRadius:20, padding:'28px', border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                <h2 style={{ font:'600 20px Playfair Display', color:'var(--navy-800)', margin:'0 0 6px' }}>Products</h2>
                <p style={{ font:'400 13px Poppins', color:'var(--fg-muted)', margin:'0 0 24px' }}>No products listed yet — this shop hasn't joined the platform.</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ height:190, borderRadius:14, background:'linear-gradient(135deg,#F1F3F6 0%,#E5E8ED 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <span style={{ fontSize:28, opacity:0.3 }}>👗</span>
                      <span style={{ font:'400 11px Poppins', color:'var(--fg-muted)', opacity:0.6 }}>No product</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:20, textAlign:'center' }}>
                  <Link href="/shop-login" style={{ font:'600 13px Poppins', color:'var(--magenta-600)', textDecoration:'none' }}>
                    Own this shop? Add your products →
                  </Link>
                </div>
              </div>
            </div>

            {/* right column */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* map — isolation:isolate traps Leaflet z-indexes inside this box */}
              <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', isolation:'isolate' }}>
                <div style={{ height:260 }}>
                  {shopLat && shopLng
                    ? <MiniMap shopLat={shopLat} shopLng={shopLng} shopName={name} userLat={userLat} userLng={userLng}/>
                    : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fg-muted)' }}>Location unavailable</div>
                  }
                </div>
                <div style={{ padding:16 }}>
                  {distKm && (
                    <div style={{ font:'500 13px Poppins', color:'var(--navy-800)', marginBottom:10 }}>
                      <span style={{ color:'#4285F4' }}>●</span> You — <span style={{ color:'var(--magenta-600)' }}>●</span> {name} <strong>({distKm} km)</strong>
                    </div>
                  )}
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="afm-btn afm-btn-primary"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%' }}>
                    <ExternalLink size={15}/> Get Directions
                  </a>
                </div>
              </div>

              {/* shop info */}
              <div style={{ background:'#fff', borderRadius:20, padding:20, border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
                <h3 style={{ font:'600 16px Playfair Display', color:'var(--navy-800)', margin:'0 0 16px' }}>Shop Info</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {address && <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><MapPin size={15} style={{ color:'var(--magenta-600)', flexShrink:0, marginTop:2 }}/><span style={{ font:'400 13px Poppins', color:'var(--navy-800)', lineHeight:1.5 }}>{address}</span></div>}
                  {hours   && <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><Clock   size={15} style={{ color:'var(--magenta-600)', flexShrink:0, marginTop:2 }}/><span style={{ font:'400 13px Poppins', color:'var(--navy-800)' }}>{hours}</span></div>}
                  {phone   && <div style={{ display:'flex', gap:10, alignItems:'center' }}><Phone   size={15} style={{ color:'var(--magenta-600)', flexShrink:0 }}/><a href={`tel:${phone}`} style={{ font:'400 13px Poppins', color:'var(--navy-800)', textDecoration:'none' }}>{phone}</a></div>}
                  {!address && !hours && !phone && <p style={{ font:'400 13px Poppins', color:'var(--fg-muted)', margin:0 }}>No additional details available.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ height:60 }}/>
      </main>
      <Footer/>
    </>
  );
}

// ── claimed shop view (registered on platform) ────────────────────────────────

function ClaimedShopView({ shop, products }) {
  const router  = useRouter();
  const mapsUrl = shop.latitude && shop.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}` : null;

  return (
    <>
      <Header setView={v => { const m={home:'/',cart:'/cart',wishlist:'/wishlist',account:'/account',categories:'/categories'}; router.push(m[v]??'/'); }}/>
      <main style={{ background:'#F8F9FB', minHeight:'80vh' }}>
        <div className="container" style={{ paddingTop:20 }}>
          <Link href="/nearby-shops" style={{ display:'inline-flex', alignItems:'center', gap:6, font:'500 13px Poppins', color:'var(--fg-muted)', textDecoration:'none' }}>
            <ArrowLeft size={14}/> Back to Nearby Shops
          </Link>
        </div>

        {/* hero */}
        <div style={{ background:'linear-gradient(135deg,var(--navy-800) 0%,#6D1B5C 60%,var(--magenta-600) 100%)', padding:'40px 0 60px', marginTop:12 }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'flex-start', gap:20, flexWrap:'wrap' }}>
              <div style={{ width:80, height:80, borderRadius:20, overflow:'hidden', border:'2px solid rgba(255,255,255,0.3)', flexShrink:0 }}>
                {shop.logo_url
                  ? <img src={shop.logo_url} alt={shop.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, background:'rgba(255,255,255,0.15)' }}>🛍</div>
                }
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                  <h1 style={{ font:'700 28px/1.1 Playfair Display', color:'#fff', margin:0, letterSpacing:'-0.02em' }}>{shop.name}</h1>
                  {shop.is_verified && <BadgeCheck size={22} style={{ color:'#4AF4FF' }}/>}
                </div>
                {shop.description && <p style={{ font:'400 14px/1.5 Poppins', color:'rgba(255,255,255,0.8)', margin:'0 0 10px', maxWidth:500 }}>{shop.description}</p>}
                <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
                  {shop.address && <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:'Poppins' }}><MapPin size={13}/> {shop.address}</span>}
                  {shop.rating  && <span style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:'Poppins' }}><Star size={13}/> {shop.rating.toFixed(1)} ({shop.reviewCount||0} reviews)</span>}
                </div>
              </div>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="afm-btn afm-btn-on-dark" style={{ display:'inline-flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <ExternalLink size={14}/> Get Directions
                </a>
              )}
            </div>
          </div>
        </div>

        {/* products */}
        <div className="container" style={{ marginTop:-24 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px', border:'1px solid var(--border)', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20 }}>
              <h2 style={{ font:'600 22px Playfair Display', color:'var(--navy-800)', margin:0 }}>Products <em style={{ fontStyle:'italic', color:'var(--magenta-600)' }}>({products.length})</em></h2>
            </div>
            {products.length === 0
              ? <p style={{ font:'400 14px Poppins', color:'var(--fg-muted)' }}>No products listed yet.</p>
              : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                  {products.map(p => (
                    <div key={p.id} style={{ background:'#F8F9FB', borderRadius:16, overflow:'hidden', border:'1px solid var(--border)' }}>
                      <div style={{ aspectRatio:'1', background:'#E5E8ED', overflow:'hidden' }}>
                        {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
                      </div>
                      <div style={{ padding:'12px 14px' }}>
                        <div style={{ font:'600 13px Poppins', color:'var(--navy-800)', marginBottom:4 }}>{p.name}</div>
                        <div style={{ font:'600 14px Poppins', color:'var(--magenta-600)' }}>₹{(p.price/100).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
        <div style={{ height:60 }}/>
      </main>
      <Footer/>
    </>
  );
}

// ── inner component (reads searchParams) ──────────────────────────────────────

function ShopDetailInner({ id }) {
  const params  = useSearchParams();
  const name    = params.get('n') || '';
  const address = params.get('a') || '';
  const shopLat = parseFloat(params.get('lat') || '0');
  const shopLng = parseFloat(params.get('lng') || '0');
  const hours   = params.get('h') || null;
  const phone   = params.get('p') || null;
  const type    = params.get('t') || null;

  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [dbShop,  setDbShop]  = useState(null);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); },
      () => {}
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [shopData, { products: prods }] = await Promise.all([
          getStoreById(id),
          getProductsByStore(id),
        ]);
        if (!cancelled && shopData) { setDbShop(shopData); setProducts(prods || []); }
      } catch {
        // Not in DB — show auto-generated unclaimed view
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (dbShop) return <ClaimedShopView shop={dbShop} products={products}/>;

  return (
    <UnclaimedShopView
      name={name || 'Fashion Shop'}
      address={address}
      shopLat={shopLat}
      shopLng={shopLng}
      hours={hours}
      phone={phone}
      type={type}
      userLat={userLat}
      userLng={userLng}
    />
  );
}

// ── exported component ────────────────────────────────────────────────────────

export default function ShopDetailPage({ id }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ShopDetailInner id={id} />
    </Suspense>
  );
}
