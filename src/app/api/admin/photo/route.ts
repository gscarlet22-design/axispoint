import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";
import { checkAdminPassphrase } from "@/lib/adminAuth";
import { saveSettings } from "@/lib/settings";

// sharp is a native addon — needs the Node runtime, not Edge.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const auth = checkAdminPassphrase(formData.get("passphrase"));
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No photo file provided" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN isn't configured — connect a Blob store to this project." },
      { status: 503 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const resized = await sharp(Buffer.from(arrayBuffer))
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  const blob = await put("card/photo.jpg", resized, {
    access: "public",
    contentType: "image/jpeg",
    allowOverwrite: true,
  });

  try {
    const settings = await saveSettings({ photoUrl: blob.url });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
