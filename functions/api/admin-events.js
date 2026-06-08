import { json, requireAdmin } from "../_shared/auth.js";

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const result = await env.DB.prepare(
    "SELECT * FROM events ORDER BY event_date ASC, created_at DESC"
  ).all();

  return json({ ok: true, events: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

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

export async function onRequestPut({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    const id = Number(formData.get("id"));
    const title = clean(formData.get("title"));
    const eventDate = clean(formData.get("event_date"));
    const location = clean(formData.get("location"));
    const description = clean(formData.get("description"));
    const isActive = Number(formData.get("is_active") || 1);

    if (!id) {
      return json({ ok: false, error: "Missing event id" }, 400);
    }

    if (!title) {
      return json({ ok: false, error: "Event title is required" }, 400);
    }

    await env.DB.prepare(
      `UPDATE events
       SET title = ?, event_date = ?, location = ?, description = ?, is_active = ?
       WHERE id = ?`
    )
      .bind(title, eventDate, location, description, isActive ? 1 : 0, id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id) {
      return json({ ok: false, error: "Missing event id" }, 400);
    }

    await env.DB.prepare(
      "DELETE FROM events WHERE id = ?"
    )
      .bind(id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}