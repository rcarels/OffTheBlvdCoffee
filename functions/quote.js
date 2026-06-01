export async function onRequestPost() {
  return new Response(
    JSON.stringify({ ok: false, error: "Function deprecated. Use /api/quote." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ ok: false, error: "Function deprecated. Use /api/quote." }),
    { status: 410, headers: { "Content-Type": "application/json" } }
  );
}
