// Unified API layer — replaces PocketBase calls
// All data fetching goes through this module using the Supabase client

import { supabase } from '@/lib/supabase/client';
import type { Store, Product, Order, CartItem, WishlistItem, Address, Review, Inquiry, Profile } from '@/types/database';

// ── Stores ───────────────────────────────────────────────────────────────────

export async function getFeaturedStores(limit = 4) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_verified', true)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Store[];
}

export async function getNearbyStores(lat: number, lng: number, radiusKm = 10) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('nearby_stores', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  });
  if (error) throw error;
  return data as Store[];
}

export async function getStoreById(id: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Store;
}

export async function getAllStores(page = 1, limit = 12, filters: Record<string, unknown> = {}) {
  let query = supabase
    .from('stores')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .range((page - 1) * limit, page * limit - 1);

  if (filters.is_verified) query = query.eq('is_verified', true);
  if (filters.city) query = query.eq('city', filters.city);
  if (filters.category) query = query.contains('category', [filters.category]);

  const { data, error, count } = await query;
  if (error) throw error;
  return { stores: data as Store[], total: count ?? 0 };
}

export async function getVendorStore(vendorId: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('vendor_id', vendorId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as Store | null;
}

export async function createStore(storeData: Partial<Store>) {
  const { data, error } = await supabase
    .from('stores')
    .insert(storeData)
    .select()
    .single();
  if (error) throw error;
  return data as Store;
}

export async function updateStore(id: string, storeData: Partial<Store>) {
  const { data, error } = await supabase
    .from('stores')
    .update(storeData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Store;
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function getNewArrivals(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, stores(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, stores(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Product;
}

export async function getProductsByStore(storeId: string, page = 1, limit = 12) {
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('store_id', storeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { products: data as Product[], total: count ?? 0 };
}

export async function getProductsByVendor(vendorId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function searchProducts(query: string, filters: Record<string, unknown> = {}) {
  let dbQuery = supabase
    .from('products')
    .select('*, stores(*)')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

  if (filters.category) dbQuery = dbQuery.eq('category', filters.category);
  if (filters.gender) dbQuery = dbQuery.eq('gender', filters.gender);
  if (filters.min_price) dbQuery = dbQuery.gte('price', filters.min_price);
  if (filters.max_price) dbQuery = dbQuery.lte('price', filters.max_price);

  const { data, error } = await dbQuery.order('rating', { ascending: false }).limit(48);
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(productData: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ── Cart ─────────────────────────────────────────────────────────────────────

export async function getCart(userId: string) {
  const { data, error } = await supabase
    .from('cart')
    .select('*, products(*, stores(*))')
    .eq('user_id', userId);
  if (error) throw error;
  return data as CartItem[];
}

export async function addToCart(item: { user_id: string; product_id: string; store_id: string; quantity?: number; size?: string; color?: string }) {
  const { data, error } = await supabase
    .from('cart')
    .upsert({ ...item, quantity: item.quantity ?? 1 }, { onConflict: 'user_id,product_id,size,color' })
    .select()
    .single();
  if (error) throw error;
  return data as CartItem;
}

export async function updateCartQuantity(id: string, quantity: number) {
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CartItem;
}

export async function removeFromCart(id: string) {
  const { error } = await supabase.from('cart').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase.from('cart').delete().eq('user_id', userId);
  if (error) throw error;
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*, products(*, stores(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as WishlistItem[];
}

export async function addToWishlist(userId: string, productId: string, storeId: string) {
  const { data, error } = await supabase
    .from('wishlist')
    .upsert({ user_id: userId, product_id: productId, store_id: storeId }, { onConflict: 'user_id,product_id' })
    .select()
    .single();
  if (error) throw error;
  return data as WishlistItem;
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const { data } = await supabase
    .from('wishlist')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
  return !!data;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Order;
}

export async function getVendorOrders(storeId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function createOrder(orderData: Partial<Order>) {
  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(id: string, status: Order['order_status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  if (error) throw error;
  return data as Address[];
}

export async function createAddress(addressData: Partial<Address>) {
  const { data, error } = await supabase
    .from('addresses')
    .insert(addressData)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function setDefaultAddress(userId: string, addressId: string) {
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
  const { data, error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name, avatar)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function getStoreReviews(storeId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name, avatar)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Review[];
}

export async function createReview(reviewData: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();
  if (error) throw error;
  return data as Review;
}

// ── Inquiries ─────────────────────────────────────────────────────────────────

export async function getCustomerInquiries(customerId: string) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, stores(name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Inquiry[];
}

export async function getStoreInquiries(storeId: string) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, profiles(name, avatar)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Inquiry[];
}

export async function createInquiry(inquiryData: Partial<Inquiry>) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert(inquiryData)
    .select()
    .single();
  if (error) throw error;
  return data as Inquiry;
}

export async function respondToInquiry(id: string, response: string) {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ response, status: 'responded', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Inquiry;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 20) {
  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (error) throw error;
  return { users: data as Profile[], total: count ?? 0 };
}

export async function getPendingVendors() {
  const { data, error } = await supabase
    .from('stores')
    .select('*, profiles(*)')
    .eq('is_verified', false)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function verifyStore(storeId: string, verified: boolean) {
  const { data, error } = await supabase
    .from('stores')
    .update({ is_verified: verified })
    .eq('id', storeId)
    .select()
    .single();
  if (error) throw error;
  return data as Store;
}

export async function getPlatformStats() {
  const [usersRes, storesRes, productsRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total', { count: 'exact' }).eq('payment_status', 'paid'),
  ]);

  const totalRevenue = (ordersRes.data ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  return {
    totalUsers: usersRes.count ?? 0,
    totalStores: storesRes.count ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    totalRevenue,
  };
}
