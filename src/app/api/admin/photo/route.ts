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

  // Vercel Blob supports two credential paths: the classic
  // `BLOB_READ_WRITE_TOKEN`, or `BLOB_STORE_ID` + an automatically-injected
  // OIDC token (the current default when a store is connected). Rather than
  // assume which one applies, let `put()` itself fail with its own precise
  // error if neither is present.
  const arrayBuffer = await file.arrayBuffer();
  const resized = await sharp(Buffer.from(arrayBuffer))
    .resize(400, 400, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();

  try {
    // This project's Blob store is configured private-only — public access
    // is rejected outright by the store itself, not just a per-call choice.
    // The photo is served back out through /api/photo (§ same directory),
    // which reads it with the SDK's authenticated access.
    const blob = await put("card/photo.jpg", resized, {
      access: "private",
      contentType: "image/jpeg",
      allowOverwrite: true,
      addRandomSuffix: false,
    });
    const settings = await saveSettings({ photoUrl: blob.url });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
