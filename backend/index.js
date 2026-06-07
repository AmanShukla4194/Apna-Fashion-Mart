const { verifyToken } = require('./src/auth');
const { getDbUser } = require('./src/db');
const { ok, error, options: optionsResponse } = require('./src/response');
const products = require('./src/handlers/products');
const shops = require('./src/handlers/shops');
const orders = require('./src/handlers/orders');
const cart = require('./src/handlers/cart');
const wishlist = require('./src/handlers/wishlist');
const profile = require('./src/handlers/profile');
const addresses = require('./src/handlers/addresses');
const reviews = require('./src/handlers/reviews');
const categories = require('./src/handlers/categories');
const uploads = require('./src/handlers/uploads');
const razorpay = require('./src/handlers/razorpay');

exports.handler = async (event) => {
  const httpMethod = event.httpMethod || event.requestContext?.http?.method || '';
  if (httpMethod === 'OPTIONS') return optionsResponse();

  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  const jwtUser = await verifyToken(authHeader);

  let user = null;
  if (jwtUser) {
    const dbUser = await getDbUser(jwtUser.sub);
    user = {
      sub: jwtUser.sub,
      email: jwtUser.email,
      // Prefer DB role (authoritative); fall back to JWT claim
      role: dbUser?.role || jwtUser.role,
      dbId: dbUser?.id || null,
      isActive: dbUser?.is_active ?? true,
    };
  }

  // HTTP API (v2) uses requestContext.http.method; REST API (v1) uses httpMethod
  const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
  const path   = event.rawPath || event.path || '';
  const pathParams  = { ...(event.pathParameters || {}) };
  const queryParams = event.queryStringParameters || {};

  // Extract path ID for catch-all $default routes where pathParameters is empty
  if (!pathParams.id) {
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const last = segments[segments.length - 1];
      const knownSubs = ['featured','nearby','mine','status','search',
                         'create-order','verify','razorpay-create','items'];
      if (!knownSubs.includes(last)) pathParams.id = last;
    }
  }
  let body = {};

  if (event.body) {
    try { body = JSON.parse(event.body); } catch { return error(400, 'Invalid JSON body'); }
  }

  try {
    const ctx = { user, method, path, pathParams, queryParams, body };

    if (path.startsWith('/products'))  return await products.handle(ctx);
    if (path.startsWith('/shops'))     return await shops.handle(ctx);
    if (path.startsWith('/orders'))    return await orders.handle(ctx);
    if (path.startsWith('/cart'))      return await cart.handle(ctx);
    if (path.startsWith('/wishlist'))  return await wishlist.handle(ctx);
    if (path.startsWith('/addresses')) return await addresses.handle(ctx);
    if (path.startsWith('/reviews'))   return await reviews.handle(ctx);
    if (path.startsWith('/categories'))return await categories.handle(ctx);
    if (path.startsWith('/uploads'))   return await uploads.handle(ctx);
    if (path.startsWith('/razorpay'))  return await razorpay.handle(ctx);
    if (path.startsWith('/profile') || path.startsWith('/users')) return await profile.handle(ctx);

    return error(404, 'Not found');
  } catch (err) {
    if (err.statusCode) return error(err.statusCode, err.message);
    console.error('Unhandled error:', err);
    return error(500, 'Internal server error');
  }
};
