'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (allowedRoles.length > 0 && profile && !allowedRoles.includes(profile.role)) {
      router.push('/');
    }
  }, [isAuthenticated, profile, allowedRoles, router]);

  if (!isAuthenticated) return null;

  return children;
};

export default ProtectedRoute;
