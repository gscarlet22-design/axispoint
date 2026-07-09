import { NextRequest } from "next/server";
import { get } from "@vercel/blob";
import { buildCardVcard } from "@/lib/vcard";
import { getSettings, resolveEvent } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("e");
  const settings = await getSettings();
  const event = resolveEvent(settings, eventId);

  // The admin-uploaded photo lives in private Blob storage — vCard PHOTO
  // must be inline base64, not a URL (§6.3: iOS often won't fetch a URL photo
  // on import), so read it with the SDK's authenticated access (a plain
  // fetch would 403 against a private blob) and re-encode it here.
  let photoBase64Override: string | undefined;
  if (settings.photoUrl) {
    try {
      const result = await get(settings.photoUrl, { access: "private" });
      if (result?.statusCode === 200) {
        const buf = await new Response(result.stream).arrayBuffer();
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
