'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';

// AfmButton kept for prototype compatibility — maps to shadcn Button
function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}



const LEGAL_DOCS = {
  privacy: {
    title: 'Privacy',
    eye: 'How we handle your data',
    updated: '17 May 2026',
    intro: 'We collect only what we need to connect you with verified boutiques nearby — and nothing we sell on to third parties. This document explains exactly what, why, and for how long.',
    sections: [
      { id: 'what', h: 'What we collect',
        body: [
          'Apna Fashion Mart is a Lattice Teams product operated from Mumbai, India. We collect data from three sources: information you give us (name, email, phone, addresses), data your device shares (approximate location, IP, device type), and behaviour on our platform (browsing, wishlists, orders, reviews).',
        ],
        bullets: [
          'Account info — full name, email, phone, password hash, optional profile photo.',
          'Address book — saved delivery + billing addresses, geolocation pin if you grant permission.',
          'Order history — items bought, prices paid, vendor identity, delivery status.',
          'Engagement — wishlists, recently viewed, search queries, AI assistant transcripts.',
          'Device signals — IP, user-agent, OS version, screen resolution, app version.',
          'Verification documents (vendors only) — GST, PAN, bank details, storefront photographs.',
        ] },
      { id: 'why', h: 'Why we collect it',
        body: ['Each data point is tied to a specific feature. We refuse to collect anything we don\'t actively use.'],
        bullets: [
          'Location → showing you boutiques near you.',
          'Phone / email → order confirmations, OTP, delivery status, returns.',
          'Wishlists + history → personalised recommendations, abandoned-cart reminders.',
          'GST / PAN (vendors) → on-boarding verification and statutory tax compliance.',
        ] },
      { id: 'share', h: 'Who we share with',
        body: [
          'We share data with three categories of partners, each governed by a written data-processing agreement: payment processors (Razorpay, Stripe), delivery partners (Shiprocket, Delhivery, the boutique you ordered from), and infrastructure providers (Amazon Web Services, Cloudflare).',
          'We never sell your data. We never share it for advertising outside Apna Fashion Mart. We never share verification documents with anyone except the auditor and you.',
        ] },
      { id: 'retain', h: 'How long we keep it',
        body: ['Account data is retained for as long as your account is active, plus 90 days after deletion (for refund / fraud-investigation windows). Order data is retained for 7 years per Indian tax law. Audit logs are kept for 3 years. Verification documents are kept until the vendor leaves the platform + 12 months.'] },
      { id: 'rights', h: 'Your rights',
        body: ['Under India\'s DPDP Act, 2023, you have the right to: access a copy of everything we hold, correct anything inaccurate, ask for deletion (subject to legal retention windows), withdraw consent, and lodge a grievance with the Data Protection Board.'] },
      { id: 'cookies', h: 'Cookies and tracking',
        body: ['We use first-party cookies only — for session, cart, and login state. We do not run third-party advertising trackers. Analytics is via PostHog (self-hosted) which honours Do-Not-Track and cookies-consent. You can disable cookies in your browser; only session-critical features will be affected.'] },
      { id: 'security', h: 'Security',
        body: ['All traffic is TLS 1.3. Passwords are stored as bcrypt hashes. Payment cards never touch our servers — they go directly to Razorpay / Stripe. Database is encrypted at rest. MFA mandatory for admin and vendor accounts.'] },
      { id: 'contact', h: 'Contact our DPO',
        body: ['Privacy questions, access requests, deletion: privacy@latticeteams.com · We respond within 30 days, usually within 72 hours.'] },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eye: 'The rules of the marketplace',
    updated: '12 May 2026',
    intro: 'By using Apna Fashion Mart you agree to these terms. They are written in plain English on purpose — please read them.',
    sections: [
      { id: 'parties', h: 'Who is who',
        body: ['"We", "us", and "Apna Fashion Mart" mean Lattice Teams Technologies Pvt. Ltd., the company that operates the platform. "You" means the customer or vendor using it. "Boutique" means an independent shop listed on the platform.'] },
      { id: 'account', h: 'Your account',
        bullets: [
          'You must be 18+ to register. If you\'re a vendor, your shop must be GST-registered (or under the GST threshold and self-declared).',
          'Keep your password secret. You\'re responsible for activity under your account.',
          'One person, one account. We may close duplicate accounts.',
          'We may suspend an account for fraud, abuse, or repeated returns of worn merchandise.',
        ] },
      { id: 'orders', h: 'Orders &amp; payments',
        body: ['When you place an order, you\'re entering a contract directly with the boutique — Apna Fashion Mart is the platform, not the seller of the garment. We collect payment on the boutique\'s behalf and pay them after delivery is confirmed. Bank offers (HDFC 10 %, etc.) are subject to issuer-specific terms.'] },
      { id: 'delivery', h: 'Delivery &amp; returns',
        bullets: [
          'Free same-day local delivery is available from verified boutiques within 10 km of the customer (orders above ₹999).',
          'Standard delivery elsewhere uses Shiprocket / Delhivery (2–4 business days).',
          '7-day return window from delivery. Tags intact, unworn. Refund to source within 5 business days after the boutique acknowledges receipt.',
          'COD orders incur a ₹40 fee, waived above ₹1,499 from verified boutiques.',
        ] },
      { id: 'vendor', h: 'Vendor terms',
        body: ['If you operate a boutique on the platform, the full Vendor Agreement applies in addition to these terms. The Vendor Agreement covers commission, payouts, listing standards, return responsibility and verified-badge revocation.'] },
      { id: 'ip', h: 'Intellectual property',
        body: ['All product photography is uploaded by the boutique and they confirm they own the rights. The Apna Fashion Mart name, logo, design system and platform code are owned by Lattice Teams. You may not scrape, copy, or republish boutique listings without written permission.'] },
      { id: 'liability', h: 'Liability',
        body: ['Apna Fashion Mart is liable for platform availability and payment integrity. The boutique is liable for product quality, accuracy of listings, and fulfillment. Combined liability under these terms is capped at the value of the order in question.'] },
      { id: 'governing', h: 'Governing law',
        body: ['These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.'] },
    ],
  },
  vendor: {
    title: 'Vendor Agreement',
    eye: 'For boutiques on the platform',
    updated: '08 May 2026',
    intro: 'Run a boutique? Here\'s exactly what you agree to when your shop goes live on Apna Fashion Mart.',
    sections: [
      { id: 'onboard', h: 'On-boarding',
        bullets: [
          'GST registration certificate (or self-declared under-threshold affidavit) required.',
          'PAN of the proprietor / partnership / company.',
          'Bank account in the legal entity\'s name with cancelled cheque or bank certificate.',
          'Storefront address proof + 10 product photographs (we\'ll come visit before issuing the verified badge).',
          'Average on-boarding time: 48 hours after complete submission.',
        ] },
      { id: 'verify', h: 'The Verified Boutique badge',
        body: [
          'The blue scalloped check is issued after an Apna ops associate visits your shop in person, photographs the storefront, audits a sample of inventory, and verifies your documents.',
          'Verified shops get free same-day delivery from Apna couriers, push-notification placement in nearby customers\' feeds, and priority placement in search.',
          'The badge can be revoked for: out-of-stock fulfilment > 10 %, return rate > 12 %, customer complaint rate > 5 %, or any documented case of misrepresentation.',
        ] },
      { id: 'commission', h: 'Commission &amp; payouts',
        bullets: [
          'Standard commission is 8–12 % per category, set at on-boarding and reviewed quarterly.',
          'Razorpay Route is used to split each customer payment automatically — your share lands in your linked account within 24 hours of delivery confirmation.',
          'Payouts every Friday. T+1 settlement on UPI orders, T+3 on cards, T+7 on COD (after physical reconciliation).',
          'GST and TCS are handled by us via the marketplace mechanism. We file your monthly GSTR-8.',
        ] },
      { id: 'standards', h: 'Listing standards',
        bullets: [
          'Product photographs must be your own, on plain or fabric background, minimum 1200×1600 px.',
          'Screenshots from other websites are auto-rejected.',
          'Each listing needs accurate size chart, fabric composition, care instructions and a country-of-origin.',
          'Pricing must include all taxes. Strike-through "MRP" prices must be genuine recent prices.',
        ] },
      { id: 'returns', h: 'Returns &amp; refunds',
        body: ['You are responsible for receiving the returned item and confirming condition. We will initiate the customer refund only after you mark the return received. If you don\'t mark within 72 hours of courier delivery, we auto-refund and debit your next payout.'] },
      { id: 'exit', h: 'Leaving the platform',
        body: ['Either party may terminate this agreement with 30 days written notice. On termination, we\'ll fulfil all in-flight orders, pay any pending settlement, and remove your listings within 24 hours.'] },
    ],
  },
};

function LegalView() {
  // pick doc from window var or url query ?doc=privacy|terms|vendor
  let key = (typeof window !== 'undefined' && window.AFM_LEGAL_DOC) || 'privacy';
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search).get('doc');
    if (q && LEGAL_DOCS[q]) key = q;
  }
  const doc = LEGAL_DOCS[key];
  const [active, setActive] = useState(doc.sections[0].id);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-30% 0px -60% 0px' });
    doc.sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [key]);

  return (
    <main>
      <section className="legal-hero">
        <div className="container">
          <div className="crumb">
            <span>Home</span><ChevronRight size={11}/><span>Legal</span><ChevronRight size={11}/><span style={{ color: '#fff' }}>{doc.title}</span>
          </div>
          <div className="eye">{doc.eye}</div>
          <h1><em>{doc.title}</em></h1>
          <p>{doc.intro}</p>
          <div className="meta">
            <span>Last updated · <strong>{doc.updated}</strong></span>
            <span>Effective in · <strong>India</strong></span>
            <span>Operator · <strong>Lattice Teams Technologies Pvt. Ltd.</strong></span>
          </div>
        </div>
      </section>

      <div className="container legal-body">
        <aside className="legal-toc">
          <h4>On this page</h4>
          {doc.sections.map(s => (
            <a key={s.id} className={active === s.id ? 'on' : ''}
               href={`#${s.id}`}
               onClick={(e) => { e.preventDefault(); const el = document.getElementById(s.id); if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' }); }}>
              {s.h}
            </a>
          ))}
          <h4 style={{ marginTop: 28 }}>Other documents</h4>
          {Object.entries(LEGAL_DOCS).filter(([k]) => k !== key).map(([k, d]) => (
            <Link key={k} href={`/legal/${k}`}>{d.title} →</Link>
          ))}
        </aside>

        <div className="legal-content">
          {doc.sections.map(s => (
            <section key={s.id} id={s.id}>
              <h2>{s.h}</h2>
              {s.body && s.body.map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }}></p>)}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b, i) => <li key={i} dangerouslySetInnerHTML={{ __html: b }}></li>)}
                </ul>
              )}
            </section>
          ))}

          <div className="legal-callout">
            <strong>Plain-English summary:</strong> Apna Fashion Mart is a marketplace, not a seller. We pass payment to the boutique you ordered from. We're transparent about what we collect, and you can delete your account any time.
          </div>

          <div className="legal-contact">
            <span className="ic"><ShieldCheck size={20}/></span>
            <div>
              <h4>Questions about this document?</h4>
              <p>Email <a href="mailto:legal@latticeteams.com">legal@latticeteams.com</a> · response within 5 business days · <a href="https://www.latticeteams.com" target="_blank" rel="noreferrer">latticeteams.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



export default function LegalPage({ doc }) {
  if (typeof window !== 'undefined' && doc) window.AFM_LEGAL_DOC = doc;
  return (
    <>
      <Header />
      <LegalView />
      <Footer />
    </>
  );
}
