import { NextRequest } from "next/server";
import { buildCardVcard } from "@/lib/vcard";
import { getSettings, resolveEvent } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("e");
  const settings = await getSettings();
  const event = resolveEvent(settings, eventId);

  // Embedding the photo was tried and reverted: real-device testing on
  // Android showed Google Contacts mangling the base64 PHOTO field and
  // dumping the wreckage (plus the ADR field) into the contact's Notes
  // instead of saving cleanly — a broken save is far worse than a missing
  // photo. The landing page's own photo (§6.3: "the reliable visual") is
  // unaffected by this and always shows the real headshot regardless.
  const vcf = buildCardVcard(event, { includePhoto: false });

  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="garrett.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
