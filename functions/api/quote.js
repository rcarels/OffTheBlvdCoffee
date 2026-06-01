import { EmailMessage } from "cloudflare:email";

function getFirst(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function safe(v) {
  const s = v === undefined || v === null ? "" : String(v);
  // prevent header injection in email subject/body
  return s.replace(/[\r\n]+/g, " ").trim();
}

async function handlePost(request, env) {
  const formData = await request.formData();

  // Honeypot
  const botField = formData.get("bot-field");
  if (botField && String(botField).trim() !== "") {
    // silently drop
    return Response.json({ ok: true }, { status: 200 });
  }

  const name = getFirst(formData.get("name"));
  const email = getFirst(formData.get("email"));
  const phone = getFirst(formData.get("phone"));
  const date = getFirst(formData.get("date"));
  const type = getFirst(formData.get("type"));
  const guests = getFirst(formData.get("guests"));
  const location = getFirst(formData.get("location"));
  const details = getFirst(formData.get("details"));

  if (!name || !email) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subject = `Off The Blvd Coffee - Quote Request (${safe(name)})`;
  const to = "hello@offtheblvdcoffee.com";
  const from = "hello@offtheblvdcoffee.com";

  const body = [
    "New quote request submitted from Off The Blvd Coffee website:",
    "",
    `Name: ${safe(name)}`,
    `Email: ${safe(email)}`,
    `Phone: ${safe(phone)}`,
    `Event Date: ${safe(date)}`,
    `Event Type: ${safe(type)}`,
    `Guest Count: ${safe(guests)}`,
    `Location: ${safe(location)}`,
    `Details: ${safe(details)}`,
    "",
    `Subject: ${subject}`,
  ].join("\n");

  const message = new EmailMessage(from, to, body);
  await env.SEND_EMAIL.send(message);

  return Response.json({ ok: true }, { status: 200 });
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, route: "/api/quote" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  return handlePost(context.request, context.env);
}
