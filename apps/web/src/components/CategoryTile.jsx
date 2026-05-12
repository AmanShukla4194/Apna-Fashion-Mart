
import React from 'react';
import { Card } from '@/components/ui/card';

const CategoryTile = ({ category, icon: Icon, onClick }) => {
  return (
    <Card 
      className="card-premium cursor-pointer hover:-translate-y-1 transition-all duration-300 text-center"
      onClick={onClick}
    >
      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
        {Icon && <Icon className="w-8 h-8 text-primary" />}
      </div>
      <h3 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif' }}>
        {category}
      </h3>
    </Card>
  );
};

export default CategoryTile;
