const { query } = require('../db');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

// Reviews are product-level only.
// Shop avg_rating is updated automatically via DB trigger after product review changes.

async function handle(ctx) {
  const { method, pathParams, queryParams, body, user } = ctx;

  if (method === 'GET') return list(queryParams);

  requireAuth(user);
  if (!user.dbId) return error(401, 'User not found');

  if (method === 'POST')                    return create(user, body);
  if (method === 'DELETE' && pathParams.id) return remove(user, pathParams.id);

  return error(405, 'Method not allowed');
}

async function list(params) {
  const { productId, limit = '20', offset = '0' } = params;
  if (!productId) return error(400, 'productId query parameter is required');

  const [reviews, stats] = await Promise.all([
    query(
      `SELECT r.id, r.rating, r.title, r.body, r.images, r.is_verified, r.created_at,
              u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [productId, parseInt(limit, 10), parseInt(offset, 10)]
    ),
    query(
      `SELECT COUNT(*) AS total, ROUND(AVG(rating)::NUMERIC, 2) AS avg_rating,
              COUNT(CASE WHEN rating = 5 THEN 1 END) AS five_star,
              COUNT(CASE WHEN rating = 4 THEN 1 END) AS four_star,
              COUNT(CASE WHEN rating = 3 THEN 1 END) AS three_star,
              COUNT(CASE WHEN rating = 2 THEN 1 END) AS two_star,
              COUNT(CASE WHEN rating = 1 THEN 1 END) AS one_star
       FROM reviews WHERE product_id = $1`,
      [productId]
    ),
  ]);

  return ok({ reviews: reviews.rows, stats: stats.rows[0] });
}

async function create(user, body) {
  const { productId, orderId, rating, title, reviewBody, images = [] } = body;

  if (!productId) return error(400, 'productId is required');
  if (!rating || rating < 1 || rating > 5) return error(400, 'rating must be 1–5');

  // Must have received the product (verified purchase)
  const purchaseCheck = await query(
    `SELECT 1 FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
     LIMIT 1`,
    [user.dbId, productId]
  );
  if (purchaseCheck.rows.length === 0) {
    return error(403, 'You must have received this product to leave a review');
  }

  const existsCheck = await query(
    'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2', [user.dbId, productId]
  );
  if (existsCheck.rows.length > 0) return error(409, 'You have already reviewed this product');

  const result = await query(
    `INSERT INTO reviews (product_id, user_id, order_id, rating, title, body, images, is_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *`,
    [productId, user.dbId, orderId || null, parseInt(rating, 10), title || null, reviewBody || null, images]
  );
  return ok(result.rows[0], 201);
}

async function remove(user, id) {
  const check = await query('SELECT id, user_id FROM reviews WHERE id = $1', [id]);
  if (check.rows.length === 0) return error(404, 'Review not found');

  if (user.role !== 'admin' && check.rows[0].user_id !== user.dbId) {
    return error(403, 'Not authorized');
  }

  await query('DELETE FROM reviews WHERE id = $1', [id]);
  return ok({ success: true });
}

module.exports = { handle };
