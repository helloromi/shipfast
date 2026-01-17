import { NextRequest } from "next/server";

export function assertCronAuth(request: NextRequest): { ok: true } | { ok: false; error: string } {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false, error: "CRON_SECRET is not set" };

  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return { ok: false, error: "Missing bearer token" };
  }
  const token = header.slice("bearer ".length).trim();
  if (token !== secret) return { ok: false, error: "Invalid token" };
  return { ok: true };
}

