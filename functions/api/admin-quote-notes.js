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

  const url = new URL(request.url);
  const quoteId = Number(url.searchParams.get("quote_id"));

  if (!quoteId) {
    return json({ ok: false, error: "Missing quote_id" }, 400);
  }

  const result = await env.DB.prepare(
    "SELECT * FROM quote_notes WHERE quote_id = ? ORDER BY created_at DESC"
  ).bind(quoteId).all();

  return json({ ok: true, notes: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const formData = await request.formData();
  const quoteId = Number(formData.get("quote_id"));
  const note = String(formData.get("note") || "").trim();

  if (!quoteId || !note) {
    return json({ ok: false, error: "Missing quote_id or note" }, 400);
  }

  await env.DB.prepare(
    "INSERT INTO quote_notes (quote_id, note) VALUES (?, ?)"
  ).bind(quoteId, note).run();

  return json({ ok: true });
}