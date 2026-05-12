
import React from 'react';
import { Card } from '@/components/ui/card';

const CategoryCard = ({ icon, label, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 gap-4 rounded-full aspect-square border border-border/50 hover:border-secondary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-card"
    >
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
        <span className="text-3xl filter grayscale contrast-200 group-hover:brightness-0 group-hover:invert transition-all duration-300">
          {icon}
        </span>
      </div>
      <span className="font-medium text-sm text-primary text-center leading-tight">
        {label}
      </span>
    </Card>
  );
};

export default CategoryCard;
