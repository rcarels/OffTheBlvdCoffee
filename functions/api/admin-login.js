function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const password = String(formData.get("password") || "");

    if (!env.ADMIN_PASSWORD) {
      return json({ ok: false, error: "ADMIN_PASSWORD secret missing" }, 500);
    }

    if (password !== env.ADMIN_PASSWORD) {
      return json({ ok: false, error: "Invalid password" }, 401);
    }

    return json(
      { ok: true },
      200,
      {
        "Set-Cookie":
          "admin_auth=ok; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400",
      }
    );
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}