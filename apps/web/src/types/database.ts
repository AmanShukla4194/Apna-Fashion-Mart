// Auto-generated Supabase database types
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Store, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      cart: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at'>;
        Update: Partial<Omit<CartItem, 'id' | 'created_at'>>;
      };
      wishlist: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, 'id' | 'created_at'>;
        Update: Partial<Omit<WishlistItem, 'id' | 'created_at'>>;
      };
      addresses: {
        Row: Address;
        Insert: Omit<Address, 'id' | 'created_at'>;
        Update: Partial<Omit<Address, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      inquiries: {
        Row: Inquiry;
        Insert: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Inquiry, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      nearby_stores: {
        Args: { user_lat: number; user_lng: number; radius_km?: number };
        Returns: Store[];
      };
    };
  };
}

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  role: 'customer' | 'vendor' | 'admin';
  phone: string | null;
  city: string | null;
  address: string | null;
  avatar: string | null;
  latitude: number | null;
  longitude: number | null;
  preferences: Json;
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: string[] | null;
  images: string[] | null;
  logo: string | null;
  banner: string | null;
  is_verified: boolean;
  is_active: boolean;
  operating_hours: Json;
  rating: number;
  total_reviews: number;
  total_products: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  images: string[] | null;
  category: string | null;
  sub_category: string | null;
  gender: 'men' | 'women' | 'kids' | 'unisex' | null;
  sizes: Json;
  colors: Json;
  stock: number;
  sku: string | null;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
  // Joined relations
  stores?: Store;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  items: Json;
  subtotal: number;
  taxes: number;
  delivery_fee: number;
  total: number;
  payment_method: 'cod' | 'online';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  delivery_address: Json;
  notes: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
  products?: Product;
  stores?: Store;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  created_at: string;
  products?: Product;
  stores?: Store;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  store_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[] | null;
  is_verified_purchase: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Inquiry {
  id: string;
  customer_id: string;
  store_id: string;
  product_id: string | null;
  type: 'size' | 'stock' | 'availability' | 'delivery' | 'other' | 'general';
  subject: string | null;
  message: string;
  response: string | null;
  status: 'open' | 'responded' | 'closed';
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  stores?: Store;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}
