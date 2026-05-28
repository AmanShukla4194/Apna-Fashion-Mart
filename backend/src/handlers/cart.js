const { query } = require('../db');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method, path, pathParams, body, user } = ctx;

  requireAuth(user);
  if (!user.dbId) return error(401, 'User not found');

  if (method === 'DELETE' && !pathParams.id && path.endsWith('/cart')) return clearCart(user);
  if (method === 'DELETE' && pathParams.id) return removeItem(user, pathParams.id);
  if (method === 'PUT' && pathParams.id)    return updateItem(user, pathParams.id, body);
  if (method === 'GET')                     return getCart(user);
  if (method === 'POST')                    return addItem(user, body);

  return error(405, 'Method not allowed');
}

async function getCart(user) {
  const sql = `
    SELECT
      ci.id, ci.product_id, ci.quantity, ci.size, ci.color, ci.created_at,
      p.name AS product_name, p.price, p.compare_price, p.images,
      p.stock_quantity, p.status,
      p.shop_id, s.name AS shop_name, s.id AS shop_id_check
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    LEFT JOIN shops s ON s.id = p.shop_id
    WHERE ci.user_id = $1 AND p.status = 'active'
    ORDER BY ci.created_at DESC
  `;
  const result = await query(sql, [user.dbId]);
  const items = result.rows;
  // Prices are in paise; return subtotal in paise
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.compare_price ?? item.price) * item.quantity;
  }, 0);
  return ok({ items, subtotal, item_count: items.length });
}

async function addItem(user, body) {
  const { productId, quantity = 1, size = null, color = null } = body;
  if (!productId) return error(400, 'productId is required');
  if (quantity < 1) return error(400, 'quantity must be at least 1');

  const productCheck = await query(
    "SELECT id, stock_quantity FROM products WHERE id = $1 AND status = 'active'",
    [productId]
  );
  if (productCheck.rows.length === 0) return error(404, 'Product not found or inactive');

  const product = productCheck.rows[0];
  if (product.stock_quantity < quantity) return error(400, 'Insufficient stock');

  // UNIQUE(user_id, product_id, size, color) — same product with different size/color is a separate cart item
  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity, size, color)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, product_id, size, color)
    DO UPDATE SET
      quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, $6),
      updated_at = NOW()
    RETURNING *
  `;
  const result = await query(sql, [user.dbId, productId, quantity, size, color, product.stock_quantity]);
  return ok(result.rows[0], 201);
}

async function updateItem(user, id, body) {
  const { quantity } = body;
  if (quantity == null || quantity < 1) return error(400, 'quantity must be at least 1');

  const itemCheck = await query(
    `SELECT ci.id, p.stock_quantity FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.id = $1 AND ci.user_id = $2`,
    [id, user.dbId]
  );
  if (itemCheck.rows.length === 0) return error(404, 'Cart item not found');
  if (quantity > itemCheck.rows[0].stock_quantity) return error(400, 'Quantity exceeds available stock');

  const result = await query(
    'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
    [quantity, id, user.dbId]
  );
  return ok(result.rows[0]);
}

async function removeItem(user, id) {
  const result = await query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.dbId]
  );
  if (result.rows.length === 0) return error(404, 'Cart item not found');
  return ok({ success: true });
}

async function clearCart(user) {
  const result = await query('DELETE FROM cart_items WHERE user_id = $1', [user.dbId]);
  return ok({ success: true, deleted_count: result.rowCount });
}

module.exports = { handle };
