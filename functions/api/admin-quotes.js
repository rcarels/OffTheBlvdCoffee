function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAuthed(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes("admin_auth=ok");
}

export async function onRequestGet({ request, env }) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  const result = await env.DB.prepare(
    `SELECT * FROM quotes ORDER BY created_at DESC LIMIT 100`
  ).all();

  return json({ ok: true, quotes: result.results || [] });
}