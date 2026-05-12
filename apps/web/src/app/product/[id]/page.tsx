'use client';
import { use } from 'react';
import ProductDetailPage from '@/views/ProductDetailPage';
export const runtime = 'edge';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetailPage id={id} />;
}
