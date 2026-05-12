'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Heart, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, profile, logout, isCustomer, isVendor, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path) => pathname === path;

  const displayName = profile?.name || currentUser?.email?.split('@')[0] || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          <Link href="/" className="flex items-center gap-3 md:gap-4 shrink-0">
            <img
              src="https://horizons-cdn.hostinger.com/44d9ad84-2168-4c2d-8800-da46d0c76523/91dbc1acd93f786cce6f28c63850eb2c.jpg"
              alt="Apna Fashion Mart Logo"
              className="h-14 md:h-16 w-auto rounded-md object-contain transition-opacity"
            />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="font-serif text-base md:text-2xl text-primary leading-none whitespace-nowrap">
                  Apna Fashion
                </span>
                <span className="text-secondary font-bold tracking-[0.15em] md:tracking-[0.3em] text-[10px] md:text-sm mt-0.5 whitespace-nowrap">
                  MART
                </span>
              </div>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trending styles..."
              className="w-full pl-12 pr-4 py-2 bg-muted/50 border-none rounded-full focus-visible:ring-1 focus-visible:ring-secondary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  router.push(`/categories?q=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className={`font-medium transition-colors hover:text-secondary ${isActive('/') ? 'text-secondary' : 'text-foreground'}`}>
              Home
            </Link>
            <Link href="/categories" className={`font-medium transition-colors hover:text-secondary ${isActive('/categories') ? 'text-secondary' : 'text-foreground'}`}>
              Categories
            </Link>
            <Link href="/nearby-shops" className={`font-medium transition-colors hover:text-secondary ${isActive('/nearby-shops') ? 'text-secondary' : 'text-foreground'}`}>
              Nearby Shops
            </Link>

            {(!isAuthenticated || isCustomer) && (
              <>
                <Link href="/wishlist" className="text-foreground hover:text-secondary transition-colors p-2">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/cart" className="text-foreground hover:text-secondary transition-colors p-2 relative">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              </>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-4 ml-6 pl-6 border-l border-border">
            {!isAuthenticated ? (
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-full font-medium" onClick={() => router.push('/login')}>
                  Customer Login
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-medium" onClick={() => router.push('/shop-login')}>
                  Shop Owner Login
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full flex items-center gap-2 hover:bg-muted">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {displayInitial}
                    </div>
                    <span className="font-medium max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                  <div className="px-2 py-1.5 mb-2">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  {isCustomer && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/customer-profile')} className="cursor-pointer rounded-lg py-2">My Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/wishlist')} className="cursor-pointer rounded-lg py-2">Wishlist</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/cart')} className="cursor-pointer rounded-lg py-2">Shopping Cart</DropdownMenuItem>
                    </>
                  )}

                  {isVendor && (
                    <DropdownMenuItem onClick={() => router.push('/vendor-dashboard')} className="cursor-pointer rounded-lg py-2 font-medium text-primary">
                      Vendor Dashboard
                    </DropdownMenuItem>
                  )}

                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin-dashboard')} className="cursor-pointer rounded-lg py-2 font-medium text-secondary">
                      Admin Portal
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-border absolute w-full left-0 shadow-lg pb-6">
          <nav className="px-4 py-4 flex flex-col space-y-2">
            <Link href="/" className="p-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/categories" className="p-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
            <Link href="/nearby-shops" className="p-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Nearby Shops</Link>

            {(!isAuthenticated || isCustomer) && (
              <>
                <Link href="/wishlist" className="p-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                <Link href="/cart" className="p-3 text-foreground hover:bg-muted rounded-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
              </>
            )}

            {!isAuthenticated ? (
              <div className="pt-4 flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-center" onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}>
                  Customer Login
                </Button>
                <Button className="w-full justify-center bg-primary" onClick={() => { router.push('/shop-login'); setMobileMenuOpen(false); }}>
                  Shop Owner Login
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-border mt-2">
                {isCustomer && (
                  <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => { router.push('/customer-profile'); setMobileMenuOpen(false); }}>My Profile</Button>
                )}
                {isVendor && (
                  <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => { router.push('/vendor-dashboard'); setMobileMenuOpen(false); }}>Vendor Dashboard</Button>
                )}
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => { router.push('/admin-dashboard'); setMobileMenuOpen(false); }}>Admin Portal</Button>
                )}
                <Button variant="destructive" className="w-full justify-center" onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
