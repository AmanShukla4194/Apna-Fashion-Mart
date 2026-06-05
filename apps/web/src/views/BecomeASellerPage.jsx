'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, BadgeCheck, BarChart2, Clock, CreditCard,
  MapPin, Package, ShoppingBag, Star, Store, Truck, Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const STEPS = [
  { n: '01', icon: '📝', title: 'Apply online', desc: 'Fill a simple form with your shop name, GST number, and bank details. Takes under 5 minutes.' },
  { n: '02', icon: '✅', title: 'Get verified', desc: 'Our team visits your shop in person, photographs the storefront, and audits inventory. Average time: 48 hours.' },
  { n: '03', icon: '🚀', title: 'Go live', desc: 'Upload your products, set prices, and start receiving orders from thousands of nearby customers immediately.' },
];

const BENEFITS = [
  { icon: <MapPin size={22}/>, title: 'Appear on the map', desc: 'Every nearby customer searching for fashion on our app sees your shop pinned to their local map.' },
  { icon: <ShoppingBag size={22}/>, title: 'Your own storefront', desc: 'A full product catalog page with your logo, photos, description, reviews, and search — no coding needed.' },
  { icon: <Truck size={22}/>, title: 'Same-day delivery', desc: 'Verified boutiques get free Apna couriers for same-day delivery within 10 km on orders above ₹999.' },
  { icon: <CreditCard size={22}/>, title: 'Weekly payouts', desc: 'Automatic weekly settlements via Razorpay Route. T+1 for UPI, T+3 for cards, T+7 for COD.' },
  { icon: <BarChart2 size={22}/>, title: 'Live dashboard', desc: 'Real-time order tracking, revenue analytics, customer insights, and stock management from one screen.' },
  { icon: <Users size={22}/>, title: '12,000+ active buyers', desc: 'Mumbai alone has over 12,000 active customers searching for local fashion every week on our platform.' },
];

const FAQS = [
  { q: 'Do I need to be GST-registered?', a: 'If your annual turnover is above ₹20 lakhs you must be GST-registered. Below that threshold, a self-declared affidavit is sufficient to join.' },
  { q: 'What commission does Apna Fashion Mart charge?', a: 'Standard commission is 8–12% depending on the category, agreed at on-boarding and reviewed quarterly. There are no listing fees, no monthly fees, and no hidden charges.' },
  { q: 'Can I manage products from my phone?', a: 'Yes. The Apna Fashion Mart vendor dashboard is fully mobile-optimised. You can add products, update stock, and accept/reject orders from your smartphone.' },
  { q: 'What happens if a customer wants a refund?', a: 'The 7-day return window is Apna-managed. We collect the return, verify condition, and initiate the refund. Your payout is debited only if the return is accepted.' },
  { q: 'How do I get the Verified badge?', a: 'An Apna operations associate visits your shop, photographs the storefront, audits a sample of inventory, and confirms your documents. The entire process typically takes 1–2 days after documents are submitted.' },
  { q: 'Is there a minimum number of products I need to list?', a: 'We recommend at least 10 products to go live, but there is no hard minimum. More products means more customer touchpoints and better search ranking.' },
];

