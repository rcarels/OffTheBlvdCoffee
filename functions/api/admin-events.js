import { json, requireAdmin } from "../_shared/auth.js";

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function checkboxValue(formData, name, defaultValue = 1) {
  if (!formData.has(name)) return defaultValue;
  return formData.get(name) === "1" ? 1 : 0;
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
    const showOnWebsite = checkboxValue(formData, "show_on_website", 1);

    if (!title) {
      return json({ ok: false, error: "Event title is required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO events
       (title, event_date, location, description, is_active, show_on_website)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(title, eventDate, location, description, 1, showOnWebsite)
      .run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
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
    const showOnWebsite = checkboxValue(formData, "show_on_website", 1);

    if (!id) return json({ ok: false, error: "Missing event id" }, 400);
    if (!title) return json({ ok: false, error: "Event title is required" }, 400);

    await env.DB.prepare(
      `UPDATE events
       SET title = ?, event_date = ?, location = ?, description = ?, is_active = ?, show_on_website = ?
       WHERE id = ?`
    )
      .bind(title, eventDate, location, description, isActive ? 1 : 0, showOnWebsite, id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id) return json({ ok: false, error: "Missing event id" }, 400);

    await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(id).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 500);
  }
}