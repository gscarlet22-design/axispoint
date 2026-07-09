import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassphrase } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const auth = checkAdminPassphrase(body?.passphrase);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ ok: true });
}
