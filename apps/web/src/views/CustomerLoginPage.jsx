'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile?.role === 'customer') {
        toast.success('Welcome back!');
        router.push('/customer-profile');
      } else {
        toast.error('Please use the correct portal for your account type.');
      }
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="https://horizons-cdn.hostinger.com/44d9ad84-2168-4c2d-8800-da46d0c76523/91dbc1acd93f786cce6f28c63850eb2c.jpg"
              alt="Logo"
              className="h-20 w-auto mx-auto mb-6 rounded shadow-sm"
            />
            <h1 className="text-3xl font-bold text-primary font-serif">Customer Login</h1>
            <p className="text-muted-foreground mt-2">Access your wishlist and orders</p>
          </div>

          <Card className="card-premium p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" placeholder="name@example.com" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-secondary font-medium hover:underline">Forgot password?</a>
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-premium" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full btn-primary mt-6 rounded-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                New to Apna Fashion Mart?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:text-secondary transition-colors">Create an account</Link>
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