export default function BecomeASellerPage() {
  const router = useRouter();
  const nav = (v) => {
    const m = { home: '/', cart: '/cart', wishlist: '/wishlist', account: '/account', categories: '/categories' };
    router.push(m[v] ?? '/');
  };

  return (
    <>
      <Header setView={nav} />
      <main style={{ background: '#F8F9FB' }}>

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg,#001F3F 0%,#6D1B5C 55%,#FF1493 100%)', padding: '80px 0 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,20,147,0.15) 0%, transparent 60%)', pointerEvents: 'none' }}/>
          <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '6px 18px', fontSize: 12, fontFamily: 'Poppins', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              For Shop Owners
            </span>
            <h1 style={{ font: '700 clamp(36px,8vw,64px)/1.05 Playfair Display', color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Grow your boutique with<br/><em style={{ color: '#FFD580', fontStyle: 'italic' }}>Apna Fashion Mart</em>
            </h1>
            <p style={{ font: '400 clamp(15px,2vw,18px)/1.6 Poppins', color: 'rgba(255,255,255,0.82)', maxWidth: 560, margin: '0 auto 36px' }}>
              Turn your local boutique into a digital storefront. Reach thousands of nearby fashion shoppers — no tech skills required.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop-login" className="afm-btn afm-btn-primary" style={{ fontSize: 15, padding: '0 28px', height: 48, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Start selling free <ArrowRight size={16}/>
              </Link>
              <a href="mailto:vendors@apnafashionmart.com" className="afm-btn afm-btn-on-dark" style={{ fontSize: 15, padding: '0 28px', height: 48 }}>
                Talk to our team
              </a>
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────── */}
        <div className="container" style={{ transform: 'translateY(-36px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', overflow: 'hidden', border: '1px solid var(--border)' }} className="seller-stats-grid">
            {[
              ['12,000+', 'Active buyers in Mumbai'],
              ['₹84k', 'Avg vendor GMV / month'],
              ['387', 'Verified boutiques live'],
              ['48 hr', 'Average go-live time'],
            ].map(([n, l]) => (
              <div key={l} style={{ padding: '24px 20px', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ font: '700 28px Playfair Display', color: 'var(--magenta-600)', marginBottom: 4 }}>{n}</div>
                <div style={{ font: '400 12px Poppins', color: 'var(--fg-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section className="container" style={{ paddingTop: 20, paddingBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eye">Simple process</div>
            <h2 style={{ font: '700 clamp(28px,5vw,40px) Playfair Display', color: 'var(--navy-800)', margin: '8px 0 0', letterSpacing: '-0.02em' }}>Up and selling in <em style={{ color: 'var(--magenta-600)', fontStyle: 'italic' }}>3 steps</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }} className="seller-steps-grid">
            {STEPS.map(s => (
              <div key={s.n} style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 20, right: 20, font: '700 48px Poppins', color: 'var(--magenta-100,#FFF0F8)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ font: '700 18px Playfair Display', color: 'var(--navy-800)', margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-muted)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BENEFITS ────────────────────────────────────────────────── */}
        <section style={{ background: 'var(--navy-800)', padding: '72px 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="eye" style={{ color: 'rgba(255,255,255,0.6)' }}>Why join us</div>
              <h2 style={{ font: '700 clamp(28px,5vw,40px) Playfair Display', color: '#fff', margin: '8px 0 0' }}>Everything you need to<br/><em style={{ color: '#FFD580', fontStyle: 'italic' }}>sell online</em></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }} className="seller-benefits-grid">
              {BENEFITS.map(b => (
                <div key={b.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '24px 22px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,20,147,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF55B0', marginBottom: 14 }}>
                    {b.icon}
                  </div>
                  <h3 style={{ font: '600 16px Poppins', color: '#fff', margin: '0 0 8px' }}>{b.title}</h3>
                  <p style={{ font: '400 13px/1.6 Poppins', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMISSION ──────────────────────────────────────────────── */}
        <section className="container" style={{ padding: '72px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }} className="seller-commission-grid">
            <div>
              <div className="eye">Transparent pricing</div>
              <h2 style={{ font: '700 clamp(28px,5vw,38px) Playfair Display', color: 'var(--navy-800)', margin: '8px 0 16px', letterSpacing: '-0.02em' }}>
                No listing fees.<br/>Only pay when<br/><em style={{ color: 'var(--magenta-600)', fontStyle: 'italic' }}>you sell.</em>
              </h2>
              <p style={{ font: '400 15px/1.7 Poppins', color: 'var(--fg-muted)', margin: '0 0 28px' }}>
                We charge a simple commission only on completed orders. No setup fees, no monthly subscription, no hidden charges.
              </p>
              <Link href="/shop-login" className="afm-btn afm-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Apply now — free <ArrowRight size={15}/>
              </Link>
            </div>
            <div>
              {[['Sarees & Ethnic Wear', '8%'], ['Kurtis & Salwar Suits', '9%'], ['Western & Casual', '10%'], ['Kids Fashion', '10%'], ['Accessories & Bags', '11%'], ['Footwear', '12%']].map(([cat, pct]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ font: '500 14px Poppins', color: 'var(--navy-800)' }}>{cat}</span>
                  <span style={{ font: '700 15px Poppins', color: 'var(--magenta-600)' }}>{pct}</span>
                </div>
              ))}
              <p style={{ font: '400 12px Poppins', color: 'var(--fg-muted)', marginTop: 12 }}>Commission reviewed quarterly. Rates locked for your first 6 months.</p>
            </div>
          </div>
        </section>

        {/* ── REQUIREMENTS ────────────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '64px 0' }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div className="eye">What you need</div>
              <h2 style={{ font: '700 clamp(26px,5vw,36px) Playfair Display', color: 'var(--navy-800)', margin: '8px 0 0' }}>Requirements to join</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="seller-req-grid">
              {[
                ['📄', 'GST certificate or under-threshold affidavit'],
                ['🪪', 'PAN of proprietor / company'],
                ['🏦', 'Bank account in the business name'],
                ['📍', 'Physical shop address (verified on-site)'],
                ['📸', '10 product photographs (we help if needed)'],
                ['📱', 'WhatsApp number for order notifications'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F8F9FB', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <span style={{ font: '400 13px/1.5 Poppins', color: 'var(--navy-800)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="container" style={{ padding: '64px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eye">Common questions</div>
            <h2 style={{ font: '700 clamp(26px,5vw,36px) Playfair Display', color: 'var(--navy-800)', margin: '8px 0 0' }}>Frequently asked questions</h2>
          </div>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map(f => (
              <details key={f.q} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: '18px 20px', cursor: 'pointer' }}>
                <summary style={{ font: '600 15px Poppins', color: 'var(--navy-800)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  {f.q}
                  <span style={{ fontSize: 20, color: 'var(--magenta-600)', flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-muted)', margin: '14px 0 0' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section style={{ background: 'linear-gradient(135deg,#001F3F,#6D1B5C)', padding: '72px 0', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ font: '700 clamp(28px,6vw,48px) Playfair Display', color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Ready to grow your<br/><em style={{ color: '#FFD580', fontStyle: 'italic' }}>boutique?</em>
            </h2>
            <p style={{ font: '400 16px/1.6 Poppins', color: 'rgba(255,255,255,0.8)', maxWidth: 480, margin: '0 auto 32px' }}>
              Join 387+ verified boutiques already selling on Apna Fashion Mart. Free to join, free to list.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop-login" className="afm-btn afm-btn-primary" style={{ fontSize: 16, padding: '0 32px', height: 52, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Store size={18}/> Create seller account
              </Link>
              <a href="mailto:vendors@apnafashionmart.com" className="afm-btn afm-btn-on-dark" style={{ fontSize: 16, padding: '0 32px', height: 52 }}>
                Email our vendor team
              </a>
            </div>
            <p style={{ font: '400 12px Poppins', color: 'rgba(255,255,255,0.5)', marginTop: 20 }}>
              No credit card required · No monthly fees · Cancel anytime
            </p>
          </div>
        </section>

      </main>

      <style>{`
        @media (max-width: 900px) {
          .seller-steps-grid { grid-template-columns: 1fr !important; }
          .seller-benefits-grid { grid-template-columns: 1fr 1fr !important; }
          .seller-commission-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .seller-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .seller-benefits-grid { grid-template-columns: 1fr !important; }
          .seller-req-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 420px) {
          .seller-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </>
  );
}
