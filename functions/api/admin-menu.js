import { json, requireAdmin } from "../_shared/auth.js";

function clean(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const result = await env.DB.prepare(
    `SELECT * FROM menu_items
     ORDER BY category ASC, sort_order ASC, item_name ASC`
  ).all();

  return json({ ok: true, menu_items: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    const category = clean(formData.get("category"));
    const itemName = clean(formData.get("item_name"));
    const description = clean(formData.get("description"));
    const price = clean(formData.get("price"));
    const sortOrder = Number(formData.get("sort_order") || 0);

    if (!category) {
      return json({ ok: false, error: "Category is required" }, 400);
    }

    if (!itemName) {
      return json({ ok: false, error: "Item name is required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO menu_items
       (category, item_name, description, price, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(category, itemName, description, price, sortOrder, 1)
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
    const category = clean(formData.get("category"));
    const itemName = clean(formData.get("item_name"));
    const description = clean(formData.get("description"));
    const price = clean(formData.get("price"));
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isActive = Number(formData.get("is_active") || 1);

    if (!id) {
      return json({ ok: false, error: "Missing menu item id" }, 400);
    }

    if (!category) {
      return json({ ok: false, error: "Category is required" }, 400);
    }

    if (!itemName) {
      return json({ ok: false, error: "Item name is required" }, 400);
    }

    await env.DB.prepare(
      `UPDATE menu_items
       SET category = ?, item_name = ?, description = ?, price = ?, sort_order = ?, is_active = ?
       WHERE id = ?`
    )
      .bind(category, itemName, description, price, sortOrder, isActive ? 1 : 0, id)
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
      return json({ ok: false, error: "Missing menu item id" }, 400);
    }

    await env.DB.prepare(
      "DELETE FROM menu_items WHERE id = ?"
    )
      .bind(id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}