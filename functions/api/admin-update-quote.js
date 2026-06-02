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

const allowedStatuses = ["New", "Contacted", "Booked", "Completed", "Archived"];

export async function onRequestPost({ request, env }) {
  if (!isAuthed(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

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