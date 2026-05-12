'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getWishlist, removeFromWishlist, addToCart } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) fetchWishlist();
  }, [currentUser]);

  const fetchWishlist = async () => {
    try {
      const items = await getWishlist(currentUser.id);
      setWishlistItems(items);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFromWishlist(id);
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      await addToCart({ user_id: currentUser.id, product_id: item.product_id, store_id: item.products?.store_id || '', quantity: 1 });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          My Wishlist
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <Card className="card-premium text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding products you love</p>
            <Button className="btn-primary" onClick={() => router.push('/categories')}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="card-premium">
                <div
                  className="aspect-square bg-muted rounded-xl mb-4 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/product/${item.product_id}`)}
                >
                  {item.products?.images?.[0] ? (
                    <img
                      src={item.products.images[0]}
                      alt={item.products?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {item.products?.name}
                </h3>

                <p className="text-2xl font-bold text-primary mb-4">₹{item.products?.price}</p>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WishlistPage;
