import { describe, expect, it } from "vitest";
import { buildCardVcard, buildLeadVcard, foldLine } from "./vcard";
import { events } from "@/config/card";

function lineOctets(line: string): number {
  return Buffer.byteLength(line, "utf8");
}

describe("foldLine", () => {
  it("leaves short lines untouched", () => {
    expect(foldLine("FN:Garrett Scarlett")).toBe("FN:Garrett Scarlett");
  });

  it("folds long lines at 75 octets with a leading-space continuation", () => {
    const long = "PHOTO;ENCODING=b;TYPE=JPEG:" + "A".repeat(200);
    const folded = foldLine(long);
    const physicalLines = folded.split("\r\n");
    expect(physicalLines.length).toBeGreaterThan(1);
    for (const [i, line] of physicalLines.entries()) {
      expect(lineOctets(line)).toBeLessThanOrEqual(75);
      if (i > 0) expect(line.startsWith(" ")).toBe(true);
    }
    // Unfolding (strip CRLF + one leading space per continuation) recovers the original.
    const unfolded = physicalLines.map((l, i) => (i === 0 ? l : l.slice(1))).join("");
    expect(unfolded).toBe(long);
  });
});

describe("buildCardVcard", () => {
  it("uses CRLF line endings throughout", () => {
    const vcf = buildCardVcard(events.default);
    expect(vcf.includes("\r\n")).toBe(true);
    expect(vcf.includes("\n")).toBe(true); // \n only ever appears as part of \r\n
    const bareLf = vcf.replace(/\r\n/g, "");
    expect(bareLf.includes("\n")).toBe(false);
  });

  it("never emits a physical line longer than 75 octets", () => {
    const vcf = buildCardVcard(events.default);
    const lines = vcf.split("\r\n").filter((l) => l.length > 0);
    for (const line of lines) {
      expect(lineOctets(line)).toBeLessThanOrEqual(75);
    }
  });

  it("injects the event NOTE when an event is tagged", () => {
    const vcf = buildCardVcard(events["gpha-annual-meeting"]);
    expect(vcf).toContain("NOTE:Met at GPHA Annual Meeting");
  });

  it("produces a clean empty NOTE for the default (untagged) event", () => {
    const vcf = buildCardVcard(events.default);
    expect(vcf).toMatch(/NOTE:\r\n/);
  });

  it("contains exactly one TEL, EMAIL, and URL line (reachLinks + one URL only)", () => {
    const vcf = buildCardVcard(events.default);
    const unfolded = vcf.replace(/\r\n /g, "");
    expect(unfolded.match(/^TEL;/gm)?.length).toBe(1);
    expect(unfolded.match(/^EMAIL;/gm)?.length).toBe(1);
    expect(unfolded.match(/^URL:/gm)?.length).toBe(1);
  });

  it("omits PHOTO when includePhoto is false", () => {
    const vcf = buildCardVcard(events.default, { includePhoto: false });
    expect(vcf).not.toContain("PHOTO;");
  });

  it("starts and ends with the vCard envelope", () => {
    const vcf = buildCardVcard(events.default);
    expect(vcf.startsWith("BEGIN:VCARD\r\n")).toBe(true);
    expect(vcf.trimEnd().endsWith("END:VCARD")).toBe(true);
  });
});

describe("buildLeadVcard", () => {
  it("builds a minimal vCard from submitted lead fields", () => {
    const vcf = buildLeadVcard({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+15551234567",
      company: "Acme Inc",
      note: "Met at GPHA Annual Meeting",
    });
    expect(vcf).toContain("FN:Jane Doe");
    expect(vcf).toContain("EMAIL;TYPE=WORK:jane@example.com");
    expect(vcf).toContain("TEL;TYPE=CELL:+15551234567");
    expect(vcf).toContain("ORG:Acme Inc");
    expect(vcf).toContain("NOTE:Met at GPHA Annual Meeting");
    expect(vcf.includes("\r\n")).toBe(true);
  });

  it("omits optional fields that weren't submitted", () => {
    const vcf = buildLeadVcard({ name: "Jane Doe" });
    expect(vcf).not.toContain("ORG:");
    expect(vcf).not.toContain("TEL;");
    expect(vcf).not.toContain("EMAIL;");
    expect(vcf).not.toContain("NOTE:");
  });

  it("escapes vCard special characters in values", () => {
    const vcf = buildLeadVcard({ name: "Doe, Jane; Q", company: "A, B; C" });
    expect(vcf).toContain("FN:Doe\\, Jane\\; Q");
    expect(vcf).toContain("ORG:A\\, B\\; C");
  });
});
