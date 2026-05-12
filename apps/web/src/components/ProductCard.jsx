'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addToCart, addToWishlist } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { isAuthenticated, isCustomer, currentUser } = useAuth();

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      toast.error('Please login as a customer to add to wishlist');
      return;
    }
    try {
      await addToWishlist(currentUser.id, product.id, product.store_id);
      toast.success('Saved to wishlist');
    } catch (error) {
      toast.error('Failed to save to wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      toast.error('Please login as a customer to add to cart');
      return;
    }
    try {
      await addToCart({ user_id: currentUser.id, product_id: product.id, store_id: product.store_id, quantity: 1, price: product.price });
      toast.success('Added to bag');
    } catch (error) {
      toast.error('Failed to add to bag');
    }
  };

  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Card
      className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
            No Image
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <Badge className="bg-secondary text-white font-bold px-2 py-1 shadow-md border-none">
              {discount}% OFF
            </Badge>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <Badge className="bg-orange-500 text-white border-none shadow-md">
              Few Left
            </Badge>
          )}
        </div>

        <div className="absolute right-3 top-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-white text-primary hover:bg-secondary hover:text-white"
            onClick={handleAddToWishlist}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/80 to-transparent">
          <Button
            className="w-full bg-white text-primary hover:bg-secondary hover:text-white rounded-full shadow-lg font-semibold"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 truncate">{product.stores?.name}</p>
        <h3 className="text-base font-medium text-foreground mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {discount > 0 ? (
              <>
                <span className="text-xs text-muted-foreground line-through">₹{product.original_price}</span>
                <span className="text-lg font-bold text-secondary">₹{product.price}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">₹{product.price}</span>
            )}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center text-xs font-medium text-foreground">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 mr-1" />
              {product.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
