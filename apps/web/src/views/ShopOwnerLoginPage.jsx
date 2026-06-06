'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ShopOwnerLoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, profile } = await login(email, password);
      if (!user) { toast.error('Login failed. Please try again.'); return; }
      const role = profile?.role ?? user?.role ?? 'customer';
      if (role !== 'vendor') {
        toast.error('This portal is for shop owners only. Please use Customer Login.');
        return;
      }
      toast.success('Welcome back! Loading your dashboard…');
      router.push('/vendor-dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('UserNotConfirmedException') || msg.includes('not confirmed')) {
        toast.error('Please verify your email first.');
        router.push(`/verify?email=${encodeURIComponent(email)}&role=vendor`);
      } else if (msg.includes('NotAuthorizedException') || msg.includes('Incorrect')) {
        toast.error('Incorrect email or password.');
      } else if (msg.includes('UserNotFoundException') || msg.includes('user does not exist')) {
        toast.error('No account found. Sign up as a vendor first.');
      } else {
        toast.error(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 48, padding: '0 14px',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12,
    font: '400 14px Poppins', color: 'var(--navy-800)',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')" }} />
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur shadow-2xl p-8 rounded-2xl border-none">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Store className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-primary font-serif">Shop Owner Portal</h1>
              <p className="text-muted-foreground text-sm mt-2">Manage your marketplace store</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-primary">Business Email</Label>
                <input
                  id="email" type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="partner@store.com"
                  style={{ ...inputStyle, marginTop: 6, border: '1px solid var(--border)' }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Label htmlFor="password" className="text-primary">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-secondary font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password" type={showPw ? 'text' : 'password'}
                    value={password} required
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, border: '1px solid var(--border)', paddingRight: 44 }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(s => !s)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--fg-muted)', display:'flex' }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 mt-2 rounded-xl py-6 text-lg" disabled={loading}>
                {loading ? 'Authenticating…' : 'Access Dashboard'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              New shop owner?{' '}
              <Link href="/signup" className="text-secondary font-medium hover:underline">Sign up here</Link>
              {' · '}
              <Link href="/forgot-password" className="text-secondary font-medium hover:underline">Forgot password?</Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShopOwnerLoginPage;
