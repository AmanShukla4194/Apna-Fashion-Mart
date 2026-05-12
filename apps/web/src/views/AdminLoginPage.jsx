'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminLoginPage = () => {
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
      if (profile?.role === 'admin') {
        toast.success('Admin authentication successful');
        router.push('/admin-dashboard');
      } else {
        toast.error('Unauthorized access attempt.');
        router.push('/');
      }
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-zinc-900 border border-zinc-800 p-8 shadow-2xl rounded-xl">
          <div className="text-center mb-8">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase">System Admin</h1>
            <p className="text-zinc-400 text-sm mt-2">Restricted Access Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Administrator ID</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-zinc-950 border-zinc-800 text-white focus:ring-red-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Security Key</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-zinc-950 border-zinc-800 text-white focus:ring-red-500" />
            </div>
            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 mt-4 font-bold tracking-widest uppercase" disabled={loading}>
              {loading ? 'Verifying...' : 'Authorize'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
