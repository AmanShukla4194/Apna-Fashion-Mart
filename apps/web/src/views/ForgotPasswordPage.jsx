'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, confirmForgotPassword } = useAuth();

  const [step, setStep]             = useState(1); // 1=email, 2=code+newpw
  const [email, setEmail]           = useState('');
  const [code, setCode]             = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [loading, setLoading]       = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Reset code sent! Check your email.');
      setStep(2);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('UserNotFound') || msg.includes('user does not exist')) {
        toast.error('No account found with this email.');
      } else if (msg.includes('LimitExceeded')) {
        toast.error('Too many attempts. Please wait a few minutes and try again.');
      } else {
        toast.error(msg || 'Failed to send reset code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      toast.success('Password reset successfully! You can now log in.');
      router.push('/login');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('CodeMismatch') || msg.includes('Invalid')) {
        toast.error('Invalid code. Please check your email and try again.');
      } else if (msg.includes('Expired')) {
        toast.error('Code has expired. Please start over.');
      } else {
        toast.error(msg || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 48, borderRadius: 12,
    border: '1px solid var(--border)', padding: '0 16px',
    font: '400 14px Poppins', color: 'var(--navy-800)',
    background: '#F8F9FB', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FB', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Icon + heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--navy-800),var(--magenta-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {step === 1 ? <Mail size={32} style={{ color: '#fff' }}/> : <KeyRound size={32} style={{ color: '#fff' }}/>}
            </div>
            <h1 style={{ font: '700 26px Playfair Display', color: 'var(--navy-800)', margin: '0 0 8px' }}>
              {step === 1 ? 'Forgot password?' : 'Reset password'}
            </h1>
            <p style={{ font: '400 14px/1.6 Poppins', color: 'var(--fg-muted)', margin: 0 }}>
              {step === 1
                ? 'Enter your email and we\'ll send you a reset code.'
                : `Enter the code sent to ${email} and your new password.`}
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

            {step === 1 ? (
              <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', font: '600 13px Poppins', color: 'var(--navy-800)', marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={loading} className="afm-btn afm-btn-primary"
                  style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center', marginTop: 4 }}>
                  {loading ? 'Sending…' : 'Send Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', font: '600 13px Poppins', color: 'var(--navy-800)', marginBottom: 6 }}>Reset Code</label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]*"
                    maxLength={6} required value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{ ...inputStyle, fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', font: '600 13px Poppins', color: 'var(--navy-800)', marginBottom: 6 }}>New Password</label>
                  <input type="password" required minLength={8} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters" style={inputStyle}/>
                </div>
                <div>
                  <label style={{ display: 'block', font: '600 13px Poppins', color: 'var(--navy-800)', marginBottom: 6 }}>Confirm New Password</label>
                  <input type="password" required minLength={8} value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat new password" style={inputStyle}/>
                </div>
                <button type="submit" disabled={loading} className="afm-btn afm-btn-primary"
                  style={{ width: '100%', height: 48, fontSize: 15, justifyContent: 'center', marginTop: 4 }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
                <button type="button" onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', font: '500 13px Poppins', color: 'var(--fg-muted)', cursor: 'pointer', textAlign: 'center' }}>
                  ← Use a different email
                </button>
              </form>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <Link href="/login" style={{ font: '500 13px Poppins', color: 'var(--fg-muted)', textDecoration: 'none' }}>
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
