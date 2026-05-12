'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const AuthContext = createContext(null);

const defaultAuthValue = {
  currentUser: null,
  profile: null,
  isAuthenticated: false,
  isCustomer: false,
  isVendor: false,
  isAdmin: false,
  initialLoading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  updateProfile: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? defaultAuthValue;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    return data;
  };

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id).finally(() => setInitialLoading(false));
      else setInitialLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const userProfile = await fetchProfile(data.user.id);
    return { user: data.user, profile: userProfile };
  };

  const signup = async (email, password, name, role = 'customer') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', currentUser.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    currentUser,
    profile,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
    isCustomer: profile?.role === 'customer',
    isVendor: profile?.role === 'vendor',
    isAdmin: profile?.role === 'admin',
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
