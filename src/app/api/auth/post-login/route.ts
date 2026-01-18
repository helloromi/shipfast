import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { sendWelcomeEmailIfNeeded } from "@/lib/resend/automation";

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Preferred: cookie-based auth via auth-helpers
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser();

    // Fallback: Bearer token (helps right after OAuth/magic-link exchange, before cookies propagate)
    let user = cookieUser ?? null;
    if (!user) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
      if (token) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !anonKey) {
          throw new Error(
            "Supabase env vars manquants. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY."
          );
        }

        const anon = createClient(url, anonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data, error } = await anon.auth.getUser(token);
        if (!error) user = data.user ?? null;
      }
    }

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

    // Welcome email (idempotent) — return result for easy debugging
    const welcome = await sendWelcomeEmailIfNeeded(user.id);
    if (!welcome.sent) {
      console.warn("Welcome email not sent:", { userId: user.id, ...welcome });
    }

    return NextResponse.json({ ok: true, welcome });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in post-login:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

