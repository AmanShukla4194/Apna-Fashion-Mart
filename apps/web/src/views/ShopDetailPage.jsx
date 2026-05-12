'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, BadgeCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import CustomerInquiryForm from '@/components/CustomerInquiryForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getStoreById, getProductsByStore, getStoreReviews } from '@/lib/api';
import { toast } from 'sonner';

const ShopDetailPage = ({ id }) => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const [shopData, { products: productsData }, reviewsData] = await Promise.all([
        getStoreById(id),
        getProductsByStore(id),
        getStoreReviews(id),
      ]);
      setShop(shopData);
      setProducts(productsData);
      setReviews(reviewsData);
    } catch {
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-96 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!shop) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground text-lg">Shop not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden mb-6">
                {(shop.store_images?.[0] || shop.storeImages?.[0]) ? (
                  <img
                    src={shop.store_images?.[0] || shop.storeImages?.[0]}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {shop.name}
                  </h1>
                  {shop.description && (
                    <p className="text-muted-foreground leading-relaxed">{shop.description}</p>
                  )}
                </div>
                {shop.is_verified && (
                  <BadgeCheck className="w-8 h-8 text-primary flex-shrink-0" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{shop.address}, {shop.city}</p>
                  </div>
                </div>

                {shop.rating && (
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{shop.rating.toFixed(1)} Rating</p>
                      <p className="text-sm text-muted-foreground">{shop.reviewCount || 0} reviews</p>
                    </div>
                  </div>
                )}

                {shop.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground">{shop.phone}</p>
                    </div>
                  </div>
                )}

                {shop.openingHours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground">Open today</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <CustomerInquiryForm 
                storeId={shop.id} 
                storeName={shop.name}
              />
            </div>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ShopDetailPage;
