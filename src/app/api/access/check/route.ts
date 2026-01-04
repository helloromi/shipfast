import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkAccess } from "@/lib/utils/access-control";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          hasAccess: false,
          accessType: "none",
          canUseFreeSlot: false,
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { sceneId, workId } = body;

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId is required" }, { status: 400 });
    }

    const result = await checkAccess(user, sceneId, workId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

