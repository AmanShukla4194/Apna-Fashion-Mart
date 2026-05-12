'use client';

import React, { useState, useEffect } from 'react';
import { User, MapPin, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCustomerOrders, getAddresses, updateProfile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CustomerProfilePage = () => {
  const { currentUser, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [ordersList, addressList] = await Promise.all([
        getCustomerOrders(currentUser.id),
        getAddresses(currentUser.id),
      ]);
      setOrders(ordersList);
      setAddresses(addressList);
    } catch (error) {
      toast.error('Failed to load profile data');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(currentUser.id, { name, phone });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          My Profile
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="card-premium max-w-2xl">
              <h3 className="text-xl font-semibold mb-6">Personal Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="input-premium"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-premium"
                  />
                </div>

                <Button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="card-premium text-center py-12">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="card-premium">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{(order.total ?? 0).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground capitalize">{order.order_status}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="addresses">
            {addresses.length === 0 ? (
              <Card className="card-premium text-center py-12">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No saved addresses</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id} className="card-premium">
                    <h4 className="font-semibold mb-2">{address.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {address.address_line1}
                      {address.address_line2 && `, ${address.address_line2}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default CustomerProfilePage;
