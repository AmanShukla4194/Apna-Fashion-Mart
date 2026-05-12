'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addToCart } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductCardHome = ({ product }) => {
  const router = useRouter();
  const { isAuthenticated, isCustomer, currentUser } = useAuth();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      toast.error('Please login as a customer to add to cart');
      return;
    }
    try {
      await addToCart({ user_id: currentUser.id, product_id: product.id, store_id: product.store_id, quantity: 1, price: product.price });
      toast.success('Added to shopping bag');
    } catch (error) {
      toast.error('Failed to add to bag');
    }
  };

  const storeName = product.stores?.name || 'Local Boutique';

  return (
    <Card
      className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30 font-serif">
            No Image
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-primary/90 to-transparent">
          <Button
            className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl font-medium shadow-lg"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="w-4 h-4 mr-2" /> Add to Bag
          </Button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 truncate">{storeName}</p>
        <h3 className="text-base font-semibold text-primary mb-3 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">₹{product.price}</span>

          {product.rating > 0 && (
            <div className="flex items-center text-xs font-medium text-primary bg-muted px-2 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
              {product.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCardHome;
