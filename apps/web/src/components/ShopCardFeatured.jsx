'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, BadgeCheck, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ShopCardFeatured = ({ shop }) => {
  const router = useRouter();

  const storeName = shop.name || shop.storeName || '';
  const storeImage = shop.store_images?.[0] || shop.storeImages?.[0];

  return (
    <Card
      className="group bg-card rounded-2xl overflow-hidden shadow-md border-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={() => router.push(`/shop/${shop.id}`)}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {storeImage ? (
          <img
            src={storeImage}
            alt={storeName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 font-serif text-3xl">
            {storeName.substring(0, 2).toUpperCase()}
          </div>
        )}

        {shop.is_verified && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg text-secondary">
            <BadgeCheck className="w-5 h-5 text-secondary" />
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold text-primary">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          {shop.rating?.toFixed(1) || 'New'}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-primary mb-2 line-clamp-1 font-serif">
          {storeName}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground mb-5 bg-muted/50 w-fit px-3 py-1.5 rounded-full">
          <MapPin className="w-4 h-4 mr-1.5 text-secondary shrink-0" />
          <span className="truncate">{shop.address}, {shop.city}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto mb-6">
          {shop.categories && shop.categories.slice(0, 3).map((category, idx) => (
            <Badge key={idx} variant="outline" className="bg-background text-muted-foreground border-border/60 font-normal py-1 px-3">
              {category}
            </Badge>
          ))}
        </div>

        <Button variant="outline" className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300 rounded-xl">
          Visit Boutique
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ShopCardFeatured;
