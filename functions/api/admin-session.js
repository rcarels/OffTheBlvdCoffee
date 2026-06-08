import { isAdminAuthenticated, json } from "../_shared/auth.js";

export async function onRequestGet({ request, env }) {
  const authenticated = await isAdminAuthenticated(request, env);
  return json({ ok: true, authenticated });
}
