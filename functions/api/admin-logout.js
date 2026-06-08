import { deleteAdminSession, json } from "../_shared/auth.js";

export async function onRequestPost({ request, env }) {
  const clearCookie = await deleteAdminSession(request, env);

  return json({ ok: true }, 200, {
    "Set-Cookie": clearCookie,
  });
}
