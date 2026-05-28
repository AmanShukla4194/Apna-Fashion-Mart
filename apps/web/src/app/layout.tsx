import type { Metadata } from 'next';
import './globals.css';
import '../index.css';
import '../views/_styles.css';
import { AmplifyProvider } from '@/components/AmplifyProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import RevealObserver from '@/components/RevealObserver';
import StickyAppCta from '@/components/StickyAppCta';
import CartDrawerGlobal from '@/components/CartDrawerGlobal';
import AIChatBot from '@/components/AIChatBot';

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
        <AmplifyProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawerGlobal />
              <AIChatBot />
              <RevealObserver />
              <StickyAppCta />
              <Toaster position="top-center" />
            </CartProvider>
          </AuthProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
