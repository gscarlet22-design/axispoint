// vCard 3.0 generation — shared by /api/vcard, the Present-mode offline QR,
// and /api/lead (§6, §8B, §10.2). Three silent-failure traps to never skip
// (§6.3): CRLF line endings, folding lines > 75 octets, and base64 (not URL)
// photos.

import { card } from "@/config/card";
import type { EventEntry } from "@/lib/settings";

/** Escape vCard 3.0 special characters in a field value (RFC 2426 §5.8.4). */
function escapeVcardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Fold a single unfolded line at 75 octets, continuation lines prefixed with
 * a single space (RFC 2426 §5.8.1). Verbatim from spec §6.3 — every field
 * here is ASCII (names/base64/etc.), so counting `.length` is equivalent to
 * counting octets.
 */
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    out.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return out.join("\r\n");
}

/** Fold + CRLF-join raw (unfolded) vCard lines into the final .vcf text. */
function vcardLines(lines: string[]): string {
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/**
 * Build the primary vCard for Garrett Scarlett, from `src/config/card.ts`.
 * Used by `/api/vcard` (with photo) and the Present-mode offline QR (no
 * photo — a base64 photo won't fit a scannable QR, per §8B).
 */
export function buildCardVcard(
  event: EventEntry,
  options?: { includePhoto?: boolean; photoBase64Override?: string },
): string {
  const includePhoto = options?.includePhoto ?? true;
  const photoBase64 = options?.photoBase64Override ?? card.photoBase64;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcardValue(card.last)};${escapeVcardValue(card.first)};;;`,
    `FN:${escapeVcardValue(card.fullName)}`,
    `ORG:${escapeVcardValue(card.org)}`,
    `TITLE:${escapeVcardValue(card.title)}`,
    `TEL;TYPE=CELL:${card.phone}`,
    `EMAIL;TYPE=WORK:${card.email}`,
    `URL:${card.url}`,
    // ADR components: POBox;ExtendedAddress;Street;Locality;Region;PostalCode;Country
    `ADR;TYPE=WORK:;${escapeVcardValue(card.mailingAddress.suite)};${escapeVcardValue(
      card.mailingAddress.street,
    )};${escapeVcardValue(card.mailingAddress.city)};${escapeVcardValue(
      card.mailingAddress.state,
    )};${escapeVcardValue(card.mailingAddress.postalCode)};${escapeVcardValue(
      card.mailingAddress.country,
    )}`,
  ];

  if (includePhoto && photoBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`);
  }

  lines.push(`NOTE:${escapeVcardValue(event.note)}`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return vcardLines(lines);
}

export interface LeadInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  note?: string;
}

/**
 * Build a minimal vCard from a `/connect` reciprocal-capture submission
 * (§10.2) — same fold/CRLF primitives as `buildCardVcard`, different input
 * source. The submitted name isn't split into first/last, so it's placed
 * whole in both N and FN.
 */
export function buildLeadVcard(input: LeadInput): string {
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${escapeVcardValue(input.name)};;;;`, `FN:${escapeVcardValue(input.name)}`];

  if (input.company) lines.push(`ORG:${escapeVcardValue(input.company)}`);
  if (input.phone) lines.push(`TEL;TYPE=CELL:${input.phone}`);
  if (input.email) lines.push(`EMAIL;TYPE=WORK:${input.email}`);
  if (input.note) lines.push(`NOTE:${escapeVcardValue(input.note)}`);
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return vcardLines(lines);
}
