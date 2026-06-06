'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function VerifyEmailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const role  = params.get('role') || 'customer';

  const { confirmSignUp, resendConfirmationCode } = useAuth();

  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { toast.error('Please enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      setVerified(true);
      toast.success('Email verified! You can now log in.');
      setTimeout(() => {
        router.push(role === 'vendor' ? '/shop-login' : '/login');
      }, 2000);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('CodeMismatchException') || msg.includes('Invalid')) {
        toast.error('Incorrect code. Please check your email and try again.');
      } else if (msg.includes('ExpiredCode')) {
        toast.error('Code has expired. Please request a new one.');
      } else {
        toast.error(msg || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setResending(true);
    try {
      await resendConfirmationCode(email);
      toast.success('A new code has been sent to your email.');
      setCountdown(60);
    } catch (err) {
      toast.error(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <>
        <Header />
        <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FB' }}>
          <div style={{ textAlign: 'center', padding: '40px 24px' }}>
            <CheckCircle size={64} style={{ color: '#16a34a', margin: '0 auto 16px' }}/>
            <h1 style={{ font: '700 28px Playfair Display', color: 'var(--navy-800)', margin: '0 0 8px' }}>Email Verified!</h1>
            <p style={{ font: '400 15px Poppins', color: 'var(--fg-muted)' }}>Redirecting you to login…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FB', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy-800),var(--magenta-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={32} style={{ color: '#fff' }}/>
            </div>
            <h1 style={{ font: '700 26px Playfair Display', color: 'var(--navy-800)', margin: '0 0 8px' }}>Check your email</h1>
            <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-muted)', margin: 0 }}>
              We sent a 6-digit verification code to<br/>
              <strong style={{ color: 'var(--navy-800)' }}>{email || 'your email'}</strong>
            </p>
          </div>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleVerify}>
              <label style={{ display: 'block', font: '600 13px Poppins', color: 'var(--navy-800)', marginBottom: 8 }}>
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                style={{
                  width: '100%', height: 52, borderRadius: 12, border: '1px solid var(--border)',
                  font: '700 28px/1 Poppins', letterSpacing: '0.4em', textAlign: 'center',
                  color: 'var(--navy-800)', background: '#F8F9FB', outline: 'none',
                  boxSizing: 'border-box', marginBottom: 20,
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--magenta-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,20,147,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="afm-btn afm-btn-primary"
                style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center' }}
              >
                {loading ? 'Verifying…' : 'Verify Email'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <p style={{ font: '400 13px Poppins', color: 'var(--fg-muted)', marginBottom: 10 }}>
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={resending || countdown > 0}
                style={{
                  background: 'none', border: 'none', cursor: countdown > 0 ? 'default' : 'pointer',
                  font: '600 13px Poppins', color: countdown > 0 ? 'var(--fg-muted)' : 'var(--magenta-600)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <RefreshCw size={14}/>
                {resending ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </button>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <Link href="/signup" style={{ font: '500 13px Poppins', color: 'var(--fg-muted)', textDecoration: 'none' }}>
                ← Back to sign up
              </Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', font: '400 12px Poppins', color: 'var(--fg-muted)', marginTop: 16 }}>
            The code expires in 10 minutes. Check your spam folder if you don't see it.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
