'use client';
import { use } from 'react';
import ShopDetailPage from '@/views/ShopDetailPage';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ShopDetailPage id={id} />;
}
