import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassphrase } from "@/lib/adminAuth";
import { addEvent } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const auth = checkAdminPassphrase(body.passphrase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const label = String(body.label ?? "").trim();
  const date = String(body.date ?? "").trim();
  if (!label) {
    return NextResponse.json({ error: "Event label is required" }, { status: 400 });
  }

  try {
    const settings = await addEvent(label, date);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
