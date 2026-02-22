import { NextRequest, NextResponse } from "next/server";

import { setAudienceUnsubscribedFromMarketing, syncAudienceContactIfOptIn } from "@/lib/resend/automation";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, null);
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const body = await request.json().catch(() => ({} as unknown));
  const action =
    typeof (body as any)?.action === "string" ? String((body as any).action) : "subscribe";

  if (action === "unsubscribe") {
    const res = await setAudienceUnsubscribedFromMarketing({ userId: user.id, unsubscribed: true });
    return NextResponse.json(res);
  }

  // Default: subscribe/sync if opt-in
  const res = await syncAudienceContactIfOptIn(user.id);
  return NextResponse.json(res);
}

