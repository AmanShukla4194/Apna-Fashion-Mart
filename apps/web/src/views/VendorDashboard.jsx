'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Package, ShoppingBag, MessageSquare, TrendingUp, AlertCircle, Plus, Star, X } from 'lucide-react';
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
import { getVendorStore, createStore, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { apiRequest } from '@/lib/aws/config';

const CATEGORIES = ['ethnic', 'women', 'men', 'kids', 'streetwear', 'footwear', 'accessories'];

const VendorDashboard = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: '', price: '', oldPrice: '', stock: '', description: '', sizes: '' });
  const [saving, setSaving] = useState(false);

  // Store setup modal state
  const [showStoreSetup, setShowStoreSetup] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', description: '', city: '', address: '', phone: '' });
  const [savingStore, setSavingStore] = useState(false);

  useEffect(() => {
    if (currentUser) fetchVendorData();
  }, [currentUser]);

  const fetchVendorData = async () => {
    try {
      const storeData = await getVendorStore();
      if (storeData) {
        setStore(storeData);
        const [productsRes, ordersRes] = await Promise.all([
          apiRequest(`/products?shop=${storeData.id}&limit=100`),
          apiRequest('/orders'),
        ]);
        setProducts(productsRes?.products || []);
        setOrders(ordersRes?.orders || []);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: '', price: '', oldPrice: '', stock: '', description: '', sizes: '' });
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name || '',
      category: p.category || '',
      price: String(p.price || ''),
      oldPrice: String(p.oldPrice || ''),
      stock: String(p.stock || ''),
      description: p.description || '',
      sizes: (p.sizes || []).join(', '),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) { toast.error('Name and price are required'); return; }
    if (!store) { toast.error('Set up your store first'); return; }
    setSaving(true);
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        compare_price: Number(productForm.oldPrice) || undefined,
        stock_quantity: Number(productForm.stock) || 0,
        sizes: productForm.sizes ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        shop_id: store.id,
      };
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p));
        toast.success('Product updated');
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [...prev, created]);
        toast.success('Product added');
      }
      setShowProductModal(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product removed');
    } catch {
      toast.error('Failed to delete product');
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
            <Button className="btn-primary" onClick={() => setShowStoreSetup(true)}>Setup Store Profile</Button>
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
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
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
                      {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <Card className="bg-white p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Product Catalog</h3>
                    <Button className="btn-primary rounded-full" size="sm" onClick={openAddModal}>
                      <Plus className="w-4 h-4 mr-1" /> Add Product
                    </Button>
                  </div>
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">No products yet. Add your first product to start selling.</p>
                      <Button className="btn-primary rounded-full" size="sm" onClick={openAddModal}><Plus className="w-4 h-4 mr-1" /> Add Your First Product</Button>
                    </div>
                  ) : (
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
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0">
                                    {p.images?.[0] && <img src={p.images[0]} className="w-full h-full object-cover" alt={p.name} />}
                                  </div>
                                  <span className="font-medium max-w-[200px] truncate">{p.name}</span>
                                </div>
                              </td>
                              <td className="py-3 capitalize">{p.category}</td>
                              <td className="py-3 font-medium">₹{p.price}</td>
                              <td className="py-3">
                                <Badge variant={(p.stock_quantity ?? p.stock ?? 0) > 10 ? 'outline' : 'destructive'} className="font-normal">{p.stock_quantity ?? p.stock ?? 0} units</Badge>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="text-primary h-8 px-2" onClick={() => openEditModal(p)}>Edit</Button>
                                  <Button variant="ghost" size="sm" className="text-red-500 h-8 px-2" onClick={() => handleDeleteProduct(p.id)}>Delete</Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <Card className="p-12 text-center bg-white">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </Card>
                  ) : orders.map(order => <OrderCard key={order.id} order={order} showCustomer={true} />)}
                </div>
              </TabsContent>

              <TabsContent value="inquiries">
                <InquiryManagement storeId={store.id} />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="p-5 bg-white text-center">
                    <div className="text-3xl font-bold text-secondary mb-1">₹{(totalRevenue * 0.3).toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">This Week Revenue</div>
                  </Card>
                  <Card className="p-5 bg-white text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{orders.filter(o => o.order_status === 'delivered').length}</div>
                    <div className="text-sm text-muted-foreground">Delivered Orders</div>
                  </Card>
                  <Card className="p-5 bg-white text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">{products.filter(p => p.stock > 0).length}</div>
                    <div className="text-sm text-muted-foreground">Products In Stock</div>
                  </Card>
                </div>
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-bold mb-4">Weekly Sales Trend</h3>
                  <MetricsChart data={chartData} color="hsl(330 100% 50%)" />
                </Card>
                <Card className="p-6 bg-white mt-6">
                  <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
                  <div className="space-y-3">
                    {[['Ethnic & Sarees', 42], ['Western Wear', 28], ['Accessories', 18], ['Footwear', 12]].map(([cat, pct]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1"><span className="font-medium">{cat}</span><span className="text-muted-foreground">{pct}%</span></div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="payouts">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="p-5 bg-white text-center border-l-4 border-l-green-500">
                    <div className="text-2xl font-bold text-green-600 mb-1">₹{(totalRevenue * 0.88).toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Total Earned (after 12% commission)</div>
                  </Card>
                  <Card className="p-5 bg-white text-center border-l-4 border-l-blue-500">
                    <div className="text-2xl font-bold text-blue-600 mb-1">₹{(totalRevenue * 0.88 * 0.3).toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Pending Settlement</div>
                  </Card>
                  <Card className="p-5 bg-white text-center border-l-4 border-l-secondary">
                    <div className="text-2xl font-bold text-secondary mb-1">Every Monday</div>
                    <div className="text-sm text-muted-foreground">Next Payout Schedule</div>
                  </Card>
                </div>
                <Card className="bg-white overflow-hidden">
                  <div className="p-6 border-b"><h3 className="font-bold text-lg">Payout History</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Period</th>
                          <th className="px-6 py-3">Orders</th>
                          <th className="px-6 py-3">Gross</th>
                          <th className="px-6 py-3">Commission</th>
                          <th className="px-6 py-3">Net Payout</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { period: 'May 12 – 18, 2025', orders: 14, gross: 42000 },
                          { period: 'May 5 – 11, 2025',  orders: 11, gross: 31500 },
                          { period: 'Apr 28 – May 4',     orders: 9,  gross: 27800 },
                          { period: 'Apr 21 – 27, 2025',  orders: 16, gross: 51200 },
                        ].map(row => (
                          <tr key={row.period} className="hover:bg-muted/20">
                            <td className="px-6 py-4 font-medium">{row.period}</td>
                            <td className="px-6 py-4">{row.orders}</td>
                            <td className="px-6 py-4">₹{row.gross.toLocaleString()}</td>
                            <td className="px-6 py-4 text-red-500">−₹{(row.gross * 0.12).toFixed(0)}</td>
                            <td className="px-6 py-4 font-bold text-green-700">₹{(row.gross * 0.88).toFixed(0)}</td>
                            <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Paid</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Footer />

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary font-serif">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowProductModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/40"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Product Name *</label>
                <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={productForm.name} onChange={e => setProductForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Handloom Silk Saree" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 bg-white" value={productForm.category} onChange={e => setProductForm(f => ({...f, category: e.target.value}))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Stock</label>
                  <input type="number" min="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={productForm.stock} onChange={e => setProductForm(f => ({...f, stock: e.target.value}))} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Price (₹) *</label>
                  <input type="number" min="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={productForm.price} onChange={e => setProductForm(f => ({...f, price: e.target.value}))} placeholder="4999" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Original Price (₹)</label>
                  <input type="number" min="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={productForm.oldPrice} onChange={e => setProductForm(f => ({...f, oldPrice: e.target.value}))} placeholder="6999" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sizes (comma separated)</label>
                <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={productForm.sizes} onChange={e => setProductForm(f => ({...f, sizes: e.target.value}))} placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none" value={productForm.description} onChange={e => setProductForm(f => ({...f, description: e.target.value}))} placeholder="Describe your product…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowProductModal(false)} className="flex-1 border border-border rounded-full py-2 text-sm font-medium hover:bg-muted/30 transition-colors">Cancel</button>
                <button onClick={handleSaveProduct} disabled={saving} className="flex-1 bg-secondary text-white rounded-full py-2 text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Setup Modal */}
      {showStoreSetup && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary font-serif">Setup Your Store</h2>
              <button onClick={() => setShowStoreSetup(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/40"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Store Name *</label>
                <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={storeForm.name} onChange={e => setStoreForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Aanya Atelier" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea rows={3} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none" value={storeForm.description} onChange={e => setStoreForm(f => ({...f, description: e.target.value}))} placeholder="Tell customers about your boutique…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">City *</label>
                  <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 bg-white" value={storeForm.city} onChange={e => setStoreForm(f => ({...f, city: e.target.value}))}>
                    <option value="">Select…</option>
                    {['Mumbai', 'Bengaluru', 'Delhi', 'Jaipur', 'Hyderabad'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={storeForm.phone} onChange={e => setStoreForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Store Address</label>
                <input className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" value={storeForm.address} onChange={e => setStoreForm(f => ({...f, address: e.target.value}))} placeholder="Street, Area, City, PIN" />
              </div>
              <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">After submission, our team will review and verify your store within 48 hours. You will receive an email confirmation.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowStoreSetup(false)} className="flex-1 border border-border rounded-full py-2 text-sm font-medium hover:bg-muted/30 transition-colors">Cancel</button>
                <button
                  disabled={savingStore}
                  onClick={async () => {
                    if (!storeForm.name || !storeForm.city) { toast.error('Name and city are required'); return; }
                    setSavingStore(true);
                    try {
                      const newStore = await createStore({
                        name: storeForm.name,
                        description: storeForm.description || undefined,
                        city: storeForm.city,
                        address_line1: storeForm.address || undefined,
                        phone: storeForm.phone || undefined,
                      });
                      setStore(newStore);
                      setShowStoreSetup(false);
                      toast.success("Store created! Our team will verify it within 48 hrs.");
                    } catch (err) {
                      toast.error(err.message || 'Failed to create store. Please try again.');
                    } finally {
                      setSavingStore(false);
                    }
                  }}
                  className="flex-1 bg-secondary text-white rounded-full py-2 text-sm font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60"
                >
                  {savingStore ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
