import { createAdminSession, json } from "../_shared/auth.js";

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const password = String(formData.get("password") || "");

    if (!env.ADMIN_PASSWORD) {
      return json({ ok: false, error: "ADMIN_PASSWORD secret missing" }, 500);
    }

    if (!env.DB) {
      return json({ ok: false, error: "D1 binding DB missing" }, 500);
    }

    if (password !== env.ADMIN_PASSWORD) {
      return json({ ok: false, error: "Invalid password" }, 401);
    }

    const session = await createAdminSession(env);

    return json({ ok: true }, 200, {
      "Set-Cookie": session.cookie,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: message }, 500);
  }
}
