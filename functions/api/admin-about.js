import { json, requireAdmin } from "../_shared/auth.js";

function clean(value) {
  return String(value || "").trim();
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  const result = await env.DB.prepare(
    "SELECT * FROM site_about ORDER BY id ASC LIMIT 1"
  ).first();

  return json({ ok: true, about: result || null });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  try {
    const formData = await request.formData();

    const heading = clean(formData.get("heading"));
    const mainParagraph = clean(formData.get("main_paragraph"));
    const storyParagraph = clean(formData.get("story_paragraph"));
    const serviceAreaText = clean(formData.get("service_area_text"));

    if (!heading) {
      return json({ ok: false, error: "Heading is required" }, 400);
    }

    const existing = await env.DB.prepare(
      "SELECT id FROM site_about ORDER BY id ASC LIMIT 1"
    ).first();

    if (existing) {
      await env.DB.prepare(
        `UPDATE site_about
         SET heading = ?,
             main_paragraph = ?,
             story_paragraph = ?,
             service_area_text = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
        .bind(
          heading,
          mainParagraph,
          storyParagraph,
          serviceAreaText,
          existing.id
        )
        .run();
    } else {
      await env.DB.prepare(
        `INSERT INTO site_about
         (heading, main_paragraph, story_paragraph, service_area_text)
         VALUES (?, ?, ?, ?)`
      )
        .bind(heading, mainParagraph, storyParagraph, serviceAreaText)
        .run();
    }

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}