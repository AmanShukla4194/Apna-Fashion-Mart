
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PromotionalCard = ({ discount, title, description, code, color = "bg-primary" }) => {
  return (
    <Card className={`relative overflow-hidden p-8 rounded-3xl text-white ${color} border-none`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
          Limited Time Offer
        </span>
        
        <h3 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
          {discount}
        </h3>
        
        <h4 className="text-xl font-bold font-serif mb-2">{title}</h4>
        <p className="text-white/80 text-sm mb-8 leading-relaxed max-w-[280px]">
          {description}
        </p>
        
        <div className="mt-auto">
          {code && (
            <div className="text-sm font-medium mb-4">
              Use code: <span className="font-mono bg-white/20 px-2 py-1 rounded tracking-widest">{code}</span>
            </div>
          )}
          <Button variant="secondary" className="w-fit rounded-full bg-white text-primary hover:bg-white/90">
            Shop Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PromotionalCard;
