import { json, requireAdmin } from "../_shared/auth.js";

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

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
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

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