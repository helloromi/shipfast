import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("landing_cta_clicks").insert({});

    if (error) {
      console.error("Error recording landing CTA click:", error);
      return NextResponse.json(
        { error: "Failed to record click" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error in landing cta-click route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
