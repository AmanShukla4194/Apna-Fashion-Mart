import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Apna Fashion Mart — Local Fashion Marketplace',
  description:
    'Discover nearby clothing stores, browse local fashion, and shop from local boutiques. Apna Fashion Mart connects you with the best local fashion near you.',
  keywords: 'fashion marketplace, local clothing stores, nearby shops, Indian fashion, ethnic wear',
  openGraph: {
    title: 'Apna Fashion Mart',
    description: 'Discover local fashion near you',
    url: 'https://apnafashionmart.com',
    siteName: 'Apna Fashion Mart',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
