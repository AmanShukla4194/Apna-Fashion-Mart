'use client';
import { use } from 'react';
import OrderTrackingPage from '@/views/OrderTrackingPage';
export const runtime = 'edge';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderTrackingPage id={id} />;
}
