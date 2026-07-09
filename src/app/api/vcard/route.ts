import { NextRequest } from "next/server";
import { resolveEvent } from "@/config/card";
import { buildCardVcard } from "@/lib/vcard";

export function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("e");
  const event = resolveEvent(eventId);
  const vcf = buildCardVcard(event);

  return new Response(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="garrett.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
