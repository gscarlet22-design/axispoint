import { NextRequest } from "next/server";
import { resolveEffectiveEvent } from "@/config/card";
import { buildCardVcard } from "@/lib/vcard";
import { getSettings } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("e");
  const settings = await getSettings();
  const event = resolveEffectiveEvent(eventId, settings.currentEvent);

  // The admin-uploaded photo lives in Blob storage as a URL — vCard PHOTO
  // must be inline base64, not a URL (§6.3: iOS often won't fetch a URL photo
  // on import), so fetch and re-encode it here at request time.
  let photoBase64Override: string | undefined;
  if (settings.photoUrl) {
    try {
      const res = await fetch(settings.photoUrl);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        photoBase64Override = Buffer.from(buf).toString("base64");
      }
    } catch (error) {
      console.error("Failed to fetch admin-uploaded photo for vCard", error);
    }
  }

  const vcf = buildCardVcard(event, { photoBase64Override });

  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="garrett.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
