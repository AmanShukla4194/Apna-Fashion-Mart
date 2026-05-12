'use client';

import React, { useState, useEffect } from 'react';
import { Map, List } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShopCard from '@/components/ShopCard';
import FilterPanel from '@/components/FilterPanel';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllStores, getNearbyStores } from '@/lib/api';
import { toast } from 'sonner';

const NearbyShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const nearby = await getNearbyStores(pos.coords.latitude, pos.coords.longitude, 10);
              setShops(nearby);
            } catch {
              const { stores } = await getAllStores(1, 50);
              setShops(stores);
            } finally {
              setLoading(false);
            }
          },
          async () => {
            const { stores } = await getAllStores(1, 50);
            setShops(stores);
            setLoading(false);
          }
        );
      } else {
        const { stores } = await getAllStores(1, 50);
        setShops(stores);
        setLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load shops');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            Nearby Shops
          </h1>
          <div className="flex gap-2 shrink-0">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className="rounded-xl"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className="rounded-xl"
            >
              <Map className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
            {viewMode === 'map' ? (
              <MapView shops={shops} />
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))}
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No shops found nearby</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NearbyShopsPage;
