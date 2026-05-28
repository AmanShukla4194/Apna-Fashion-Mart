import { type NextRequest, NextResponse } from 'next/server';

/** Decode a JWT payload without verifying the signature (edge-safe). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Extract the auth token from cookie or Authorization header. */
function extractToken(request: NextRequest): string | null {
  const cookieToken = request.cookies.get('afm_token')?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = extractToken(request);
  const payload = token ? decodeJwtPayload(token) : null;
  const isAuthenticated = payload !== null;
  const role = payload?.['custom:role'] as string | undefined;

  // ------------------------------------------------------------------
  // Protected routes
  // ------------------------------------------------------------------

  // /customer/* and /checkout/* — any authenticated user
  if (pathname.startsWith('/customer/') || pathname.startsWith('/checkout/')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // /vendor/* — must be a vendor
  if (pathname.startsWith('/vendor/')) {
    if (!isAuthenticated || role !== 'vendor') {
      return NextResponse.redirect(new URL('/shop-login', request.url));
    }
  }

  // /admin/* — must be an admin
  if (pathname.startsWith('/admin/')) {
    if (!isAuthenticated || role !== 'admin') {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // ------------------------------------------------------------------
  // Redirect already-authenticated users away from auth pages
  // ------------------------------------------------------------------
  const authPages = ['/login', '/shop-login', '/admin-login', '/signup'];
  if (authPages.includes(pathname) && isAuthenticated) {
    if (role === 'vendor') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/vendor/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/login',
    '/shop-login',
    '/admin-login',
    '/signup',
  ],
};
