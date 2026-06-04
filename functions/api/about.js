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

  const about = await env.DB.prepare(
    "SELECT heading, main_paragraph, story_paragraph, service_area_text FROM site_about ORDER BY id ASC LIMIT 1"
  ).first();

  return json({ ok: true, about: about || null });
}