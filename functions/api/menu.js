function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  const result = await env.DB.prepare(
    `SELECT category, item_name, description, price
     FROM menu_items
     WHERE is_active = 1
     ORDER BY category ASC, sort_order ASC, item_name ASC`
  ).all();

  return json({
    ok: true,
    menu_items: result.results || [],
  });
}