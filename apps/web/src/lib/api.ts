// Unified API layer — all data fetching via AWS API Gateway
import { apiRequest } from './aws/config';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  category?: string[];
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  rating?: number;
  review_count?: number;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  store_id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  category?: string;
  gender?: string;
  tags?: string[];
  images?: string[];
  sizes?: string[];
  colors?: string[];
  stock?: number;
  rating?: number;
  review_count?: number;
  is_active?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  stores?: Store;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  size?: string;
  color?: string;
  created_at?: string;
  products?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  created_at?: string;
  products?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  discount?: number;
  total: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  shipping_address?: Address;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id?: string;
  store_id?: string;
  rating: number;
  title?: string;
  body?: string;
  images?: string[];
  created_at?: string;
  updated_at?: string;
  profiles?: { name: string; avatar?: string };
}

export interface Inquiry {
  id: string;
  customer_id: string;
  store_id: string;
  product_id?: string;
  subject?: string;
  message: string;
  response?: string;
  status: 'open' | 'responded' | 'closed';
  created_at?: string;
  updated_at?: string;
  stores?: { name: string };
  profiles?: { name: string; avatar?: string };
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  sort_order?: number;
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(page = 1, limit = 12, filters: Record<string, unknown> = {}): Promise<{ products: Product[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([k, v]) => v != null && params.set(k, String(v)));
  return apiRequest<{ products: Product[]; total: number }>(`/products?${params}`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return apiRequest<Product[]>(`/products/featured?limit=${limit}`);
}

export async function searchProducts(query: string, filters: Record<string, unknown> = {}): Promise<Product[]> {
  const params = new URLSearchParams({ q: query });
  Object.entries(filters).forEach(([k, v]) => v != null && params.set(k, String(v)));
  return apiRequest<Product[]>(`/products/search?${params}`);
}

export async function getProductsByShop(shopId: string, page = 1, limit = 12): Promise<{ products: Product[]; total: number }> {
  return apiRequest<{ products: Product[]; total: number }>(`/products?shopId=${shopId}&page=${page}&limit=${limit}`);
}

export async function getProductsByCategory(category: string, page = 1, limit = 12): Promise<{ products: Product[]; total: number }> {
  return apiRequest<{ products: Product[]; total: number }>(`/products?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return apiRequest<Product[]>(`/products?sort=newest&limit=${limit}`);
}

export async function getProductsByStore(storeId: string, page = 1, limit = 12): Promise<{ products: Product[]; total: number }> {
  return getProductsByShop(storeId, page, limit);
}

export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  return apiRequest<Product[]>(`/products?vendorId=${vendorId}`);
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  return apiRequest<Product>('/products', { method: 'POST', body: JSON.stringify(productData) });
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
}

export async function deleteProduct(id: string): Promise<void> {
  return apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
}

// ── Shops / Stores ────────────────────────────────────────────────────────────

export async function getShops(page = 1, limit = 12, filters: Record<string, unknown> = {}): Promise<{ stores: Store[]; total: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  Object.entries(filters).forEach(([k, v]) => v != null && params.set(k, String(v)));
  return apiRequest<{ stores: Store[]; total: number }>(`/shops?${params}`);
}

export async function getAllStores(page = 1, limit = 12, filters: Record<string, unknown> = {}): Promise<{ stores: Store[]; total: number }> {
  return getShops(page, limit, filters);
}

export async function getShopById(id: string): Promise<Store> {
  return apiRequest<Store>(`/shops/${id}`);
}

export async function getStoreById(id: string): Promise<Store> {
  return getShopById(id);
}

export async function getFeaturedShops(limit = 4): Promise<Store[]> {
  return apiRequest<Store[]>(`/shops/featured?limit=${limit}`);
}

export async function getFeaturedStores(limit = 4): Promise<Store[]> {
  return getFeaturedShops(limit);
}

export async function getNearbyShops(lat: number, lng: number, radius = 10): Promise<Store[]> {
  return apiRequest<Store[]>(`/shops/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
}

export async function getNearbyStores(lat: number, lng: number, radiusKm = 10): Promise<Store[]> {
  return getNearbyShops(lat, lng, radiusKm);
}

export async function searchShops(query: string, filters: Record<string, unknown> = {}): Promise<Store[]> {
  const params = new URLSearchParams({ q: query });
  Object.entries(filters).forEach(([k, v]) => v != null && params.set(k, String(v)));
  return apiRequest<Store[]>(`/shops/search?${params}`);
}

export async function getVendorStore(vendorId: string): Promise<Store | null> {
  try {
    return await apiRequest<Store>(`/shops?vendorId=${vendorId}`);
  } catch {
    return null;
  }
}

export async function createStore(storeData: Partial<Store>): Promise<Store> {
  return apiRequest<Store>('/shops', { method: 'POST', body: JSON.stringify(storeData) });
}

export async function updateStore(id: string, storeData: Partial<Store>): Promise<Store> {
  return apiRequest<Store>(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(storeData) });
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartItem[]> {
  return apiRequest<CartItem[]>('/cart');
}

export async function addToCart(item: {
  product_id: string;
  store_id: string;
  quantity?: number;
  size?: string;
  color?: string;
}): Promise<CartItem> {
  return apiRequest<CartItem>('/cart', { method: 'POST', body: JSON.stringify(item) });
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem> {
  return apiRequest<CartItem>(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
}

export async function updateCartQuantity(id: string, quantity: number): Promise<CartItem> {
  return updateCartItem(id, quantity);
}

export async function removeFromCart(id: string): Promise<void> {
  return apiRequest<void>(`/cart/${id}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<void> {
  return apiRequest<void>('/cart', { method: 'DELETE' });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist(): Promise<WishlistItem[]> {
  return apiRequest<WishlistItem[]>('/wishlist');
}

export async function addToWishlist(productId: string, storeId?: string): Promise<WishlistItem> {
  return apiRequest<WishlistItem>('/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId, store_id: storeId }) });
}

export async function removeFromWishlist(productId: string): Promise<void> {
  return apiRequest<void>(`/wishlist/${productId}`, { method: 'DELETE' });
}

export async function isInWishlist(productId: string): Promise<boolean> {
  try {
    const items = await getWishlist();
    return items.some((i) => i.product_id === productId);
  } catch {
    return false;
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrdersByUser(): Promise<Order[]> {
  return apiRequest<Order[]>('/orders');
}

export async function getCustomerOrders(): Promise<Order[]> {
  return getOrdersByUser();
}

export async function getOrderById(id: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}`);
}

export async function getVendorOrders(storeId: string): Promise<Order[]> {
  return apiRequest<Order[]>(`/orders?storeId=${storeId}`);
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  return apiRequest<Order>('/orders', { method: 'POST', body: JSON.stringify(orderData) });
}

export async function updateOrderStatus(id: string, status: Order['order_status']): Promise<Order> {
  return apiRequest<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses(): Promise<Address[]> {
  return apiRequest<Address[]>('/addresses');
}

export async function addAddress(addressData: Partial<Address>): Promise<Address> {
  return apiRequest<Address>('/addresses', { method: 'POST', body: JSON.stringify(addressData) });
}

export async function createAddress(addressData: Partial<Address>): Promise<Address> {
  return addAddress(addressData);
}

export async function updateAddress(id: string, addressData: Partial<Address>): Promise<Address> {
  return apiRequest<Address>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(addressData) });
}

export async function deleteAddress(id: string): Promise<void> {
  return apiRequest<void>(`/addresses/${id}`, { method: 'DELETE' });
}

export async function setDefaultAddress(addressId: string): Promise<Address> {
  return apiRequest<Address>(`/addresses/${addressId}`, { method: 'PUT', body: JSON.stringify({ is_default: true }) });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(productId?: string, shopId?: string): Promise<Review[]> {
  const params = new URLSearchParams();
  if (productId) params.set('productId', productId);
  if (shopId) params.set('shopId', shopId);
  return apiRequest<Review[]>(`/reviews?${params}`);
}

export async function addReview(reviewData: Partial<Review>): Promise<Review> {
  return apiRequest<Review>('/reviews', { method: 'POST', body: JSON.stringify(reviewData) });
}

export async function getShopReviews(shopId: string): Promise<Review[]> {
  return getReviews(undefined, shopId);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  return getReviews(productId, undefined);
}

export async function getStoreReviews(storeId: string): Promise<Review[]> {
  return getShopReviews(storeId);
}

export async function createReview(reviewData: Partial<Review>): Promise<Review> {
  return addReview(reviewData);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<Profile> {
  return apiRequest<Profile>('/profile');
}

export async function getProfile(): Promise<Profile> {
  return getUserProfile();
}

export async function updateUserProfile(updates: Partial<Profile>): Promise<Profile> {
  return apiRequest<Profile>('/profile', { method: 'PUT', body: JSON.stringify(updates) });
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  return updateUserProfile(updates);
}

// ── Inquiries ─────────────────────────────────────────────────────────────────

export async function sendInquiry(inquiryData: Partial<Inquiry>): Promise<Inquiry> {
  return apiRequest<Inquiry>('/inquiries', { method: 'POST', body: JSON.stringify(inquiryData) });
}

export async function createInquiry(inquiryData: Partial<Inquiry>): Promise<Inquiry> {
  return sendInquiry(inquiryData);
}

export async function getCustomerInquiries(): Promise<Inquiry[]> {
  return apiRequest<Inquiry[]>('/inquiries');
}

export async function getStoreInquiries(storeId: string): Promise<Inquiry[]> {
  return apiRequest<Inquiry[]>(`/inquiries?storeId=${storeId}`);
}

export async function respondToInquiry(id: string, response: string): Promise<Inquiry> {
  return apiRequest<Inquiry>(`/inquiries/${id}/respond`, { method: 'POST', body: JSON.stringify({ response }) });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 20): Promise<{ users: Profile[]; total: number }> {
  return apiRequest<{ users: Profile[]; total: number }>(`/admin/users?page=${page}&limit=${limit}`);
}

export async function getPendingVendors(): Promise<(Store & { profiles?: Profile })[]> {
  return apiRequest<(Store & { profiles?: Profile })[]>('/admin/vendors/pending');
}

export async function verifyStore(storeId: string, verified: boolean): Promise<Store> {
  return apiRequest<Store>(`/admin/shops/${storeId}/verify`, { method: 'PATCH', body: JSON.stringify({ verified }) });
}

export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}> {
  return apiRequest('/admin/stats');
}
