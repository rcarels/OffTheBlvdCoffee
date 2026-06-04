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
    `SELECT
        customer_name,
        review_text,
        rating,
        event_type,
        is_featured
     FROM reviews
     WHERE is_active = 1
     ORDER BY is_featured DESC,
              sort_order ASC,
              created_at DESC`
  ).all();

  return json({
    ok: true,
    reviews: result.results || [],
  });
}