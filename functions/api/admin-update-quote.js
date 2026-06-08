import { json, requireAdmin } from "../_shared/auth.js";

const allowedStatuses = ["New", "Contacted", "Booked", "Completed", "Archived"];

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  try {
    const formData = await request.formData();

    const id = Number(formData.get("id"));
    const status = String(formData.get("status") || "").trim();

    if (!id) {
      return json({ ok: false, error: "Missing quote id" }, 400);
    }

    if (!allowedStatuses.includes(status)) {
      return json({ ok: false, error: "Invalid status" }, 400);
    }

    await env.DB.prepare(
      "UPDATE quotes SET status = ? WHERE id = ?"
    )
      .bind(status, id)
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}