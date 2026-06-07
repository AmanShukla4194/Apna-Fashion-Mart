const crypto = require('crypto');
const { query, withTransaction } = require('../db');
const { requireAuth, requireRole } = require('../auth');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method, path, pathParams, queryParams, body, user } = ctx;

  if (method === 'PATCH' && pathParams.id && path.endsWith('/status')) {
    requireRole(user, 'vendor', 'admin');
    return updateStatus(user, pathParams.id, body);
  }
  if (method === 'GET' && pathParams.id) { requireAuth(user); return getById(user, pathParams.id); }
  if (method === 'GET')                   { requireAuth(user); return list(user, queryParams); }
  if (method === 'POST')                  { requireAuth(user); return create(user, body); }

  return error(405, 'Method not allowed');
}

async function list(user, params) {
  if (!user.dbId) return error(401, 'User not found');
  const { limit = '20', offset = '0', status } = params;

  const conditions = [];
  const values = [];
  let idx = 1;

  if (user.role === 'customer') {
    conditions.push(`o.user_id = $${idx++}`);
    values.push(user.dbId);
  } else if (user.role === 'vendor') {
    conditions.push(`o.shop_id IN (SELECT id FROM shops WHERE vendor_id = $${idx++})`);
    values.push(user.dbId);
  }
  // admin sees all

  if (status) { conditions.push(`o.status = $${idx++}`); values.push(status); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(parseInt(limit, 10) || 20, parseInt(offset, 10) || 0);

  const sql = `
    SELECT
      o.id, o.order_number, o.user_id, o.shop_id, o.status,
      o.payment_status, o.payment_method, o.subtotal, o.delivery_fee,
      o.discount, o.total, o.created_at, o.updated_at,
      s.name AS shop_name,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
    FROM orders o LEFT JOIN shops s ON s.id = o.shop_id
    ${where}
    ORDER BY o.created_at DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;
  const result = await query(sql, values);
  return ok({ orders: result.rows });
}

async function getById(user, id) {
  if (!user.dbId) return error(401, 'User not found');

  const [orderResult, itemsResult] = await Promise.all([
    query(
      `SELECT o.*, s.name AS shop_name, s.phone AS shop_phone
       FROM orders o LEFT JOIN shops s ON s.id = o.shop_id WHERE o.id = $1`,
      [id]
    ),
    query(
      `SELECT id, product_id, product_name, product_image,
              size, color, quantity, unit_price, total_price
       FROM order_items WHERE order_id = $1`,
      [id]
    ),
  ]);

  if (orderResult.rows.length === 0) return error(404, 'Order not found');
  const order = orderResult.rows[0];

  if (user.role === 'customer' && order.user_id !== user.dbId) {
    return error(403, 'Access denied');
  }
  if (user.role === 'vendor') {
    const check = await query(
      'SELECT 1 FROM shops WHERE id = $1 AND vendor_id = $2', [order.shop_id, user.dbId]
    );
    if (check.rows.length === 0) return error(403, 'Access denied');
  }

  order.items = itemsResult.rows;
  return ok(order);
}

async function create(user, body) {
  if (!user.dbId) return error(401, 'User not found in database');

  const {
    items, addressId, paymentMethod = 'cod',
    razorpayOrderId, razorpayPaymentId, razorpaySignature,
    notes,
  } = body;

  // Verify Razorpay signature for online payments
  if (paymentMethod === 'razorpay') {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return error(400, 'Razorpay payment details required for online payment');
    }
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (generated !== razorpaySignature) {
      return error(400, 'Payment verification failed');
    }
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return error(400, 'items array is required');
  }
  if (!addressId) return error(400, 'addressId is required');

  // Validate address belongs to user
  const addrResult = await query(
    'SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [addressId, user.dbId]
  );
  if (addrResult.rows.length === 0) return error(400, 'Invalid address');
  const address = addrResult.rows[0];

  // Fetch and validate all products
  const productIds = items.map(i => i.productId);
  const productsResult = await query(
    `SELECT id, shop_id, name, price, compare_price, stock_quantity, images, status
     FROM products WHERE id = ANY($1::uuid[]) AND status = 'active'`,
    [productIds]
  );
  if (productsResult.rows.length !== productIds.length) {
    return error(400, 'One or more products not found or inactive');
  }

  const productMap = Object.fromEntries(productsResult.rows.map(p => [p.id, p]));

  // All items must be from the same shop (schema enforces single shop_id per order)
  const shopIds = new Set(productsResult.rows.map(p => p.shop_id));
  if (shopIds.size > 1) {
    return error(400, 'All items in one order must be from the same shop. Place separate orders for different shops.');
  }
  const shopId = [...shopIds][0];

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap[item.productId];
    if (product.stock_quantity < item.quantity) {
      return error(400, `Insufficient stock for "${product.name}"`);
    }
    // Use compare_price (sale price) if set, else regular price — both in paise
    const unitPrice = product.compare_price ?? product.price;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] || null,
      size: item.size || null,
      color: item.color || null,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
    });
  }

  const deliveryFee = 0;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  // Snapshot the delivery address at order time
  const shippingAddress = {
    full_name: address.full_name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
  };

  return withTransaction(async (client) => {
    // Create a sequence for order numbers if it doesn't exist yet
    await client.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1`);
    const seqResult = await client.query(`SELECT NEXTVAL('order_number_seq') AS n`);
    const orderNumber = `AFM-${String(seqResult.rows[0].n).padStart(6, '0')}`;

    const payStatus = paymentMethod === 'razorpay' ? 'paid' : 'pending';

    const orderResult = await client.query(
      `INSERT INTO orders
         (order_number, user_id, shop_id, address_id, shipping_address,
          status, payment_status, payment_method, razorpay_order_id, razorpay_payment_id,
          subtotal, delivery_fee, discount, total, notes)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        orderNumber, user.dbId, shopId, addressId, JSON.stringify(shippingAddress),
        payStatus, paymentMethod, razorpayOrderId || null, razorpayPaymentId || null,
        subtotal, deliveryFee, discount, total, notes || null,
      ]
    );
    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_image,
            size, color, quantity, unit_price, total_price)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          order.id, item.product_id, item.product_name, item.product_image,
          item.size, item.color, item.quantity, item.unit_price, item.total_price,
        ]
      );
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    return ok({ ...order, items: orderItems }, 201);
  });
}

async function updateStatus(user, id, body) {
  if (!user.dbId) return error(401, 'User not found');

  const { status, razorpayPaymentId, cancelledReason } = body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  if (!status || !validStatuses.includes(status)) {
    return error(400, `status must be one of: ${validStatuses.join(', ')}`);
  }

  if (user.role === 'vendor') {
    const check = await query(
      `SELECT 1 FROM orders o JOIN shops s ON s.id = o.shop_id
       WHERE o.id = $1 AND s.vendor_id = $2`,
      [id, user.dbId]
    );
    if (check.rows.length === 0) return error(403, 'Not authorized to update this order');
  }

  const setClauses = ['status = $1'];
  const values = [status];
  let idx = 2;

  if (razorpayPaymentId) {
    setClauses.push(`razorpay_payment_id = $${idx++}`, `payment_status = 'paid'`);
    values.push(razorpayPaymentId);
  }
  if (status === 'delivered') {
    setClauses.push('delivered_at = NOW()');
  }
  if (cancelledReason && status === 'cancelled') {
    setClauses.push(`cancelled_reason = $${idx++}`);
    values.push(cancelledReason);
  }

  values.push(id);
  const result = await query(
    `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (result.rows.length === 0) return error(404, 'Order not found');
  return ok(result.rows[0]);
}

module.exports = { handle };
