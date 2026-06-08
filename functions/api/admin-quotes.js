import { json, requireAdmin } from "../_shared/auth.js";

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  const result = await env.DB.prepare(
    `SELECT * FROM quotes ORDER BY created_at DESC LIMIT 100`
  ).all();

  return json({ ok: true, quotes: result.results || [] });
}