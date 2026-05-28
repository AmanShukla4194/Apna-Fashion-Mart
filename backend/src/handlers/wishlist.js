const { query } = require('../db');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method, pathParams, body, user } = ctx;

  requireAuth(user);
  if (!user.dbId) return error(401, 'User not found');

  if (method === 'DELETE' && pathParams.productId) return removeItem(user, pathParams.productId);
  if (method === 'GET')  return getWishlist(user);
  if (method === 'POST') return addItem(user, body);

  return error(405, 'Method not allowed');
}

async function getWishlist(user) {
  const sql = `
    SELECT
      w.id, w.product_id, w.created_at,
      p.name AS product_name, p.price, p.compare_price, p.images,
      p.status, p.stock_quantity, p.avg_rating, p.review_count,
      p.shop_id, s.name AS shop_name,
      p.category_id, c.name AS category_name
    FROM wishlist w
    JOIN products p ON p.id = w.product_id
    LEFT JOIN shops s ON s.id = p.shop_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE w.user_id = $1
    ORDER BY w.created_at DESC
  `;
  const result = await query(sql, [user.dbId]);
  return ok({ items: result.rows, count: result.rows.length });
}

async function addItem(user, body) {
  const { productId } = body;
  if (!productId) return error(400, 'productId is required');

  const productCheck = await query('SELECT id FROM products WHERE id = $1', [productId]);
  if (productCheck.rows.length === 0) return error(404, 'Product not found');

  const sql = `
    INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)
    ON CONFLICT (user_id, product_id) DO NOTHING RETURNING *
  `;
  const result = await query(sql, [user.dbId, productId]);

  if (result.rows.length === 0) {
    const existing = await query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2', [user.dbId, productId]
    );
    return ok(existing.rows[0]);
  }
  return ok(result.rows[0], 201);
}

async function removeItem(user, productId) {
  const result = await query(
    'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
    [user.dbId, productId]
  );
  if (result.rows.length === 0) return error(404, 'Item not in wishlist');
  return ok({ success: true });
}

module.exports = { handle };
