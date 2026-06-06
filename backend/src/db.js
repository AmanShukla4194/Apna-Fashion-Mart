const { Signer } = require('@aws-sdk/rds-signer');
const { Pool } = require('pg');

let pool = null;
let poolCreatedAt = 0;
const TOKEN_TTL_MS = 12 * 60 * 1000; // 12 min (IAM tokens valid 15 min)

// Fall back to password auth when DB_PASSWORD is set (local dev / migrations)
const useIam = !process.env.DB_PASSWORD;

async function buildPool() {
  let password = process.env.DB_PASSWORD;

  if (useIam) {
    const signer = new Signer({
      region: process.env.AWS_REGION || 'ap-south-1',
      hostname: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
    });
    password = await signer.getAuthToken();
  }

  return new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 25000, // Aurora Serverless cold start can take 10-15s
  });
}

async function getPool() {
  if (!pool || (useIam && Date.now() - poolCreatedAt > TOKEN_TTL_MS)) {
    if (pool) { try { await pool.end(); } catch {} }
    pool = await buildPool();
    poolCreatedAt = Date.now();
  }
  return pool;
}

async function query(sql, params) {
  const p = await getPool();
  const client = await p.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function withTransaction(fn) {
  const p = await getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Cache cognito_sub → DB user per Lambda invocation
const userCache = new Map();

async function getDbUser(cognitoSub) {
  if (userCache.has(cognitoSub)) return userCache.get(cognitoSub);
  const result = await query(
    'SELECT id, email, full_name, role, is_active FROM users WHERE cognito_sub = $1',
    [cognitoSub]
  );
  if (result.rows.length === 0) return null;
  userCache.set(cognitoSub, result.rows[0]);
  return result.rows[0];
}

module.exports = { getPool, query, withTransaction, getDbUser };
