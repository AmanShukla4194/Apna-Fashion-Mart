'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CustomerLoginPage = () => {
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
      if (role === 'vendor') {
        toast.error('This is the customer portal. Please use Shop Owner Login.');
        return;
      }
      toast.success(`Welcome back, ${user.name || 'there'}!`);
      router.push('/account');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('UserNotConfirmedException') || msg.includes('not confirmed')) {
        toast.error('Please verify your email first.');
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else if (msg.includes('NotAuthorizedException') || msg.includes('Incorrect')) {
        toast.error('Incorrect email or password.');
      } else if (msg.includes('UserNotFoundException') || msg.includes('user does not exist')) {
        toast.error('No account found with this email. Please sign up first.');
      } else {
        toast.error(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 44, padding: '0 14px',
    border: '1px solid var(--border)', borderRadius: 12,
    font: '400 14px Poppins', color: 'var(--navy-800)',
    background: '#F8F9FB', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/afm-logo.webp" alt="Logo" className="h-20 w-auto mx-auto mb-6 rounded shadow-sm" />
            <h1 className="text-3xl font-bold text-primary font-serif">Customer Login</h1>
            <p className="text-muted-foreground mt-2">Access your wishlist and orders</p>
          </div>

          <Card className="card-premium p-8">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <input
                  id="email" type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ ...inputStyle, marginTop: 6 }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Label htmlFor="password">Password</Label>
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
                    style={{ ...inputStyle, paddingRight: 44 }}
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

              <Button type="submit" className="w-full btn-primary rounded-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                New to Apna Fashion Mart?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:text-secondary transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLoginPage;
