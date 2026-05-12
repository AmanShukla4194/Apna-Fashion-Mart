'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, BadgeCheck, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ShopCard = ({ shop }) => {
  const router = useRouter();

  const storeName = shop.name || shop.storeName || '';
  const storeImage = shop.store_images?.[0] || shop.storeImages?.[0];

  return (
    <Card
      className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/40 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/shop/${shop.id}`)}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {storeImage ? (
          <img
            src={storeImage}
            alt={storeName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 font-serif text-xl">
            {storeName.substring(0, 2).toUpperCase()}
          </div>
        )}

        {shop.is_verified && (
          <div className="absolute top-3 right-3 bg-white p-1.5 rounded-full shadow-md text-primary">
            <BadgeCheck className="w-5 h-5 text-secondary" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-primary truncate pr-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {storeName}
          </h3>
          {shop.rating && (
            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded text-yellow-800 text-xs font-bold">
              <Star className="w-3 h-3 fill-current" />
              <span>{shop.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1 shrink-0" />
          <span className="truncate">{shop.address}, {shop.city}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto mb-4">
          {shop.categories && shop.categories.slice(0, 3).map((category, idx) => (
            <Badge key={idx} variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal">
              {category}
            </Badge>
          ))}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between text-secondary font-medium text-sm group-hover:text-primary transition-colors">
          View Collection
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
};

export default ShopCard;
