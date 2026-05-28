const { query } = require('../db');
const { requireRole } = require('../auth');
const { ok, error } = require('../response');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const PRODUCT_COLS = `
  p.id, p.name, p.slug, p.description,
  p.price, p.compare_price, p.images, p.sizes, p.colors,
  p.material, p.gender, p.tags, p.attributes,
  p.stock_quantity, p.status, p.is_featured,
  p.avg_rating, p.review_count,
  p.shop_id, s.name AS shop_name,
  p.category_id, c.name AS category_name, p.created_at
`;

async function handle(ctx) {
  const { method, path, pathParams, queryParams, body, user } = ctx;

  if (method === 'GET' && path.endsWith('/products/featured')) return getFeatured();
  if (method === 'GET' && pathParams.id) return getById(pathParams.id);
  if (method === 'GET') return list(queryParams);

  if (method === 'POST') {
    requireRole(user, 'vendor', 'admin');
    return create(user, body);
  }
  if (method === 'PUT' && pathParams.id) {
    requireRole(user, 'vendor', 'admin');
    return update(user, pathParams.id, body);
  }
  if (method === 'DELETE' && pathParams.id) {
    requireRole(user, 'vendor', 'admin');
    return remove(user, pathParams.id);
  }

  return error(405, 'Method not allowed');
}

async function list(params) {
  const {
    category, shop, search, gender,
    minPrice, maxPrice, status = 'active',
    limit = '20', offset = '0',
  } = params;

  const conditions = [`p.status = $1`];
  const values = [status];
  let idx = 2;

  if (category) { conditions.push(`p.category_id = $${idx++}`); values.push(category); }
  if (shop)     { conditions.push(`p.shop_id = $${idx++}`);      values.push(shop); }
  if (gender)   { conditions.push(`p.gender = $${idx++}`);       values.push(gender); }
  if (minPrice) { conditions.push(`p.price >= $${idx++}`);       values.push(parseInt(minPrice, 10)); }
  if (maxPrice) { conditions.push(`p.price <= $${idx++}`);       values.push(parseInt(maxPrice, 10)); }
  if (search)   { conditions.push(`p.name ILIKE $${idx++}`);     values.push(`%${search}%`); }

  const where = `WHERE ${conditions.join(' AND ')}`;
  values.push(parseInt(limit, 10) || 20, parseInt(offset, 10) || 0);

  const sql = `
    SELECT ${PRODUCT_COLS} FROM products p
    LEFT JOIN shops s ON s.id = p.shop_id
    LEFT JOIN categories c ON c.id = p.category_id
    ${where}
    ORDER BY p.is_featured DESC, p.created_at DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;
  const countSql = `SELECT COUNT(*) FROM products p ${where}`;

  const [rows, countRow] = await Promise.all([
    query(sql, values),
    query(countSql, values.slice(0, values.length - 2)),
  ]);
  return ok({
    products: rows.rows,
    total: parseInt(countRow.rows[0].count, 10),
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
  });
}

async function getFeatured() {
  const sql = `
    SELECT ${PRODUCT_COLS} FROM products p
    LEFT JOIN shops s ON s.id = p.shop_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_featured = true AND p.status = 'active'
    ORDER BY p.avg_rating DESC LIMIT 20
  `;
  return ok({ products: (await query(sql)).rows });
}

async function getById(id) {
  const [productResult, reviewsResult] = await Promise.all([
    query(
      `SELECT ${PRODUCT_COLS}, s.vendor_id AS shop_vendor_id FROM products p
       LEFT JOIN shops s ON s.id = p.shop_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [id]
    ),
    query(
      `SELECT r.id, r.rating, r.title, r.body, r.images, r.is_verified, r.created_at,
              u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 20`,
      [id]
    ),
  ]);

  if (productResult.rows.length === 0) return error(404, 'Product not found');
  const product = productResult.rows[0];
  product.reviews = reviewsResult.rows;
  return ok(product);
}

async function create(user, body) {
  if (!user.dbId) return error(401, 'User not found in database');

  const {
    name, description, price, compare_price, images = [],
    sizes = [], colors = [], material, gender, tags = [], attributes = {},
    stock_quantity = 0, category_id, shop_id, is_featured = false,
  } = body;

  if (!name || price == null || !shop_id) {
    return error(400, 'name, price, and shop_id are required');
  }

  // Prices are stored in paise (1 rupee = 100 paise)
  const priceInt = Math.round(parseFloat(price));
  const comparePriceInt = compare_price != null ? Math.round(parseFloat(compare_price)) : null;

  if (user.role === 'vendor') {
    const shopCheck = await query(
      'SELECT id FROM shops WHERE id = $1 AND vendor_id = $2', [shop_id, user.dbId]
    );
    if (shopCheck.rows.length === 0) return error(403, 'You do not own this shop');
  }

  const baseSlug = slugify(name);
  const existing = await query(
    'SELECT COUNT(*) FROM products WHERE shop_id = $1 AND slug LIKE $2',
    [shop_id, `${baseSlug}%`]
  );
  const count = parseInt(existing.rows[0].count, 10);
  const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

  const result = await query(
    `INSERT INTO products
       (shop_id, category_id, name, slug, description, price, compare_price,
        images, sizes, colors, material, gender, tags, attributes,
        stock_quantity, is_featured, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'active')
     RETURNING *`,
    [
      shop_id, category_id || null, name, slug, description || null,
      priceInt, comparePriceInt, images, sizes, colors,
      material || null, gender || null, tags, JSON.stringify(attributes),
      parseInt(stock_quantity, 10), is_featured,
    ]
  );
  return ok(result.rows[0], 201);
}

async function update(user, id, body) {
  if (user.role === 'vendor') {
    const check = await query(
      `SELECT p.id FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE p.id = $1 AND s.vendor_id = $2`,
      [id, user.dbId]
    );
    if (check.rows.length === 0) return error(403, 'Not authorized to update this product');
  }

  const transforms = {
    name: v => v, description: v => v, gender: v => v, material: v => v,
    price: v => Math.round(parseFloat(v)),
    compare_price: v => Math.round(parseFloat(v)),
    stock_quantity: v => parseInt(v, 10),
    images: v => v, sizes: v => v, colors: v => v, tags: v => v,
    attributes: v => JSON.stringify(v),
    is_featured: v => v, status: v => v,
  };

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [key, transform] of Object.entries(transforms)) {
    if (body[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(transform(body[key]));
    }
  }

  if (setClauses.length === 0) return error(400, 'No valid fields to update');
  values.push(id);

  const result = await query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (result.rows.length === 0) return error(404, 'Product not found');
  return ok(result.rows[0]);
}

async function remove(user, id) {
  if (user.role === 'vendor') {
    const check = await query(
      `SELECT p.id FROM products p JOIN shops s ON s.id = p.shop_id
       WHERE p.id = $1 AND s.vendor_id = $2`,
      [id, user.dbId]
    );
    if (check.rows.length === 0) return error(403, 'Not authorized');
  }
  await query("UPDATE products SET status = 'archived' WHERE id = $1", [id]);
  return ok({ success: true });
}

module.exports = { handle };
