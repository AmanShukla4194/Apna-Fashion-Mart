'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MapPin, Store, ShoppingBag, Truck, ShieldCheck, 
  Star, Search, Heart, CreditCard, RefreshCcw, Phone,
  ChevronRight, Compass, Smartphone
} from 'lucide-react';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HowItWorksStep from '@/components/HowItWorksStep';
import ShopCardFeatured from '@/components/ShopCardFeatured';
import CategoryCard from '@/components/CategoryCard';
import TrendingCollectionCard from '@/components/TrendingCollectionCard';
import ProductCardHome from '@/components/ProductCardHome';
import TrustBadge from '@/components/TrustBadge';
import TestimonialCard from '@/components/TestimonialCard';
import PromotionalCard from '@/components/PromotionalCard';
import FAQItem from '@/components/FAQItem';

// Map & Location imports
import MapView from '@/components/MapView';
import LocationSelector from '@/components/LocationSelector';

import { getFeaturedStores, getNewArrivals } from '@/lib/api';
import { toast } from 'sonner';

const HomePage = () => {
  const router = useRouter();
  const [featuredShops, setFeaturedShops] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [shops, products] = await Promise.all([
          getFeaturedStores(4),
          getNewArrivals(8),
        ]);
        setFeaturedShops(shops);
        setNewArrivals(products);
      } catch (err) {
        console.error('Failed to load home data', err);
        toast.error('Could not load marketplace data');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background selection:bg-secondary selection:text-white">
        <Header />

        {/* 1. PREMIUM HERO SECTION */}
        <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-24">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1675631082746-ef4c0c5ed67e"
              alt="Premium Fashion Boutique"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90" />
          </div>

          <div className="container-default relative z-10 text-center flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-sm font-medium tracking-widest uppercase mb-6">
                Apna Style, Apna Store
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight font-serif text-balance">
                Your Style,<br />Your Identity
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Discover the finest fashion from premium verified boutiques right in your neighborhood. Quality meets convenience.
              </p>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 max-w-3xl mx-auto mb-10 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-2/3 bg-white rounded-xl">
                  <LocationSelector />
                </div>
                <Button 
                  className="w-full sm:w-1/3 bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 text-lg shadow-lg shadow-secondary/30"
                  onClick={() => router.push('/nearby-shops')}
                >
                  Explore Now
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. HOW IT WORKS SECTION */}
        <section className="section-padding bg-white">
          <div className="container-default">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
              className="text-center mb-16"
            >
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">How It Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Your journey to premium local fashion in four simple steps.</p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              <motion.div variants={fadeUpVariant}>
                <HowItWorksStep number="1" icon={MapPin} title="Detect Location" description="Share your location to find the best verified boutiques near you." />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <HowItWorksStep number="2" icon={Store} title="Browse Nearby Shops" description="Explore curated collections from top-rated local sellers." />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <HowItWorksStep number="3" icon={Search} title="Explore Products" description="Find exactly what you're looking for with our advanced search." />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <HowItWorksStep number="4" icon={ShoppingBag} title="Order or Visit" description="Buy online with fast delivery or visit the store directly." />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3. FEATURED NEARBY SHOPS SECTION */}
        <section className="section-padding bg-muted/30">
          <div className="container-default">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
                <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Featured Boutiques</h2>
                <p className="text-muted-foreground text-lg">Top-rated verified sellers delivering premium fashion.</p>
              </motion.div>
              <button className="hidden md:flex items-center gap-1 rounded-full px-5 py-2 border border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-colors font-medium text-sm" onClick={() => router.push('/nearby-shops')}>
                View All Shops <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
              </div>
            ) : (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {featuredShops.map((shop) => (
                  <motion.div key={shop.id} variants={fadeUpVariant}>
                    <ShopCardFeatured shop={shop} />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <div className="mt-10 text-center md:hidden">
              <button className="rounded-full w-full px-6 py-2.5 border border-primary text-primary bg-transparent hover:bg-primary hover:text-white transition-colors font-medium text-sm" onClick={() => router.push('/nearby-shops')}>
                View All Shops
              </button>
            </div>
          </div>
        </section>

        {/* 4. TRENDING COLLECTIONS SECTION (Bento Grid) */}
        <section className="section-padding bg-white">
          <div className="container-default">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Curated Collections</h2>
              <p className="text-muted-foreground text-lg">Explore categories tailored for your lifestyle.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[600px]">
              <TrendingCollectionCard 
                title="Women's Fashion" 
                image="https://images.unsplash.com/photo-1563099599-7d779f2b3b86" 
                className="md:col-span-2 md:row-span-2 h-[300px] md:h-full"
                onClick={() => router.push('/categories?category=womens')}
              />
              <TrendingCollectionCard 
                title="Men's Edit" 
                image="https://images.unsplash.com/photo-1701759164397-d49e71987ab5" 
                className="md:col-span-1 md:row-span-1 h-[250px] md:h-full"
                onClick={() => router.push('/categories?category=mens')}
              />
              <TrendingCollectionCard 
                title="Luxury" 
                image="https://images.unsplash.com/photo-1678547241895-1c307914b50c" 
                className="md:col-span-1 md:row-span-1 h-[250px] md:h-full"
                onClick={() => router.push('/categories')}
              />
              <TrendingCollectionCard 
                title="Ethnic Wear" 
                image="https://images.unsplash.com/photo-1693987644236-3c440256784b" 
                className="md:col-span-2 md:row-span-1 h-[250px] md:h-full"
                onClick={() => router.push('/categories')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6 h-auto md:h-[300px]">
              <TrendingCollectionCard title="Accessories" image="https://images.unsplash.com/photo-1684407261522-48ad66a060e9" className="h-[250px] md:h-full" />
              <TrendingCollectionCard title="Footwear" image="https://images.unsplash.com/photo-1575577806501-431c984dc0a1" className="h-[250px] md:h-full" />
              <TrendingCollectionCard title="Kids" image="https://images.unsplash.com/photo-1661444369917-78c800bc7717" className="h-[250px] md:h-full" />
            </div>
          </div>
        </section>

        {/* 5. NEW ARRIVALS SECTION */}
        <section className="section-padding bg-primary">
          <div className="container-default">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}>
                <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif mb-4">New Arrivals</h2>
                <p className="text-white/70 text-lg">Fresh pieces just dropped in your local boutiques.</p>
              </motion.div>
              <button className="hidden md:flex items-center gap-1 rounded-full px-5 py-2 border border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors font-medium text-sm" onClick={() => router.push('/categories')}>
                View All Products <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl bg-white/10" />)}
              </div>
            ) : (
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
              >
                {newArrivals.map((product) => (
                  <motion.div key={product.id} variants={fadeUpVariant}>
                    <ProductCardHome product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            <div className="mt-10 text-center md:hidden">
              <button className="rounded-full w-full px-6 py-2.5 border border-white text-white bg-transparent hover:bg-white hover:text-primary transition-colors font-medium text-sm" onClick={() => router.push('/categories')}>
                View All Products
              </button>
            </div>
          </div>
        </section>

        {/* 6. WHY SHOP WITH US SECTION */}
        <section className="section-padding bg-white">
          <div className="container-default">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">The Apna Advantage</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Why thousands of fashion enthusiasts trust our marketplace.</p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <TrustBadge icon={ShieldCheck} title="Verified Sellers" description="Strict vetting for all boutiques" />
              <TrustBadge icon={Star} title="Premium Quality" description="Curated high-grade fashion" />
              <TrustBadge icon={CreditCard} title="Best Prices" description="Direct from local vendors" />
              <TrustBadge icon={Truck} title="Fast Delivery" description="Same-day local fulfillment" />
              <TrustBadge icon={RefreshCcw} title="Easy Returns" description="Hassle-free 7-day policy" />
              <TrustBadge icon={ShoppingBag} title="COD Available" description="Pay on delivery option" />
              <TrustBadge icon={CreditCard} title="Secure Payments" description="Encrypted transactions" />
              <TrustBadge icon={Phone} title="24/7 Support" description="Always here to help you" />
            </motion.div>
          </div>
        </section>

        {/* 7. SHOP BY CATEGORY SECTION */}
        <section className="section-padding bg-muted/30">
          <div className="container-default text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Shop by Category</h2>
              <p className="text-muted-foreground text-lg">Browse exactly what you need quickly.</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { icon: "👗", label: "Dresses" }, { icon: "👔", label: "Shirts" },
                { icon: "👖", label: "Bottoms" }, { icon: "👟", label: "Shoes" },
                { icon: "👜", label: "Bags" }, { icon: "⌚", label: "Watches" },
                { icon: "🕶️", label: "Accessories" }, { icon: "🧥", label: "Outerwear" }
              ].map((cat, idx) => (
                <div key={idx} className="w-24 sm:w-32">
                  <CategoryCard icon={cat.icon} label={cat.label} onClick={() => router.push('/categories')} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. SPECIAL OFFERS SECTION */}
        <section className="section-padding bg-white">
          <div className="container-default">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Exclusive Offers</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PromotionalCard 
                discount="50% OFF" 
                title="Summer Clearance" 
                description="Grab the hottest summer styles before they're gone forever." 
                code="SUMMER50" 
                color="bg-primary" 
              />
              <PromotionalCard 
                discount="FLAT ₹500" 
                title="First Purchase" 
                description="Welcome to Apna Fashion. Use this code on your first order above ₹2000." 
                code="WELCOME500" 
                color="bg-secondary" 
              />
              <PromotionalCard 
                discount="BUY 1 GET 1" 
                title="Weekend Special" 
                description="Mix and match your favorite accessories this weekend." 
                color="bg-zinc-900" 
              />
            </div>
          </div>
        </section>

        {/* 9. CUSTOMER TESTIMONIALS SECTION */}
        <section className="section-padding bg-accent/30">
          <div className="container-default">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Loved by Shoppers</h2>
              <p className="text-muted-foreground text-lg">Hear what our community has to say.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                name="Priya Sharma" 
                role="Fashion Blogger" 
                rating={5} 
                text="I love how easy it is to discover hidden gems in my city. The quality of clothes from local boutiques is phenomenal and delivery is super fast!"
              />
              <TestimonialCard 
                name="Rahul Verma" 
                role="Verified Buyer" 
                rating={5} 
                text="The ability to see what's in store before visiting is a game changer. Apna Fashion Mart saves me hours of mall hopping."
              />
              <TestimonialCard 
                name="Ananya Patel" 
                role="Regular Shopper" 
                rating={4} 
                text="Great collection and secure payments. I had an issue with sizing once, but their return process was perfectly smooth and hassle-free."
              />
            </div>
          </div>
        </section>

        {/* 10. NEARBY STORES MAP SECTION */}
        <section className="section-padding bg-white">
          <div className="container-default">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="w-full lg:w-1/3">
                <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-6">Find Boutiques Near You</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Our interactive map shows you exactly where the best fashion is hiding. View store hours, get directions, and explore collections before you step out.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-foreground"><MapPin className="text-secondary w-5 h-5"/> Location-based radius search</li>
                  <li className="flex items-center gap-3 text-foreground"><Compass className="text-secondary w-5 h-5"/> Turn-by-turn navigation</li>
                  <li className="flex items-center gap-3 text-foreground"><Store className="text-secondary w-5 h-5"/> Real-time open/close status</li>
                </ul>
                <Button className="btn-primary rounded-full w-full sm:w-auto" onClick={() => router.push('/nearby-shops')}>
                  Explore Map View
                </Button>
              </div>
              <div className="w-full lg:w-2/3 h-[300px] sm:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <MapView />
              </div>
            </div>
          </div>
        </section>

        {/* 11. PREMIUM FEATURES SECTION */}
        <section className="section-padding bg-primary text-white">
          <div className="container-default">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold font-serif mb-4">Platform Features</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">Everything you need for a seamless fashion shopping experience.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
              {[
                { icon: MapPin, title: "Location Discovery" },
                { icon: Search, title: "Advanced Filters" },
                { icon: Heart, title: "Smart Wishlist" },
                { icon: ShieldCheck, title: "Secure Checkout" },
                { icon: Truck, title: "Live Tracking" },
                { icon: Smartphone, title: "AI Assistant" },
                { icon: Phone, title: "Direct Chat" },
                { icon: Store, title: "Store Planning" },
                { icon: Star, title: "Verified Reviews" },
                { icon: Compass, title: "Recommendations" }
              ].map((feat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors duration-300">
                    <feat.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">{feat.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. FAQ SECTION */}
        <section className="section-padding bg-muted/30">
          <div className="container-default max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-4xl font-bold text-primary font-serif mb-4">Common Questions</h2>
              <p className="text-muted-foreground text-lg">Got questions? We've got answers.</p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <FAQItem 
                value="item-1" 
                question="How do I know the boutiques are verified?" 
                answer="Every store on Apna Fashion Mart undergoes a strict physical and digital verification process. Look for the blue 'Verified' checkmark on shop profiles." 
              />
              <FAQItem 
                value="item-2" 
                question="Can I return an item if it doesn't fit?" 
                answer="Yes, we offer a hassle-free 7-day return policy for all online purchases, provided the tags are intact and the item is unworn." 
              />
              <FAQItem 
                value="item-3" 
                question="How fast is the delivery?" 
                answer="Since you are shopping from local boutiques, we offer same-day or next-day delivery within your city limits." 
              />
              <FAQItem 
                value="item-4" 
                question="Is Cash on Delivery (COD) available?" 
                answer="Absolutely. We offer Cash on Delivery for most pincodes, along with secure online payment options via credit/debit cards and UPI." 
              />
              <FAQItem 
                value="item-5" 
                question="Can I visit the store after reserving online?" 
                answer="Yes! You can choose the 'Store Pickup' option at checkout. The boutique will keep your item ready for you to try and buy." 
              />
            </Accordion>
          </div>
        </section>

        {/* 12. CALL-TO-ACTION SECTION */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/50 rounded-l-full blur-3xl -z-10 translate-x-1/3"></div>
          <div className="container-default relative z-10">
            <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1675631082746-ef4c0c5ed67e')] bg-cover mix-blend-overlay"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif mb-6 leading-tight">
                  Join Apna Fashion Mart Today
                </h2>
                <p className="text-xl text-white/80 mb-10">
                  Be part of the city's most exclusive fashion community. Discover trends, support local businesses, and elevate your wardrobe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-10 py-6 text-lg shadow-xl shadow-secondary/30">
                    Sign Up Now
                  </Button>
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white rounded-full px-10 py-6 text-lg backdrop-blur-sm">
                    Download App
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 14. FOOTER */}
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
