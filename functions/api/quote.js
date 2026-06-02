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
  try {
    const formData = await request.formData();

    // Read fields first so we don't touch email bindings/modules
    // unless the request is known-good.

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

const rawMessage = [
  `From: "Off The Blvd Coffee" <${from}>`,
  `To: ${to}`,
  `Reply-To: ${safe(email)}`,
  `Subject: ${subject}`,
  "Content-Type: text/plain; charset=UTF-8",
  "",
  body,
].join("\r\n");

const message = new EmailMessage(from, to, rawMessage);

    if (!env || !env.SEND_EMAIL) {
  console.error("SEND_EMAIL binding missing", { hasEnv: !!env, hasSendEmail: !!env?.SEND_EMAIL });

  return Response.json(
    {
      ok: true,
      warning: "Quote request received, but SEND_EMAIL binding is missing. Email was not sent."
    },
    { status: 200 }
  );
}

    try {
      await env.SEND_EMAIL.send(message);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : String(err);
      console.error("Failed to send quote email", { error: messageText });
      return Response.json({ ok: false, error: messageText }, { status: 500 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error in handlePost", { error: messageText });
    return Response.json({ ok: false, error: messageText }, { status: 500 });
  }
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
