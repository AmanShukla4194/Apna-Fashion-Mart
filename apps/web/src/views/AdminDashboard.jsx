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

const FLAGGED_ITEMS = [
  { id: 'f1', type: 'review',  content: 'This shop is a scam, do not buy!',               reporter: 'user@example.com',   reportedAt: '2025-05-18', severity: 'high',   status: 'pending'   },
  { id: 'f2', type: 'product', content: 'Duplicate listing — exact copy of AFM-AA-01',     reporter: 'vendor@example.com', reportedAt: '2025-05-17', severity: 'medium', status: 'pending'   },
  { id: 'f3', type: 'review',  content: 'Fake 5-star review with no purchase history',     reporter: 'system',             reportedAt: '2025-05-16', severity: 'medium', status: 'pending'   },
  { id: 'f4', type: 'shop',    content: 'Vendor selling counterfeit branded goods',         reporter: 'user2@example.com',  reportedAt: '2025-05-15', severity: 'high',   status: 'resolved'  },
  { id: 'f5', type: 'product', content: 'Images do not match product description',          reporter: 'user3@example.com',  reportedAt: '2025-05-14', severity: 'low',    status: 'dismissed' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suspendedUsers, setSuspendedUsers] = useState(new Set());
  const [modActions, setModActions] = useState({});

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

  const handleSuspendUser = (userId, suspend) => {
    setSuspendedUsers(prev => {
      const s = new Set(prev);
      suspend ? s.add(userId) : s.delete(userId);
      return s;
    });
    toast.success(suspend ? 'User suspended' : 'User reactivated');
  };

  const handleModAction = (id, action) => {
    setModActions(prev => ({ ...prev, [id]: action }));
    toast.success(`Content ${action}`);
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
          <TabsList className="mb-6 bg-white border border-border shadow-sm p-1 overflow-x-auto w-full justify-start">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
            <TabsTrigger value="users">User Base</TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
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
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
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
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stores.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No stores registered yet</td></tr>
                    )}
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
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-muted/20">
                        <td className={`px-4 py-3 font-medium ${suspendedUsers.has(user.id) ? 'line-through text-muted-foreground' : ''}`}>{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 capitalize"><Badge variant="outline">{user.role}</Badge></td>
                        <td className="px-4 py-3">{user.city ?? '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant={suspendedUsers.has(user.id) ? 'outline' : 'ghost'}
                            className={suspendedUsers.has(user.id) ? 'text-green-600 border-green-300 h-7 text-xs' : 'text-red-500 h-7 text-xs'}
                            onClick={() => handleSuspendUser(user.id, !suspendedUsers.has(user.id))}
                          >
                            {suspendedUsers.has(user.id) ? 'Reactivate' : 'Suspend'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">Flagged Content ({FLAGGED_ITEMS.filter(i => i.status === 'pending' && !modActions[i.id]).length} pending)</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">High: {FLAGGED_ITEMS.filter(i => i.severity === 'high').length}</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Medium: {FLAGGED_ITEMS.filter(i => i.severity === 'medium').length}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Low: {FLAGGED_ITEMS.filter(i => i.severity === 'low').length}</span>
              </div>
            </div>
            {FLAGGED_ITEMS.map(item => (
              <Card key={item.id} className={`p-5 border-l-4 ${item.severity === 'high' ? 'border-l-red-500 bg-red-50/30' : item.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50/20' : 'border-l-blue-400'}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.type}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.severity === 'high' ? 'bg-red-100 text-red-700' : item.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.severity}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${modActions[item.id] === 'removed' || item.status === 'resolved' ? 'bg-green-100 text-green-700' : modActions[item.id] === 'dismissed' || item.status === 'dismissed' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                        {modActions[item.id] || item.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 break-words">"{item.content}"</p>
                    <p className="text-xs text-muted-foreground">Reported by: {item.reporter} · {item.reportedAt}</p>
                  </div>
                  {!modActions[item.id] && item.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 h-7 text-xs hover:bg-red-50" onClick={() => handleModAction(item.id, 'removed')}>Remove</Button>
                      <Button size="sm" variant="outline" className="text-green-600 border-green-300 h-7 text-xs hover:bg-green-50" onClick={() => handleModAction(item.id, 'dismissed')}>Dismiss</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 border-l-4 border-l-green-500">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Disbursed</div>
                <div className="text-2xl font-bold text-green-700">₹{(stats.totalRevenue * 0.88).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">After 12% platform fee</div>
              </Card>
              <Card className="p-5 border-l-4 border-l-orange-400">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending Payouts</div>
                <div className="text-2xl font-bold text-orange-600">₹{Math.round(stats.totalRevenue * 0.12).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">To be processed Monday</div>
              </Card>
              <Card className="p-5 border-l-4 border-l-blue-500">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Platform Commission</div>
                <div className="text-2xl font-bold text-blue-700">₹{Math.round(stats.totalRevenue * 0.12).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Current month earnings</div>
              </Card>
            </div>
            <Card className="overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-white flex-wrap gap-3">
                <h3 className="font-bold text-lg">Pending Vendor Payouts</h3>
                <Button size="sm" className="bg-primary text-white text-xs h-8 px-4 rounded-full hover:bg-primary/90" onClick={() => toast.success('Batch payout initiated for all verified vendors')}>Process All Payouts</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Vendor</th>
                      <th className="px-6 py-3">Orders</th>
                      <th className="px-6 py-3">Gross</th>
                      <th className="px-6 py-3">Commission (12%)</th>
                      <th className="px-6 py-3">Net Due</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {stores.filter(s => s.is_verified).slice(0, 8).map((store, i) => {
                      const gross = [41200, 28700, 55000, 19800, 32500, 47000, 22300, 38900][i] ?? 25000;
                      const orderCount = [14, 9, 18, 7, 11, 15, 8, 13][i] ?? 10;
                      return (
                        <tr key={store.id} className="hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium">{store.name}</td>
                          <td className="px-6 py-4">{orderCount}</td>
                          <td className="px-6 py-4">₹{gross.toLocaleString()}</td>
                          <td className="px-6 py-4 text-red-500">−₹{(gross * 0.12).toFixed(0)}</td>
                          <td className="px-6 py-4 font-bold text-green-700">₹{(gross * 0.88).toFixed(0)}</td>
                          <td className="px-6 py-4">
                            <Button size="sm" variant="outline" className="h-7 text-xs text-blue-700 border-blue-300 hover:bg-blue-50" onClick={() => toast.success(`Payout of ₹${(gross * 0.88).toFixed(0)} initiated for ${store.name}`)}>Pay Now</Button>
                          </td>
                        </tr>
                      );
                    })}
                    {stores.filter(s => s.is_verified).length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No verified vendors yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
