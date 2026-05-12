
import React from 'react';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const InquiryCard = ({ inquiry, onRespond }) => {
  return (
    <Card className="p-5 flex flex-col justify-between hover:border-primary/30 transition-colors">
      <div>
        <div className="flex justify-between items-start mb-3">
          <Badge variant={inquiry.status === 'open' ? 'destructive' : 'secondary'} className="uppercase text-[10px] tracking-wider font-bold">
            {inquiry.status}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(inquiry.created).toLocaleDateString()}
          </span>
        </div>
        
        <h4 className="font-semibold text-primary mb-1">
          {inquiry.inquiryType.charAt(0).toUpperCase() + inquiry.inquiryType.slice(1)} Inquiry
        </h4>
        <p className="text-xs text-muted-foreground mb-3">From: {inquiry.customerName || 'Customer'}</p>
        
        <div className="bg-muted/50 p-3 rounded-lg mb-4 text-sm text-foreground line-clamp-3">
          "{inquiry.message}"
        </div>
        
        {inquiry.productName && (
          <p className="text-xs font-medium text-primary bg-primary/5 p-2 rounded mb-4 truncate">
            Ref: {inquiry.productName}
          </p>
        )}
      </div>

      {inquiry.status === 'open' && onRespond ? (
        <Button onClick={() => onRespond(inquiry)} size="sm" className="w-full rounded-full">
          Respond Now
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="w-full rounded-full" disabled>
          Responded
        </Button>
      )}
    </Card>
  );
};

export default InquiryCard;
