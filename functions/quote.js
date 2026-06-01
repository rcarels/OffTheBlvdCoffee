import { EmailMessage } from "cloudflare:email";

function getFirst(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const formData = await request.formData();

    // Honeypot
    const botField = formData.get("bot-field");
    if (botField && String(botField).trim() !== "") {
      // silently drop
      return new Response("OK", { status: 200 });
    }

    // Basic required fields (keep consistent with your UI requirements)
    const name = getFirst(formData.get("name"));
    const email = getFirst(formData.get("email"));
    const phone = getFirst(formData.get("phone"));
    const date = getFirst(formData.get("date"));
    const type = getFirst(formData.get("type"));
    const guests = getFirst(formData.get("guests"));
    const location = getFirst(formData.get("location"));
    const details = getFirst(formData.get("details"));

    // Validate minimally to reduce abuse / blank submissions
    if (!name || !email) {
      return new Response("Missing required fields", { status: 400 });
    }

    const safe = (v) => {
      const s = v === undefined || v === null ? "" : String(v);
      // prevent header injection in email subject/body
      return s.replace(/[\r\n]+/g, " ").trim();
    };

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
    ].join("\n");

    const message = new EmailMessage(from, to, body);
    await env.SEND_EMAIL.send(message);

    // Redirect target is handled by frontend; return JSON for fetch handler
    return Response.json({ ok: true });
  }
};
