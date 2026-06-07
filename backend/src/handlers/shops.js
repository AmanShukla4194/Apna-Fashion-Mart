const { query } = require('../db');
const { requireRole } = require('../auth');
const { ok, error } = require('../response');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const SHOP_COLS = `
  s.id, s.name, s.slug, s.description, s.logo_url, s.banner_url,
  s.phone, s.email, s.address_line1, s.address_line2,
  s.city, s.state, s.pincode, s.tags, s.opening_hours,
  s.status, s.is_verified, s.avg_rating, s.review_count, s.product_count,
  s.vendor_id, s.created_at,
  ST_X(s.location::geometry) AS longitude,
  ST_Y(s.location::geometry) AS latitude
`;

async function handle(ctx) {
  const { method, path, pathParams, queryParams, body, user } = ctx;

  if (method === 'GET' && path.endsWith('/shops/featured')) return getFeatured();
  if (method === 'GET' && path.endsWith('/shops/nearby'))   return getNearby(queryParams);
  if (method === 'GET' && path.endsWith('/shops/mine')) {
    requireRole(user, 'vendor', 'admin');
    return getMyShop(user);
  }
  if (method === 'GET' && pathParams.id)                    return getById(pathParams.id);
  if (method === 'GET')                                     return list(queryParams);

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
  const { search, category, limit = '20', offset = '0' } = params;
  const conditions = ["s.status = 'active'"];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(`(s.name ILIKE $${idx} OR s.description ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }
  if (category) { conditions.push(`s.category_id = $${idx++}`); values.push(category); }

  const where = `WHERE ${conditions.join(' AND ')}`;
  values.push(parseInt(limit, 10) || 20, parseInt(offset, 10) || 0);

  const sql = `
    SELECT ${SHOP_COLS} FROM shops s
        ${where}
    ORDER BY s.avg_rating DESC NULLS LAST, s.created_at DESC
    LIMIT $${idx++} OFFSET $${idx}
  `;
  const countSql = `SELECT COUNT(*) FROM shops s ${where}`;

  const [rows, countRow] = await Promise.all([
    query(sql, values),
    query(countSql, values.slice(0, values.length - 2)),
  ]);
  return ok({ shops: rows.rows, total: parseInt(countRow.rows[0].count, 10) });
}

async function getFeatured() {
  const sql = `
    SELECT ${SHOP_COLS} FROM shops s
        WHERE s.status = 'active' AND s.is_verified = true
    ORDER BY s.avg_rating DESC NULLS LAST LIMIT 20
  `;
  return ok({ shops: (await query(sql)).rows });
}

async function getMyShop(user) {
  const result = await query(
    `SELECT ${SHOP_COLS} FROM shops s
          WHERE s.vendor_id = $1 AND s.status != 'closed'
     ORDER BY s.created_at DESC LIMIT 1`,
    [user.dbId]
  );
  return ok(result.rows[0] || null);
}

async function getNearby(params) {
  const { lat, lng, radius = '10', limit = '20', offset = '0' } = params;
  if (!lat || !lng) return error(400, 'lat and lng are required');

  const latNum = parseFloat(lat), lngNum = parseFloat(lng), radiusKm = parseFloat(radius);
  if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusKm)) {
    return error(400, 'lat, lng, and radius must be valid numbers');
  }

  const sql = `
    SELECT ${SHOP_COLS},
      ROUND(
        (ST_Distance(s.location::geography, ST_MakePoint($2, $1)::geography) / 1000.0)::NUMERIC,
        2
      ) AS distance_km
    FROM shops s     WHERE s.status = 'active'
      AND s.location IS NOT NULL
      AND ST_DWithin(s.location::geography, ST_MakePoint($2, $1)::geography, $3 * 1000)
    ORDER BY ST_Distance(s.location::geography, ST_MakePoint($2, $1)::geography) ASC
    LIMIT $4 OFFSET $5
  `;
  const result = await query(sql, [latNum, lngNum, radiusKm, parseInt(limit, 10), parseInt(offset, 10)]);
  return ok({ shops: result.rows, lat: latNum, lng: lngNum, radius_km: radiusKm });
}

async function getById(id) {
  const [shopResult, productsResult] = await Promise.all([
    query(
      `SELECT ${SHOP_COLS} FROM shops s LEFT JOIN categories c ON c.id = s.category_id WHERE s.id = $1`,
      [id]
    ),
    query(
      `SELECT p.id, p.name, p.slug, p.price, p.compare_price, p.images,
              p.stock_quantity, p.status, p.is_featured, p.avg_rating,
              p.created_at, p.category_id, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.shop_id = $1 AND p.status = 'active'
       ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 50`,
      [id]
    ),
  ]);

  if (shopResult.rows.length === 0) return error(404, 'Shop not found');
  const shop = shopResult.rows[0];
  shop.products = productsResult.rows;
  return ok(shop);
}

async function create(user, body) {
  if (!user.dbId) return error(401, 'User not found in database');

  const {
    name, description, logo_url, banner_url, phone, email,
    address_line1, address_line2, city, state, pincode,
    latitude, longitude, opening_hours, tags = [],
  } = body;

  if (!name || !city) return error(400, 'name and city are required');

  const baseSlug = slugify(name);
  const existing = await query('SELECT COUNT(*) FROM shops WHERE slug LIKE $1', [`${baseSlug}%`]);
  const count = parseInt(existing.rows[0].count, 10);
  const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

  const hasLocation = latitude != null && longitude != null;
  const baseValues = [
    user.dbId, name, slug, description || null, logo_url || null, banner_url || null,
    phone || null, email || null, address_line1 || null, address_line2 || null,
    city, state || null, pincode || null,
    tags, opening_hours ? JSON.stringify(opening_hours) : null,
  ];

  const sql = hasLocation
    ? `INSERT INTO shops
         (vendor_id, name, slug, description, logo_url, banner_url, phone, email,
          address_line1, address_line2, city, state, pincode,
          tags, opening_hours, location, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
         ST_SetSRID(ST_MakePoint($16, $17), 4326), 'pending') RETURNING *`
    : `INSERT INTO shops
         (vendor_id, name, slug, description, logo_url, banner_url, phone, email,
          address_line1, address_line2, city, state, pincode,
          tags, opening_hours, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, 'pending') RETURNING *`;

  const values = hasLocation
    ? [...baseValues, parseFloat(longitude), parseFloat(latitude)]
    : baseValues;

  const result = await query(sql, values);
  return ok(result.rows[0], 201);
}

async function update(user, id, body) {
  if (user.role === 'vendor') {
    const check = await query('SELECT id FROM shops WHERE id = $1 AND vendor_id = $2', [id, user.dbId]);
    if (check.rows.length === 0) return error(403, 'Not authorized to update this shop');
  }

  const allowed = [
    'name', 'description', 'logo_url', 'banner_url', 'phone', 'email',
    'address_line1', 'address_line2', 'city', 'state', 'pincode', 'tags',
  ];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (body[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }
  if (body.opening_hours !== undefined) {
    setClauses.push(`opening_hours = $${idx++}`);
    values.push(JSON.stringify(body.opening_hours));
  }
  if (body.latitude != null && body.longitude != null) {
    setClauses.push(`location = ST_SetSRID(ST_MakePoint($${idx++}, $${idx++}), 4326)`);
    values.push(parseFloat(body.longitude), parseFloat(body.latitude));
  }
  // Only admins can change shop status
  if (body.status && user.role === 'admin') {
    setClauses.push(`status = $${idx++}`);
    values.push(body.status);
  }

  if (setClauses.length === 0) return error(400, 'No valid fields to update');
  values.push(id);

  const result = await query(
    `UPDATE shops SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  if (result.rows.length === 0) return error(404, 'Shop not found');
  return ok(result.rows[0]);
}

async function remove(user, id) {
  if (user.role === 'vendor') {
    const check = await query('SELECT id FROM shops WHERE id = $1 AND vendor_id = $2', [id, user.dbId]);
    if (check.rows.length === 0) return error(403, 'Not authorized');
  }
  await query("UPDATE shops SET status = 'closed' WHERE id = $1", [id]);
  return ok({ success: true });
}

module.exports = { handle };
