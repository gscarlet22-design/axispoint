import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { card } from "@/config/card";
import { buildLeadVcard } from "@/lib/vcard";

// SMTP needs a raw socket — Edge can't open one (§10.2).
export const runtime = "nodejs";

interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  note?: string;
  eventId?: string;
  // Honeypot — real users never see or fill this field (§10.1).
  website?: string;
}

export async function POST(request: NextRequest) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const company = body.company?.trim();
  const note = body.note?.trim();

  if (body.website) {
    // Honeypot tripped — respond as if successful, send nothing (§10.1).
    return NextResponse.json({ ok: true });
  }

  if (!name || (!email && !phone)) {
    return NextResponse.json(
      { error: "Name and at least one of email or phone are required" },
      { status: 400 },
    );
  }

  const leadVcf = buildLeadVcard({ name, email, phone, company, note });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const leadToEmail = process.env.LEAD_TO_EMAIL ?? card.email;

  if (!gmailUser || !gmailPassword) {
    console.warn("GMAIL_USER/GMAIL_APP_PASSWORD not configured — skipping lead email send.");
    return NextResponse.json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPassword },
  });

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: leadToEmail,
      subject: `New contact: ${name} (${body.eventId || "no event"})`,
      text: `${name}\n${email ?? ""}\n${phone ?? ""}\n${company ?? ""}\n${note ?? ""}`,
      attachments: [{ filename: "lead.vcf", content: leadVcf, contentType: "text/vcard" }],
    });
  } catch (error) {
    console.error("Failed to send lead email", error);
    // Per §10.2/§10.4: a failed send is a known, accepted gap — still respond
    // success so a mail-relay hiccup never surfaces as an error to the visitor.
  }

  return NextResponse.json({ ok: true });
}
