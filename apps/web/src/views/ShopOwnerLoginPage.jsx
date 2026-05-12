'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile?.role === 'vendor') {
        toast.success('Vendor login successful');
        router.push('/vendor-dashboard');
      } else {
        toast.error('Account does not have vendor privileges.');
      }
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')" }} />
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary">Business Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" placeholder="partner@store.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-premium" placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 mt-6 rounded-xl py-6 text-lg" disabled={loading}>
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Want to partner with us? <Link href="/signup" className="text-secondary font-medium">Apply here</Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ShopOwnerLoginPage;
