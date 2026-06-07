const { query } = require('../db');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method, path, pathParams, body, user } = ctx;

  // GET /users/:id — public profile (no auth required)
  if (method === 'GET' && path.includes('/users/') && pathParams.id) {
    return getPublicProfile(pathParams.id);
  }

  requireAuth(user);

  // Auto-create DB row for Cognito users who confirmed before the trigger was working
  if (!user.dbId) {
    try {
      const role = user.role === 'vendor' ? 'vendor' : 'customer';
      const inserted = await query(
        `INSERT INTO users (cognito_sub, email, full_name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cognito_sub) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [user.sub, user.email, user.email.split('@')[0], role]
      );
      user.dbId = inserted.rows[0]?.id ?? null;
    } catch (e) {
      console.error('Auto-create user failed:', e.message);
      return error(404, 'User profile not found. Please contact support.');
    }
  }

  if (method === 'GET') return getOwnProfile(user);
  if (method === 'PUT') return updateProfile(user, body);

  return error(405, 'Method not allowed');
}

async function getOwnProfile(user) {
  const sql = `
    SELECT
      u.id, u.cognito_sub, u.email, u.full_name, u.phone, u.role,
      u.avatar_url, u.city, u.style_preferences, u.is_active, u.created_at,
      (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS total_orders,
      (SELECT COUNT(*) FROM wishlist w WHERE w.user_id = u.id) AS wishlist_count,
      (SELECT COUNT(*) FROM addresses a WHERE a.user_id = u.id) AS address_count,
      CASE WHEN u.role = 'vendor' THEN (
        SELECT json_agg(jsonb_build_object(
          'id', s.id, 'name', s.name, 'logo_url', s.logo_url, 'status', s.status,
          'avg_rating', s.avg_rating, 'product_count', s.product_count
        ))
        FROM shops s WHERE s.vendor_id = u.id AND s.status != 'closed'
      ) END AS shops
    FROM users u WHERE u.id = $1
  `;
  const result = await query(sql, [user.dbId]);
  if (result.rows.length === 0) return error(404, 'Profile not found');
  return ok(result.rows[0]);
}

async function getPublicProfile(userId) {
  const sql = `
    SELECT
      u.id, u.full_name, u.avatar_url, u.role, u.created_at,
      CASE WHEN u.role = 'vendor' THEN (
        SELECT json_agg(jsonb_build_object(
          'id', s.id, 'name', s.name, 'logo_url', s.logo_url,
          'avg_rating', s.avg_rating, 'review_count', s.review_count
        ))
        FROM shops s WHERE s.vendor_id = u.id AND s.status = 'active'
      ) END AS shops
    FROM users u WHERE u.id = $1 AND u.is_active = true
  `;
  const result = await query(sql, [userId]);
  if (result.rows.length === 0) return error(404, 'User not found');
  return ok(result.rows[0]);
}

async function updateProfile(user, body) {
  const allowed = ['full_name', 'phone', 'avatar_url', 'city', 'style_preferences'];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (body[key] !== undefined) {
      setClauses.push(`${key} = $${idx++}`);
      values.push(body[key]);
    }
  }

  if (setClauses.length === 0) return error(400, 'No valid fields to update');

  values.push(user.dbId);
  const result = await query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return ok(result.rows[0]);
}

module.exports = { handle };
