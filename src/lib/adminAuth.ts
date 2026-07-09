export type AdminAuthResult = { ok: true } | { ok: false; status: number; error: string };

export function checkAdminPassphrase(provided: unknown): AdminAuthResult {
  const expected = process.env.ADMIN_PASSPHRASE;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "ADMIN_PASSPHRASE isn't configured on the server.",
    };
  }
  if (typeof provided !== "string" || provided !== expected) {
    return { ok: false, status: 401, error: "Incorrect passphrase." };
  }
  return { ok: true };
}
