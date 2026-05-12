
import React from 'react';
import { Card } from '@/components/ui/card';

const TrendingCollectionCard = ({ title, image, className, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border-none cursor-pointer ${className}`}
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif mb-2">
          {title}
        </h3>
        <span className="inline-block text-sm font-medium text-secondary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          Explore Collection &rarr;
        </span>
      </div>
    </Card>
  );
};

export default TrendingCollectionCard;
