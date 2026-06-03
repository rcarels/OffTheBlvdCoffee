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

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export async function onRequestGet({ request, env }) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  const result = await env.DB.prepare(
    "SELECT * FROM events ORDER BY event_date ASC, created_at DESC"
  ).all();

  return json({ ok: true, events: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  try {
    const formData = await request.formData();

    const title = clean(formData.get("title"));
    const eventDate = clean(formData.get("event_date"));
    const location = clean(formData.get("location"));
    const description = clean(formData.get("description"));

    if (!title) {
      return json({ ok: false, error: "Event title is required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO events
       (title, event_date, location, description, is_active)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(title, eventDate, location, description, 1)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}