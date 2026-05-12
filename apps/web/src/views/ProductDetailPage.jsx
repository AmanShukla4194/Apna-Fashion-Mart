'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star, Package, Truck, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ReviewCard from '@/components/ReviewCard';
import CustomerInquiryForm from '@/components/CustomerInquiryForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProductById, getProductsByStore, getProductReviews, getStoreById, addToCart, addToWishlist } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductDetailPage = ({ id }) => {
  const router = useRouter();
  const { isAuthenticated, isCustomer, currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const productData = await getProductById(id);
      setProduct(productData);

      if (productData.store_id) {
        const shopData = await getStoreById(productData.store_id);
        setShop(shopData);

        const { products: storeProducts } = await getProductsByStore(productData.store_id);
        setSimilarProducts(storeProducts.filter(p => p.category === productData.category && p.id !== id).slice(0, 4));
      }

      const reviewsData = await getProductReviews(id);
      setReviews(reviewsData);
    } catch (error) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !isCustomer) {
      toast.error('Please login as a customer to add to cart');
      return;
    }

    try {
      await addToCart({ user_id: currentUser.id, product_id: product.id, store_id: product.store_id, quantity, size: selectedSize, color: selectedColor });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated || !isCustomer) {
      toast.error('Please login as a customer to add to wishlist');
      return;
    }

    try {
      await addToWishlist(currentUser.id, product.id, product.store_id);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground text-lg">Product not found</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="aspect-square bg-muted rounded-2xl overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-xl overflow-hidden">
                      <img 
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-muted-foreground">({product.reviewCount || 0} reviews)</span>
                </div>
                {product.stock > 0 ? (
                  <Badge variant="secondary">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                    <Badge className="bg-primary">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="rounded-xl"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? 'default' : 'outline'}
                        onClick={() => setSelectedColor(color)}
                        className="rounded-xl"
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-8">
                <Button 
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl"
                  onClick={handleAddToWishlist}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Premium Quality</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Fast Delivery</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-muted rounded-xl">
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium">Easy Returns</p>
                </div>
              </div>

              {shop && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-2">Sold by</h3>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl justify-start"
                    onClick={() => router.push(`/shop/${shop.id}`)}
                  >
                    {shop.name}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="reviews" className="mb-16">
            <TabsList>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="inquiry">Ask a Question</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-8">
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

            <TabsContent value="inquiry" className="mt-8">
              <div className="max-w-2xl">
                <CustomerInquiryForm
                  storeId={product.store_id}
                  storeName={shop?.name}
                  productId={product.id}
                  productName={product.name}
                />
              </div>
            </TabsContent>
          </Tabs>

          {similarProducts.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                Similar Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;
