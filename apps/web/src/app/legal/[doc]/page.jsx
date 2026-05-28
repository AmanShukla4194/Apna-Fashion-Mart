'use client';
import { use } from 'react';
import LegalPage from '@/views/LegalPage';
export const runtime = 'edge';
export default function Page({ params }) {
  const { doc } = use(params);
  return <LegalPage doc={doc} />;
}
