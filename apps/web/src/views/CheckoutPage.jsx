'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, Package, ArrowLeft, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/aws/config';
import Link from 'next/link';

const inputStyle = {
  width: '100%', height: 42, padding: '0 12px',
  border: '1px solid var(--border)', borderRadius: 10,
  font: '400 14px Poppins', background: '#F8F9FB', outline: 'none', boxSizing: 'border-box',
};

export default function CheckoutPage() {
  const { currentUser, isAuthenticated, initialLoading } = useAuth();
  const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const { items, clearCart } = useCart();
  const router = useRouter();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [form, setForm] = useState({
    fullName: '', phone: '', line1: '', line2: '',
    city: '', state: '', pincode: '', country: 'India',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [initialLoading, isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!initialLoading && isAuthenticated && items.length === 0 && !orderSuccess) {
      router.push('/cart');
    }
  }, [initialLoading, isAuthenticated, items]);

  // Load saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    apiRequest('/addresses')
      .then((data) => {
        const list = data?.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const def = list.find(a => a.is_default) || list[0];
          setSelectedAddressId(def.id);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true));
  }, [isAuthenticated]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0; // temporarily free for testing
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    // Check all items are real DB products
    const itemsWithoutShop = items.filter(i => !i.shopId);
    if (itemsWithoutShop.length > 0) {
      toast.error('Some cart items are demo products. Please add real products from a verified boutique to checkout.');
      return;
    }

    setPlacing(true);
    try {
      let addressId = selectedAddressId;

      // Save new address if user filled the form
      if (showNewForm || !addressId) {
        const { fullName, phone, line1, city, state, pincode } = form;
        if (!fullName || !phone || !line1 || !city || !state || !pincode) {
          toast.error('Please fill all required address fields');
          setPlacing(false);
          return;
        }
        const saved = await apiRequest('/addresses', {
          method: 'POST',
          body: JSON.stringify({ ...form, isDefault: true }),
        });
        addressId = saved.id;
      }

      // Group items by shop
      const byShop = {};
      for (const item of items) {
        const sid = item.shopId;
        if (!byShop[sid]) byShop[sid] = [];
        byShop[sid].push(item);
      }

      if (paymentMethod === 'razorpay') {
        // Create Razorpay order on backend
        const rzpOrder = await apiRequest('/razorpay/create-order', {
          method: 'POST',
          body: JSON.stringify({ amount: total * 100 }), // paise
        });

        // Load Razorpay script if not already loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }

        // Open Razorpay checkout
        await new Promise((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: rzpOrder.key,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            order_id: rzpOrder.id,
            name: 'Apna Fashion Mart',
            description: `Order for ${items.length} item(s)`,
            image: '/afm-logo.webp',
            prefill: {
              name: currentUser?.name || '',
              email: currentUser?.email || '',
            },
            theme: { color: '#FF1493' },
            modal: { confirm_close: true },
            handler: async (response) => {
              try {
                // Place order in DB after successful payment
                const [, shopItems] = Object.entries(byShop)[0];
                const order = await apiRequest('/orders', {
                  method: 'POST',
                  body: JSON.stringify({
                    items: shopItems.map(i => ({ productId: i.id, quantity: i.qty, size: i.size || null, color: i.color || null })),
                    addressId,
                    paymentMethod: 'razorpay',
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                clearCart();
                setOrderSuccess(order);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
          });
          rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed')));
          rzp.open();
        });

        setPlacing(false);
        return;
      }

      // COD flow
      const orders = [];
      for (const [, shopItems] of Object.entries(byShop)) {
        const order = await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify({
            items: shopItems.map(i => ({ productId: i.id, quantity: i.qty, size: i.size || null, color: i.color || null })),
            addressId,
            paymentMethod: 'cod',
          }),
        });
        orders.push(order);
      }

      clearCart();
      setOrderSuccess(orders[0]);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (initialLoading) return null;

  // Order success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={36} color="#16a34a" />
            </div>
            <h1 style={{ font: '700 28px Playfair Display', color: 'var(--navy-800)', marginBottom: 8 }}>Order Confirmed!</h1>
            <p style={{ font: '400 14px Poppins', color: 'var(--fg-muted)', marginBottom: 6 }}>
              Order #{orderSuccess.order_number}
            </p>
            <p style={{ font: '400 14px Poppins', color: 'var(--fg-muted)', marginBottom: 32 }}>
              {paymentMethod === 'cod' ? 'Pay on delivery.' : 'Payment received.'} Your boutique will confirm within 2 hours.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/account" className="afm-btn afm-btn-primary">View my orders</Link>
              <Link href="/" className="afm-btn afm-btn-ghost">Continue shopping</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Link href="/cart" style={{ color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4, font: '400 14px Poppins', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to cart
            </Link>
            <h1 style={{ font: '700 28px Playfair Display', color: 'var(--navy-800)', margin: 0 }}>Checkout</h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Delivery address */}
              <Card className="card-premium" style={{ padding: 24 }}>
                <h3 style={{ font: '600 18px Poppins', color: 'var(--navy-800)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} color="var(--magenta-600)" /> Delivery Address
                </h3>

                {savedAddresses.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: showNewForm ? 16 : 0 }}>
                    {savedAddresses.map(a => (
                      <label key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', border: `2px solid ${selectedAddressId === a.id ? 'var(--magenta-600)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', background: selectedAddressId === a.id ? '#fef1f7' : '#fff' }}>
                        <input type="radio" checked={selectedAddressId === a.id} onChange={() => { setSelectedAddressId(a.id); setShowNewForm(false); }} style={{ marginTop: 3 }} />
                        <div style={{ font: '400 13px Poppins', color: 'var(--navy-800)' }}>
                          <div style={{ fontWeight: 600 }}>{a.full_name} · {a.phone}</div>
                          <div style={{ color: 'var(--fg-muted)', marginTop: 2 }}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} — {a.pincode}</div>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => { setShowNewForm(s => !s); setSelectedAddressId(''); }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--magenta-600)', font: '500 13px Poppins', cursor: 'pointer', padding: '4px 0' }}>
                      {showNewForm ? '— Cancel new address' : '+ Add new address'}
                    </button>
                  </div>
                )}

                {showNewForm && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      ['fullName', 'Full Name *', '1 / 2'], ['phone', 'Phone *', '2 / 3'],
                      ['line1', 'Address Line 1 *', '1 / 3'], ['line2', 'Line 2 (optional)', '1 / 3'],
                      ['city', 'City *', '1 / 2'], ['state', 'State *', '2 / 3'],
                      ['pincode', 'PIN Code *', '1 / 2'],
                    ].map(([key, label, col]) => (
                      <div key={key} style={{ gridColumn: col }}>
                        <Label style={{ font: '500 12px Poppins', color: 'var(--navy-800)', marginBottom: 4, display: 'block' }}>{label}</Label>
                        <input
                          value={form[key]} onChange={e => setF(key, e.target.value)}
                          placeholder={label.replace(' *', '')}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Payment method */}
              <Card className="card-premium" style={{ padding: 24 }}>
                <h3 style={{ font: '600 18px Poppins', color: 'var(--navy-800)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={18} color="var(--magenta-600)" /> Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { val: 'cod', label: 'Cash on Delivery', sub: 'Pay ₹' + total.toLocaleString('en-IN') + ' when your order arrives' },
                    { val: 'razorpay', label: 'Pay Online — UPI / Card / Netbanking', sub: 'Secure payment via Razorpay' },
                  ].map(opt => (
                    <label key={opt.val} style={{ display: 'flex', gap: 12, padding: '14px 16px', border: `2px solid ${paymentMethod === opt.val ? 'var(--magenta-600)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', background: paymentMethod === opt.val ? '#fef1f7' : '#fff' }}>
                      <input type="radio" checked={paymentMethod === opt.val} onChange={() => setPaymentMethod(opt.val)} style={{ marginTop: 3 }} />
                      <div>
                        <div style={{ font: '600 14px Poppins', color: 'var(--navy-800)' }}>{opt.label}</div>
                        <div style={{ font: '400 12px Poppins', color: 'var(--fg-muted)', marginTop: 2 }}>{opt.sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right column — order summary */}
            <div>
              <Card className="card-premium" style={{ padding: 24, position: 'sticky', top: 96 }}>
                <h3 style={{ font: '600 18px Poppins', color: 'var(--navy-800)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Package size={18} color="var(--magenta-600)" /> Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: item.img ? `url(${item.img}) center/cover` : 'var(--neutral-100)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: '500 13px Poppins', color: 'var(--navy-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        <div style={{ font: '400 11px Poppins', color: 'var(--fg-muted)' }}>{item.store} · {item.size} · Qty {item.qty}</div>
                      </div>
                      <div style={{ font: '600 13px Poppins', color: 'var(--navy-800)', flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 13px Poppins', color: 'var(--fg-muted)' }}>
                    <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 13px Poppins', color: 'var(--fg-muted)' }}>
                    <span>Delivery</span>
                    <span style={{ color: deliveryFee === 0 ? '#16a34a' : undefined }}>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <div style={{ font: '400 11px Poppins', color: '#16a34a' }}>Free delivery on orders above ₹999</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', font: '700 16px Poppins', color: 'var(--navy-800)', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="afm-btn afm-btn-primary"
                  style={{ width: '100%', marginTop: 20, fontSize: 15, padding: '14px 0', opacity: placing ? 0.7 : 1 }}
                >
                  {placing ? 'Placing order…' : paymentMethod === 'cod' ? 'Place Order — Pay on Delivery' : 'Proceed to Pay — ₹' + total.toLocaleString('en-IN')}
                </button>

                <p style={{ font: '400 11px Poppins', color: 'var(--fg-muted)', textAlign: 'center', marginTop: 12 }}>
                  By placing the order you agree to our <Link href="/legal/terms" style={{ color: 'var(--magenta-600)' }}>Terms</Link> and <Link href="/legal/returns" style={{ color: 'var(--magenta-600)' }}>Return Policy</Link>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
