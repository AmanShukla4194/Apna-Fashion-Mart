
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TestimonialCard = ({ name, role, text, rating, avatar }) => {
  return (
    <Card className="p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
      <Quote className="absolute top-6 right-6 w-12 h-12 text-muted opacity-50 group-hover:text-accent transition-colors duration-300" />
      
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} 
          />
        ))}
      </div>
      
      <blockquote className="text-foreground/80 leading-relaxed mb-8 relative z-10 line-clamp-4">
        "{text}"
      </blockquote>
      
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-primary font-serif">{name}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;
