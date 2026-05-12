import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const CUSTOMER_ROUTES = ['/wishlist', '/cart', '/checkout', '/orders', '/customer-profile'];
const VENDOR_ROUTES = ['/vendor-dashboard'];
const ADMIN_ROUTES = ['/admin-dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response to mutate cookies on
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (keeps auth alive)
  const { data: { user } } = await supabase.auth.getUser();

  // Check customer-only routes
  const isCustomerRoute = CUSTOMER_ROUTES.some(r => pathname.startsWith(r));
  if (isCustomerRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check vendor-only routes
  const isVendorRoute = VENDOR_ROUTES.some(r => pathname.startsWith(r));
  if (isVendorRoute) {
    if (!user) return NextResponse.redirect(new URL('/shop-login', request.url));
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'vendor') return NextResponse.redirect(new URL('/shop-login', request.url));
  }

  // Check admin-only routes
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  if (isAdminRoute) {
    if (!user) return NextResponse.redirect(new URL('/admin-login', request.url));
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  // Redirect logged-in users away from auth pages
  const isAuthPage = ['/login', '/shop-login', '/admin-login', '/signup'].includes(pathname);
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'vendor') return NextResponse.redirect(new URL('/vendor-dashboard', request.url));
    if (profile?.role === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
