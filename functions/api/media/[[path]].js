export async function onRequestGet({ params, env }) {
  if (!env.MEDIA_BUCKET) {
    return new Response("R2 binding MEDIA_BUCKET missing", { status: 500 });
  }

  const path = Array.isArray(params.path)
    ? params.path.join("/")
    : String(params.path || "");

  if (!path) {
    return new Response("Missing media path", { status: 400 });
  }

  const object = await env.MEDIA_BUCKET.get(path);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}