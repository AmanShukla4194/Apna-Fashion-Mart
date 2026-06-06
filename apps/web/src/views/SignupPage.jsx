'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PasswordInput({ id, value, onChange, placeholder, label }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div style={{ position: 'relative', marginTop: 6 }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          minLength={8}
          placeholder={placeholder}
          style={{
            width: '100%', height: 44, padding: '0 44px 0 14px',
            border: '1px solid var(--border)', borderRadius: 12,
            font: '400 14px Poppins', color: 'var(--navy-800)',
            background: '#F8F9FB', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--fg-muted)', display: 'flex', alignItems: 'center',
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

const SignupPage = () => {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = passwordConfirm.length > 0 && password === passwordConfirm;
  const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await signup(email, password, { name, role });
      toast.success('Account created! Check your email for a verification code.');
      router.push(`/verify?email=${encodeURIComponent(email)}&role=${role}`);
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('UsernameExistsException') || msg.includes('already exists')) {
        toast.error('An account with this email already exists. Try logging in.');
      } else if (msg.includes('InvalidPassword') || msg.includes('password')) {
        toast.error('Password must be 8+ characters with a mix of letters and numbers.');
      } else if (msg.includes('custom:role') || msg.includes('schema')) {
        toast.error('Signup configuration error. Please contact support.');
      } else {
        toast.error(msg || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="card-premium w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-serif">Create Account</h1>
            <p className="text-muted-foreground mt-2">Join Apna Fashion Mart</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <input
                id="name" type="text" value={name} required
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                style={{ width:'100%', height:44, padding:'0 14px', marginTop:6, border:'1px solid var(--border)', borderRadius:12, font:'400 14px Poppins', background:'#F8F9FB', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <input
                id="email" type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ width:'100%', height:44, padding:'0 14px', marginTop:6, border:'1px solid var(--border)', borderRadius:12, font:'400 14px Poppins', background:'#F8F9FB', outline:'none', boxSizing:'border-box' }}
              />
            </div>

            {/* Password */}
            <PasswordInput
              id="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" label="Password"
            />

            {/* Confirm Password */}
            <div>
              <PasswordInput
                id="passwordConfirm" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="Repeat your password" label="Confirm Password"
              />
              {passwordsMatch && (
                <p style={{ font:'500 12px Poppins', color:'#16a34a', marginTop:4 }}>✓ Passwords match</p>
              )}
              {passwordsMismatch && (
                <p style={{ font:'500 12px Poppins', color:'#dc2626', marginTop:4 }}>✗ Passwords do not match</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <Label>Account Type</Label>
              <div style={{ marginTop: 6 }}>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer — I want to shop</SelectItem>
                    <SelectItem value="vendor">Vendor — I own a clothing store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full btn-primary mt-2" disabled={loading || passwordsMismatch}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
