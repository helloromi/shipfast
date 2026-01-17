import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { setAudienceUnsubscribedFromMarketing, syncAudienceContactIfOptIn } from "@/lib/resend/automation";
import { assertSameOrigin } from "@/lib/utils/csrf";

export async function POST(request: NextRequest) {
  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

