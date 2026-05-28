const { query, withTransaction } = require('../db');
const { requireAuth } = require('../auth');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method, pathParams, body, user } = ctx;

  requireAuth(user);
  if (!user.dbId) return error(401, 'User not found in database');

  if (method === 'GET' && !pathParams.id) return list(user);
  if (method === 'POST')                   return create(user, body);
  if (method === 'PUT' && pathParams.id)   return update(user, pathParams.id, body);
  if (method === 'DELETE' && pathParams.id) return remove(user, pathParams.id);

  return error(405, 'Method not allowed');
}

async function list(user) {
  const result = await query(
    `SELECT id, type, full_name, phone, line1, line2, city, state, pincode, country, is_default, created_at
     FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
    [user.dbId]
  );
  return ok({ addresses: result.rows });
}

async function create(user, body) {
  const {
    fullName, phone, line1, line2 = null,
    city, state, pincode, country = 'India',
    type = 'home', isDefault = false,
  } = body;

  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return error(400, 'fullName, phone, line1, city, state, and pincode are required');
  }

  return withTransaction(async (client) => {
    const countResult = await client.query(
      'SELECT COUNT(*) FROM addresses WHERE user_id = $1', [user.dbId]
    );
    const makeDefault = isDefault || parseInt(countResult.rows[0].count, 10) === 0;

    if (makeDefault) {
      await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user.dbId]);
    }

    const result = await client.query(
      `INSERT INTO addresses (user_id, type, full_name, phone, line1, line2, city, state, pincode, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [user.dbId, type, fullName, phone, line1, line2, city, state, pincode, country, makeDefault]
    );
    return ok(result.rows[0], 201);
  });
}

async function update(user, id, body) {
  const check = await query('SELECT id FROM addresses WHERE id = $1 AND user_id = $2', [id, user.dbId]);
  if (check.rows.length === 0) return error(404, 'Address not found');

  const fieldMap = {
    fullName: 'full_name', phone: 'phone', line1: 'line1', line2: 'line2',
    city: 'city', state: 'state', pincode: 'pincode', country: 'country', type: 'type',
  };

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const [bodyKey, col] of Object.entries(fieldMap)) {
    if (body[bodyKey] !== undefined) {
      setClauses.push(`${col} = $${idx++}`);
      values.push(body[bodyKey]);
    }
  }

  return withTransaction(async (client) => {
    if (body.isDefault === true) {
      await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [user.dbId]);
      setClauses.push('is_default = true');
    } else if (body.isDefault === false) {
      setClauses.push('is_default = false');
    }

    if (setClauses.length === 0) return error(400, 'No valid fields to update');

    values.push(id, user.dbId);
    const sql = `UPDATE addresses SET ${setClauses.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`;
    const result = await client.query(sql, values);
    return ok(result.rows[0]);
  });
}

async function remove(user, id) {
  const result = await query(
    'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id, is_default',
    [id, user.dbId]
  );
  if (result.rows.length === 0) return error(404, 'Address not found');

  // Promote the next most recent as default if we deleted the default
  if (result.rows[0].is_default) {
    await query(
      `UPDATE addresses SET is_default = true
       WHERE id = (SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1)`,
      [user.dbId]
    );
  }

  return ok({ success: true });
}

module.exports = { handle };
