
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, className }) => {
  return (
    <Card className={cn("p-6 flex flex-col justify-between", className)}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-primary/5 rounded-xl">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          {value}
        </h3>
        {trend && (
          <p className={cn("text-sm font-medium", trend.startsWith('+') ? "text-green-600" : "text-red-600")}>
            {trend} <span className="text-muted-foreground font-normal">{trendLabel}</span>
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
