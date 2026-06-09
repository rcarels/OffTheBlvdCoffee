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
    `SELECT title, event_date, location, description
     FROM events
     WHERE is_active = 1
       AND show_on_website = 1
     ORDER BY event_date ASC, created_at DESC`
  ).all();

  return json({
    ok: true,
    events: result.results || [],
  });
}