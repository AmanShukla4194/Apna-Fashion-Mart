'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground border-t-4 border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

          <div className="space-y-6">
            <Link href="/" className="block">
              <img
                src="https://horizons-cdn.hostinger.com/44d9ad84-2168-4c2d-8800-da46d0c76523/91dbc1acd93f786cce6f28c63850eb2c.jpg"
                alt="Apna Fashion Mart"
                className="h-16 w-auto rounded bg-white p-1"
              />
            </Link>
            <p className="text-primary-foreground/80 leading-relaxed max-w-xs text-sm">
              Your premium neighborhood fashion marketplace. Discover local boutiques, trending styles, and verified sellers all in one place. Apna Style, Apna Store.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors text-white">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-serif">Explore</h3>
            <ul className="space-y-4">
              <li><Link href="/categories" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Shop by Category</Link></li>
              <li><Link href="/nearby-shops" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Discover Local Shops</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Trending Now</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-serif">Customer Care</h3>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">My Account</Link></li>
              <li><Link href="/customer-profile" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Track Order</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Return Policy</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">Privacy &amp; Terms</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 font-serif">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">Fashion Hub Plaza, Level 4<br />Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/80 text-sm">+91 1800-FASHION</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-primary-foreground/80 text-sm">hello@apnafashionmart.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} Apna Fashion Mart. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <Link href="/" className="hover:text-secondary transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-secondary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
