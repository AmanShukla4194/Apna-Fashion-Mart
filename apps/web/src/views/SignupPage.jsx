'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignupPage = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signup(email, password, name, role);
      toast.success('Account created! Please check your email to confirm, then log in.');
      if (role === 'vendor') router.push('/shop-login');
      else router.push('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="card-premium w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-serif">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join Apna Fashion Mart</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="input-premium" placeholder="Your name" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" placeholder="your@email.com" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="input-premium" placeholder="Min. 8 characters" />
          </div>
          <div>
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input id="passwordConfirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required minLength={8} className="input-premium" placeholder="••••••••" />
          </div>
          <div>
            <Label htmlFor="role">Account Type</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer — I want to shop</SelectItem>
                <SelectItem value="vendor">Vendor — I own a clothing store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;
