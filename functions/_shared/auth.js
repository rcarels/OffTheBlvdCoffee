export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");
    if (key === name) {
      return valueParts.join("=");
    }
  }

  return "";
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSession(env) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();

  await env.DB.prepare(
    `DELETE FROM admin_sessions WHERE expires_at <= CURRENT_TIMESTAMP`
  ).run();

  await env.DB.prepare(
    `INSERT INTO admin_sessions (session_token, expires_at)
     VALUES (?, ?)`
  )
    .bind(token, expiresAt)
    .run();

  return {
    token,
    cookie:
      `admin_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
  };
}

export async function requireAdmin(request, env) {
  if (!env.DB) {
    return json({ ok: false, error: "D1 binding DB missing" }, 500);
  }

  const token = getCookie(request, "admin_session");

  if (!token) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const session = await env.DB.prepare(
    `SELECT id
     FROM admin_sessions
     WHERE session_token = ?
       AND expires_at > CURRENT_TIMESTAMP
     LIMIT 1`
  )
    .bind(token)
    .first();

  if (!session) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  return null;
}

export async function isAdminAuthenticated(request, env) {
  const authError = await requireAdmin(request, env);
  return !authError;
}

export async function deleteAdminSession(request, env) {
  const token = getCookie(request, "admin_session");

  if (token && env.DB) {
    await env.DB.prepare(
      `DELETE FROM admin_sessions WHERE session_token = ?`
    )
      .bind(token)
      .run();
  }

  return "admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
