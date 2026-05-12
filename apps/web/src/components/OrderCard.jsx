
import React from 'react';
import { Package, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OrderCard = ({ order, onClick, showCustomer = false, showStore = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow group">
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Order #{order.id.substring(0, 8).toUpperCase()}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
              <Clock className="w-3 h-3" /> {formatDate(order.created)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
          <Badge variant="outline" className={cn("uppercase text-[10px] font-bold tracking-wider", getStatusColor(order.orderStatus))}>
            {order.orderStatus}
          </Badge>
          <span className="font-bold text-lg text-primary">₹{order.totalAmount?.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-foreground">
            {order.items?.length || 0} Item(s)
          </p>
          
          {showCustomer && order.deliveryAddress && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{order.deliveryAddress.fullName} • {order.deliveryAddress.city}, {order.deliveryAddress.state}</span>
            </div>
          )}
          
          {showStore && order.storeName && (
            <p className="text-sm text-muted-foreground">
              From: <span className="font-medium text-foreground">{order.storeName}</span>
            </p>
          )}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClick}
          className="w-full sm:w-auto rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
        >
          View Details <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

export default OrderCard;
