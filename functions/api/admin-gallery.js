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

async function requireAdmin(request, env) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  return null;
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const result = await env.DB.prepare(
    `SELECT * FROM gallery_images
     ORDER BY sort_order ASC, created_at DESC`
  ).all();

  return json({ ok: true, images: result.results || [] });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    const imageUrl = clean(formData.get("image_url"));
    const altText = clean(formData.get("alt_text"));
    const caption = clean(formData.get("caption"));
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isFeatured = Number(formData.get("is_featured") || 0);

    if (!imageUrl) {
      return json({ ok: false, error: "Image URL is required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO gallery_images
       (image_url, alt_text, caption, sort_order, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(imageUrl, altText, caption, sortOrder, isFeatured ? 1 : 0, 1)
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
    const imageUrl = clean(formData.get("image_url"));
    const altText = clean(formData.get("alt_text"));
    const caption = clean(formData.get("caption"));
    const sortOrder = Number(formData.get("sort_order") || 0);
    const isFeatured = Number(formData.get("is_featured") || 0);
    const isActive = Number(formData.get("is_active") || 1);

    if (!id) {
      return json({ ok: false, error: "Missing gallery image id" }, 400);
    }

    if (!imageUrl) {
      return json({ ok: false, error: "Image URL is required" }, 400);
    }

    await env.DB.prepare(
      `UPDATE gallery_images
       SET image_url = ?,
           alt_text = ?,
           caption = ?,
           sort_order = ?,
           is_featured = ?,
           is_active = ?
       WHERE id = ?`
    )
      .bind(
        imageUrl,
        altText,
        caption,
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
      return json({ ok: false, error: "Missing gallery image id" }, 400);
    }

    await env.DB.prepare(
      "DELETE FROM gallery_images WHERE id = ?"
    )
      .bind(id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}