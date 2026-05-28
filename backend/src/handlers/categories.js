const { query } = require('../db');
const { ok, error } = require('../response');

async function handle(ctx) {
  const { method } = ctx;
  if (method === 'GET') return list();
  return error(405, 'Method not allowed');
}

async function list() {
  const sql = `
    SELECT
      c.id, c.name, c.slug, c.description, c.image_url, c.parent_id,
      c.sort_order, c.is_active, c.created_at,
      COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') AS product_count,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') AS shop_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN shops s ON s.category_id = c.id
    WHERE c.is_active = true
    GROUP BY c.id
    ORDER BY c.sort_order ASC NULLS LAST, c.name ASC
  `;
  const result = await query(sql);

  const all = result.rows;
  const topLevel = all.filter(c => !c.parent_id);
  const children  = all.filter(c => c.parent_id);

  const tree = topLevel.map(cat => ({
    ...cat,
    children: children.filter(c => String(c.parent_id) === String(cat.id)),
  }));

  return ok({ categories: tree, total: all.length });
}

module.exports = { handle };
