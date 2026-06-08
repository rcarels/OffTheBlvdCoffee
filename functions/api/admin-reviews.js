import { json, requireAdmin } from "../_shared/auth.js";

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const result = await env.DB.prepare(
    `SELECT * FROM reviews
     ORDER BY sort_order ASC, created_at DESC`
  ).all();

  return json({ ok: true, reviews: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    const customerName = clean(formData.get("customer_name"));
    const reviewText = clean(formData.get("review_text"));
    const rating = Number(formData.get("rating") || 5);
    const eventType = clean(formData.get("event_type"));
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isFeatured = Number(formData.get("is_featured") || 0);

    if (!customerName) {
      return json({ ok: false, error: "Customer name is required" }, 400);
    }

    if (!reviewText) {
      return json({ ok: false, error: "Review is required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO reviews
       (customer_name, review_text, rating, event_type, sort_order, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(customerName, reviewText, rating, eventType, sortOrder, isFeatured ? 1 : 0, 1)
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
    const customerName = clean(formData.get("customer_name"));
    const reviewText = clean(formData.get("review_text"));
    const rating = Number(formData.get("rating") || 5);
    const eventType = clean(formData.get("event_type"));
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isFeatured = Number(formData.get("is_featured") || 0);
    const isActive = Number(formData.get("is_active") || 1);

    if (!id) {
      return json({ ok: false, error: "Missing review id" }, 400);
    }

    if (!customerName) {
      return json({ ok: false, error: "Customer name is required" }, 400);
    }

    if (!reviewText) {
      return json({ ok: false, error: "Review is required" }, 400);
    }

    await env.DB.prepare(
      `UPDATE reviews
       SET customer_name = ?,
           review_text = ?,
           rating = ?,
           event_type = ?,
           sort_order = ?,
           is_featured = ?,
           is_active = ?
       WHERE id = ?`
    )
      .bind(
        customerName,
        reviewText,
        rating,
        eventType,
        sortOrder,
        isFeatured ? 1 : 0,
        isActive ? 1 : 0,
        id
      )
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
      return json({ ok: false, error: "Missing review id" }, 400);
    }

    await env.DB.prepare("DELETE FROM reviews WHERE id = ?")
      .bind(id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}