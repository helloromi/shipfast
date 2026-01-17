import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { syncAudienceContactIfOptIn } from "@/lib/resend/automation";
import { assertSameOrigin } from "@/lib/utils/csrf";

export async function POST(request: NextRequest) {
  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await syncAudienceContactIfOptIn(user.id);
  return NextResponse.json(res);
}

