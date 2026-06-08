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

function safeFileName(name) {
  return String(name || "upload")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtension(fileName, mimeType) {
  const existing = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  if (existing) return existing;

  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";

  return "bin";
}

export async function onRequestPost({ request, env }) {
  try {
    if (!isAuthed(request)) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    if (!env.DB) {
      return json({ ok: false, error: "D1 binding DB missing" }, 500);
    }

    if (!env.MEDIA_BUCKET) {
      return json({ ok: false, error: "R2 binding MEDIA_BUCKET missing" }, 500);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return json({ ok: false, error: "No file uploaded." }, 400);
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return json({
        ok: false,
        error: "Only JPG, PNG, WEBP, and GIF images are allowed.",
      }, 400);
    }

    const maxBytes = 8 * 1024 * 1024;

    if (file.size > maxBytes) {
      return json({
        ok: false,
        error: "Image is too large. Please upload an image under 8 MB.",
      }, 400);
    }

    const cleanedName = safeFileName(file.name);
    const ext = getExtension(cleanedName, file.type);
    const id = crypto.randomUUID();
    const filePath = `gallery/${id}.${ext}`;

    await env.MEDIA_BUCKET.put(filePath, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    await env.DB.prepare(
      `INSERT INTO media_assets (
        file_name,
        file_path,
        mime_type,
        file_size
      ) VALUES (?, ?, ?, ?)`
    )
      .bind(cleanedName, filePath, file.type, file.size)
      .run();

    const publicUrl = `/api/media/${filePath}`;

    return json({
      ok: true,
      file_name: cleanedName,
      file_path: filePath,
      image_url: publicUrl,
    });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}