'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Package, ShoppingBag, MessageSquare, TrendingUp, AlertCircle, Plus, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import OrderCard from '@/components/OrderCard';
import MetricsChart from '@/components/MetricsChart';
import InquiryManagement from '@/components/InquiryManagement';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getVendorStore, getProductsByVendor, getVendorOrders, getStoreInquiries } from '@/lib/api';

const VendorDashboard = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) fetchVendorData();
  }, [currentUser]);

  const fetchVendorData = async () => {
    try {
      const storeData = await getVendorStore(currentUser.id);
      if (storeData) {
        setStore(storeData);
        const [productsData, ordersData, inquiriesData] = await Promise.all([
          getProductsByVendor(currentUser.id),
          getVendorOrders(storeData.id),
          getStoreInquiries(storeData.id),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setInquiries(inquiriesData);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total ?? 0), 0);
  const lowStock = products.filter(p => p.stock < 5);
  const pendingInquiries = inquiries.filter(i => i.status === 'open');
  const pendingOrders = orders.filter(o => o.order_status === 'pending');

  const chartData = [
    { name: 'Mon', value: 4000 }, { name: 'Tue', value: 3000 }, { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 4500 }, { name: 'Fri', value: 7000 }, { name: 'Sat', value: 9000 }, { name: 'Sun', value: 8500 },
  ];

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary font-serif">Vendor Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your boutique performance</p>
          </div>
          {store && (
            <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-border">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                {store.logo ? <img src={store.logo} className="w-full h-full object-cover" alt="Store logo" /> : <Store className="text-muted-foreground" />}
              </div>
              <div>
                <p className="font-bold text-foreground leading-tight">{store.name}</p>
                <Badge variant={store.is_verified ? 'default' : 'secondary'} className="text-[10px]">
                  {store.is_verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {!store ? (
          <Card className="p-12 text-center bg-white">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Create Your Store</h2>
            <p className="text-muted-foreground mb-6">Set up your store profile to start selling.</p>
            <Button className="btn-primary">Setup Store Profile</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard title="Total Revenue" value={`₹${totalRevenue.toFixed(0)}`} icon={TrendingUp} trend="+12%" trendLabel="vs last week" />
              <StatsCard title="Total Orders" value={orders.length} icon={ShoppingBag} />
              <StatsCard title="Active Products" value={products.length} icon={Package} />
              <StatsCard title="Store Rating" value={store.rating?.toFixed(1) || 'New'} icon={Star} />
            </div>

            {(lowStock.length > 0 || pendingInquiries.length > 0 || pendingOrders.length > 0) && (
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {lowStock.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium text-sm">{lowStock.length} products running low on stock</span>
                  </div>
                )}
                {pendingOrders.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
                    <Package className="w-5 h-5" />
                    <span className="font-medium text-sm">{pendingOrders.length} new orders require fulfillment</span>
                  </div>
                )}
                {pendingInquiries.length > 0 && (
                  <div className="bg-pink-50 border border-pink-200 text-pink-800 px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium text-sm">{pendingInquiries.length} unread customer inquiries</span>
                  </div>
                )}
              </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-white border border-border p-1 w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
                <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 p-6 bg-white">
                    <h3 className="text-lg font-bold mb-4">Sales Analytics</h3>
                    <MetricsChart data={chartData} color="hsl(330 100% 50%)" />
                  </Card>
                  <Card className="p-6 bg-white flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold">Recent Orders</h3>
                      <Button variant="link" size="sm" className="text-secondary">View All</Button>
                    </div>
                    <div className="space-y-4 flex-1">
                      {orders.slice(0, 4).map(o => (
                        <div key={o.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                          <div>
                            <p className="font-medium text-sm">#{o.id.slice(0, 6).toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₹{o.total}</p>
                            <p className="text-[10px] uppercase text-secondary font-bold">{o.order_status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <Card className="bg-white p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Product Catalog</h3>
                    <Button className="btn-primary rounded-full" size="sm">
                      <Plus className="w-4 h-4 mr-1" /> Add Product
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="pb-3 font-medium">Product</th>
                          <th className="pb-3 font-medium">Category</th>
                          <th className="pb-3 font-medium">Price</th>
                          <th className="pb-3 font-medium">Stock</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt={p.name} />}
                              </div>
                              <span className="font-medium max-w-[200px] truncate">{p.name}</span>
                            </td>
                            <td className="py-3 capitalize">{p.category}</td>
                            <td className="py-3 font-medium">₹{p.price}</td>
                            <td className="py-3">
                              <Badge variant={p.stock > 10 ? 'outline' : 'destructive'} className="font-normal">{p.stock} units</Badge>
                            </td>
                            <td className="py-3">
                              <Button variant="ghost" size="sm" className="text-primary h-8 px-2">Edit</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-4">
                  {orders.map(order => <OrderCard key={order.id} order={order} showCustomer={true} />)}
                </div>
              </TabsContent>

              <TabsContent value="inquiries">
                <InquiryManagement storeId={store.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
