
import React from 'react';
import { Card } from '@/components/ui/card';

const HowItWorksStep = ({ number, icon: Icon, title, description }) => {
  return (
    <Card className="relative p-8 rounded-2xl border-none shadow-none bg-transparent flex flex-col items-center text-center group overflow-hidden">
      <div className="absolute top-4 right-4 text-9xl font-black text-muted/40 font-serif -z-10 transition-transform duration-500 group-hover:scale-110">
        {number}
      </div>
      
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300 shadow-lg shadow-accent/50">
        <Icon className="w-8 h-8 text-secondary group-hover:text-white transition-colors duration-300" />
      </div>
      
      <h3 className="text-xl font-bold text-primary mb-3 font-serif">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-[250px]">
        {description}
      </p>
    </Card>
  );
};

export default HowItWorksStep;
