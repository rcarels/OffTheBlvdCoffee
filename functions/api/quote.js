function getFirst(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function clean(value) {
  const s = value === undefined || value === null ? "" : String(value);
  return s.replace(/[\r\n]+/g, " ").trim();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet() {
  return json({ ok: true, route: "/api/quote" });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return json({ ok: false, error: "D1 binding DB missing" }, 500);
    }

    const formData = await request.formData();

    const botField = formData.get("bot-field");
    if (botField && String(botField).trim() !== "") {
      return json({ ok: true });
    }

    const name = clean(getFirst(formData.get("name")));
    const email = clean(getFirst(formData.get("email")));
    const phone = clean(getFirst(formData.get("phone")));
    const eventDate = clean(getFirst(formData.get("date")));
    const eventType = clean(getFirst(formData.get("type")));
    const guests = clean(getFirst(formData.get("guests")));
    const location = clean(getFirst(formData.get("location")));
    const details = clean(getFirst(formData.get("details")));

    if (!name || !email) {
      return json({ ok: false, error: "Name and email are required" }, 400);
    }

    await env.DB.prepare(
      `INSERT INTO quotes
       (name, email, phone, event_date, event_type, guests, location, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        name,
        email,
        phone,
        eventDate,
        eventType,
        guests,
        location,
        details,
        "New"
      )
      .run();

    return json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Quote submit error", message);
    return json({ ok: false, error: message }, 500);
  }
}