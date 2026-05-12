'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Store, Package, DollarSign, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import ActivityFeedItem from '@/components/ActivityFeedItem';
import MetricsChart from '@/components/MetricsChart';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPlatformStats, getAllUsers, getAllStores, verifyStore } from '@/lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsData, storesData, usersData] = await Promise.all([
          getPlatformStats(),
          getAllStores(1, 50),
          getAllUsers(1, 50),
        ]);
        setStats(statsData);
        setStores(storesData.stores);
        setUsers(usersData.users);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const pendingStores = stores.filter(s => !s.is_verified);

  const revData = [
    { name: 'Week 1', value: 12000 }, { name: 'Week 2', value: 19000 },
    { name: 'Week 3', value: 15000 }, { name: 'Week 4', value: 24000 },
  ];

  const handleVerifyStore = async (storeId, verified) => {
    try {
      await verifyStore(storeId, verified);
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_verified: verified } : s));
      toast.success(verified ? 'Store verified' : 'Verification revoked');
    } catch {
      toast.error('Failed to update store status');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
      INITIALIZING ADMIN SECURE PORTAL...
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center shrink-0 border-b-4 border-secondary z-50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-secondary" />
          <div>
            <h1 className="font-bold tracking-widest uppercase leading-tight">Admin Portal</h1>
            <p className="text-[10px] text-white/50 tracking-widest">RESTRICTED ACCESS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Super Admin</span>
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">SA</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+14.2%" className="border-l-4 border-l-secondary" />
          <StatsCard title="Active Vendors" value={stats.totalStores} icon={Store} className="border-l-4 border-l-blue-500" />
          <StatsCard title="Platform Users" value={stats.totalUsers} icon={Users} className="border-l-4 border-l-green-500" />
          <StatsCard title="Pending Verifications" value={pendingStores.length} icon={ShieldCheck} trend={pendingStores.length > 0 ? 'Action Required' : 'All Clear'} className="border-l-4 border-l-orange-500" />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 bg-white border border-border shadow-sm p-1">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="users">User Base</TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-bold mb-4 font-serif">Revenue Growth (30 Days)</h3>
                <MetricsChart data={revData} color="hsl(217 100% 12%)" />
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">System Activity Log</h3>
                </div>
                <div className="space-y-0">
                  <ActivityFeedItem type="shop" title="New Shop Registration" description="Elite Fashion applied for partnership" time="10m ago" />
                  <ActivityFeedItem type="order" title="Large Order Flagged" description="Order exceeds ₹50k limit" time="1h ago" />
                  <ActivityFeedItem type="user" title="User Surge" description="50+ signups from new campaign" time="3h ago" />
                  <ActivityFeedItem type="revenue" title="Payout Processed" description="Weekly vendor settlements cleared" time="1d ago" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendors">
            <Card className="p-0 overflow-hidden border-border">
              <div className="p-6 border-b bg-white flex justify-between items-center">
                <h3 className="text-lg font-bold">Partner Ecosystem</h3>
                <Badge variant="outline">{stores.length} Total</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Store Name</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {stores.map(store => (
                      <tr key={store.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-medium">{store.name}</td>
                        <td className="px-6 py-4">{store.city}</td>
                        <td className="px-6 py-4">{store.rating?.toFixed(1) ?? '—'}</td>
                        <td className="px-6 py-4">
                          <Badge className={store.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'} variant="outline">
                            {store.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          {!store.is_verified && (
                            <Button size="sm" variant="outline" className="text-green-700 border-green-300 h-7 text-xs" onClick={() => handleVerifyStore(store.id, true)}>
                              Verify
                            </Button>
                          )}
                          {store.is_verified && (
                            <Button size="sm" variant="ghost" className="text-red-600 h-7 text-xs" onClick={() => handleVerifyStore(store.id, false)}>
                              Revoke
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">User Directory ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 capitalize">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="px-4 py-3">{user.city ?? '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="moderation">
            <Card className="p-6 border-red-200 bg-red-50/10">
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">Flagged Content</h3>
              </div>
              <p className="text-muted-foreground text-sm">Review user reports and system-flagged anomalies.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
