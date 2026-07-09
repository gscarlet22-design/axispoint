import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassphrase } from "@/lib/adminAuth";
import { setCurrentEvent } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const auth = checkAdminPassphrase(body.passphrase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = body.id === null ? null : String(body.id ?? "").trim() || null;

  try {
    const settings = await setCurrentEvent(id);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
