'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, MapPin, Package, Settings, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import OrderCard from '@/components/OrderCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getCustomerOrders, getWishlist, getAddresses } from '@/lib/api';

const CustomerDashboard = () => {
  const { currentUser, profile, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      const [ordersData, wishlistData, addressesData] = await Promise.all([
        getCustomerOrders(currentUser.id),
        getWishlist(currentUser.id),
        getAddresses(currentUser.id),
      ]);
      setOrders(ordersData);
      setWishlist(wishlistData);
      setAddresses(addressesData);
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.order_status)).length;
  const totalSpent = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total ?? 0), 0);
  const displayName = profile?.name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 bg-primary text-white p-8 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif">Welcome, {displayName}</h1>
              <p className="text-white/70 mt-1">{currentUser?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="relative z-10 bg-white/10 border-white/20 hover:bg-white text-white hover:text-primary rounded-full px-6">
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatsCard title="Total Orders" value={orders.length} icon={ShoppingBag} />
          <StatsCard title="Total Spent" value={`₹${totalSpent.toFixed(2)}`} icon={CreditCard} />
          <StatsCard title="Pending Orders" value={pendingOrders} icon={Package} />
          <StatsCard title="Wishlist Items" value={wishlist.length} icon={Heart} />
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-8 bg-muted/50 p-1 rounded-xl w-full flex overflow-x-auto overflow-y-hidden justify-start">
            <TabsTrigger value="orders" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary"><Package className="w-4 h-4 mr-2 inline" />Orders</TabsTrigger>
            <TabsTrigger value="wishlist" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary"><Heart className="w-4 h-4 mr-2 inline" />Wishlist</TabsTrigger>
            <TabsTrigger value="addresses" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary"><MapPin className="w-4 h-4 mr-2 inline" />Addresses</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-primary"><Settings className="w-4 h-4 mr-2 inline" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <h3 className="text-2xl font-bold font-serif mb-4">Order History</h3>
            {loading ? (
              <div className="space-y-4"><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-32 w-full rounded-2xl" /></div>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-muted-foreground mb-6">Make your first purchase!</p>
                <Button className="btn-primary" onClick={() => router.push('/categories')}>Start Shopping</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} showStore onClick={() => router.push(`/orders/${order.id}`)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            <h3 className="text-2xl font-bold font-serif mb-6">My Wishlist</h3>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
            ) : wishlist.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Your wishlist is empty</p>
                <p className="text-muted-foreground">Save items you love to find them later.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {wishlist.map(item => (
                  <Card key={item.id} className="p-4 bg-muted/20 border-none relative group cursor-pointer" onClick={() => router.push(`/product/${item.product_id}`)}>
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                      {item.products?.images?.[0] && <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />}
                    </div>
                    <p className="font-medium text-sm truncate mb-1">{item.products?.name}</p>
                    <p className="font-bold text-primary">₹{item.products?.price}</p>
                    <Button size="sm" className="w-full mt-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View Item</Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold font-serif">Saved Addresses</h3>
              <Button className="rounded-full">Add New Address</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map(address => (
                <Card key={address.id} className="p-6 relative border-border">
                  {address.is_default && (
                    <span className="absolute top-4 right-4 text-xs font-bold text-secondary uppercase bg-secondary/10 px-2 py-1 rounded">Default</span>
                  )}
                  <h4 className="font-bold mb-2">{address.name}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <p>{address.address_line1}</p>
                    {address.address_line2 && <p>{address.address_line2}</p>}
                    <p>{address.city}, {address.state} {address.pincode}</p>
                    {address.phone && <p className="pt-2">{address.phone}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-8 max-w-2xl">
              <h3 className="text-xl font-bold mb-6 border-b pb-4">Account Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Order updates (Email)</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Promotional offers</label>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <Button variant="destructive" onClick={async () => { await logout(); router.push('/'); }} className="rounded-full">
                    Sign Out Securely
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
