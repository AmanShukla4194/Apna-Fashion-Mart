'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCart, getAddresses, createOrder, clearCart } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [cart, addressList] = await Promise.all([
        getCart(currentUser.id),
        getAddresses(currentUser.id),
      ]);
      setCartItems(cart);
      setAddresses(addressList);
      const defaultAddr = addressList.find(a => a.is_default);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch (error) {
      toast.error('Failed to load checkout data');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const address = addresses.find(a => a.id === selectedAddress);
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxes = subtotal * 0.18;
      const deliveryCharges = subtotal > 500 ? 0 : 50;
      const total = subtotal + taxes + deliveryCharges;

      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      }));

      const order = await createOrder({
        store_id: cartItems[0].store_id,
        items: orderItems,
        total,
        subtotal,
        taxes,
        delivery_charges: deliveryCharges,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        delivery_address: {
          full_name: address.name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode
        }
      });

      await clearCart(currentUser.id);
      toast.success('Order placed successfully');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxes = subtotal * 0.18;
  const deliveryCharges = subtotal > 500 ? 0 : 50;
  const total = subtotal + taxes + deliveryCharges;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-premium">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Address
              </h3>

              {addresses.length === 0 ? (
                <p className="text-muted-foreground">No saved addresses. Please add one.</p>
              ) : (
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-xl">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">{address.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {address.address_line1}{address.address_line2 && `, ${address.address_line2}`},
                          {' '}{address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </Card>

            <Card className="card-premium">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h3>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-4 border rounded-xl">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when you receive</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-xl">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex-1 cursor-pointer">
                    <p className="font-medium">Online Payment</p>
                    <p className="text-sm text-muted-foreground">Pay now securely</p>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          <div>
            <Card className="card-premium sticky top-24">
              <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cartItems.length})</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes (18%)</span>
                  <span className="font-medium">₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">
                    {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full btn-primary"
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
