'use client';

import { useState } from 'react';

interface Props {
  amountInPaise: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: unknown) => void;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    Razorpay: new (options: unknown) => { open(): void };
  }
}

export default function RazorpayButton({
  amountInPaise, orderId, customerName, customerEmail, customerPhone,
  onSuccess, onFailure, children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const loadScript = () =>
    new Promise<void>((resolve) => {
      if (document.getElementById('razorpay-sdk')) { resolve(); return; }
      const s = document.createElement('script');
      s.id = 'razorpay-sdk';
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve();
      document.body.appendChild(s);
    });

  const handlePay = async () => {
    setLoading(true);
    try {
      await loadScript();
      const rz = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        order_id: orderId,
        name: 'Apna Fashion Mart',
        image: '/afm-logo.webp',
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        theme: { color: '#FF1493' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const res = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const data = await res.json();
          if (data.success) onSuccess(response.razorpay_payment_id);
          else onFailure?.(data.error);
        },
      });
      rz.open();
    } catch (e) {
      onFailure?.(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full py-3 px-6 rounded-xl font-semibold text-white"
      style={{ background: loading ? '#ccc' : 'var(--magenta-600)' }}
    >
      {loading ? 'Loading…' : (children ?? 'Pay Now')}
    </button>
  );
}
