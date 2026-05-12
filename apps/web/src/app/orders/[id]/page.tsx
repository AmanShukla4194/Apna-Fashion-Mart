'use client';
import { use } from 'react';
import OrderTrackingPage from '@/views/OrderTrackingPage';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderTrackingPage id={id} />;
}
