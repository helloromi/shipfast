import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { sendWelcomeEmailIfNeeded } from "@/lib/resend/automation";

export async function POST(request: NextRequest) {
  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Profil: écrit par l'utilisateur (RLS), best-effort
  try {
    await supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        email: user.email ?? null,
        auth_created_at: (user as any)?.created_at ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch {
    // ignore
  }

  // Email state: service_role (cron + dédup)
  const admin = createSupabaseAdminClient();
  try {
    await admin
      .from("user_email_state")
      .upsert({ user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  } catch {
    // ignore
  }

  // Welcome email (idempotent)
  await sendWelcomeEmailIfNeeded(user.id).catch(() => null);

  return NextResponse.json({ ok: true });
}

