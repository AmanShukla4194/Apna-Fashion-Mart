'use client';

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrderById } from '@/lib/api';
import { toast } from 'sonner';

const OrderTrackingPage = ({ id }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (error) {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = { pending: Clock, confirmed: CheckCircle, shipped: Truck, delivered: Package };
    const Icon = icons[status] || Clock;
    return <Icon className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground text-lg">Order not found</p>
        </div>
        <Footer />
      </>
    );
  }

  const deliveryAddr = order.delivery_address || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-xl sm:text-4xl font-bold mb-8 break-all sm:break-normal" style={{ fontFamily: 'Playfair Display, serif' }}>
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>

        <Card className="card-premium mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div>
              <h3 className="text-xl font-semibold mb-2">Order Status</h3>
              <p className="text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={`${getStatusColor(order.order_status)} text-white`}>
              {order.order_status}
            </Badge>
          </div>

          <div className="space-y-4">
            {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => {
              const currentIndex = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.order_status);
              const isActive = currentIndex >= index;
              return (
                <div key={status} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? getStatusColor(status) : 'bg-muted'} text-white`}>
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {deliveryAddr.full_name && (
          <Card className="card-premium mb-8">
            <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
            <p className="font-medium">{deliveryAddr.full_name}</p>
            <p className="text-muted-foreground">
              {deliveryAddr.address_line1}
              {deliveryAddr.address_line2 && `, ${deliveryAddr.address_line2}`}
            </p>
            <p className="text-muted-foreground">
              {deliveryAddr.city}, {deliveryAddr.state} - {deliveryAddr.pincode}
            </p>
            {deliveryAddr.phone && <p className="text-muted-foreground">{deliveryAddr.phone}</p>}
          </Card>
        )}

        <Card className="card-premium">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{(order.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span className="font-medium">₹{(order.taxes ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium">
                {(order.delivery_charges ?? 0) === 0 ? 'FREE' : `₹${order.delivery_charges}`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{(order.total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
