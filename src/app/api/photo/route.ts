import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getSettings } from "@/lib/settings";

// The Blob SDK's authenticated read — needs the Node runtime, not Edge.
export const runtime = "nodejs";

/**
 * Streams the admin-uploaded headshot from private Blob storage. The blob
 * itself can't be fetched by a plain public URL (this store is
 * private-only), so this route reads it with the SDK's own credentials and
 * re-serves it — the one place both the card page's <img> and /api/vcard's
 * base64 embedding go through.
 */
export async function GET() {
  const settings = await getSettings();
  if (!settings.photoUrl) {
    return NextResponse.json({ error: "No photo set" }, { status: 404 });
  }

  const result = await get(settings.photoUrl, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
