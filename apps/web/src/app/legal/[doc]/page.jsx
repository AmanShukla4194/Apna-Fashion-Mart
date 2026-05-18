import LegalPage from '@/views/LegalPage';

export const runtime = 'edge';

export async function generateStaticParams() {
  return [{ doc: 'privacy' }, { doc: 'terms' }, { doc: 'vendor' }];
}

export default function Page({ params }) {
  return <LegalPage doc={params.doc} />;
}
