'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCart, updateCartQuantity, removeFromCart } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CartPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) fetchCart();
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      const items = await getCart(currentUser.id);
      setCartItems(items);
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartQuantity(id, newQuantity);
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
      setCartItems(cartItems.filter(item => item.id !== id));
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
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
          Shopping Cart
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="card-premium text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <Button className="btn-primary" onClick={() => router.push('/categories')}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="card-premium">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                      {item.products?.images?.[0] && (
                        <img src={item.products.images[0]} alt={item.products?.name} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold mb-1 line-clamp-2 text-sm sm:text-base">{item.products?.name || `Product #${item.product_id?.slice(0, 8)}`}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 -mt-1 -mr-1"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-base sm:text-lg font-bold text-primary">₹{item.price}</p>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg w-7 h-7 sm:w-9 sm:h-9"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <span className="w-8 sm:w-12 text-center font-medium text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-lg w-7 h-7 sm:w-9 sm:h-9"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="card-premium sticky top-24">
                <h3 className="text-xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
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
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
