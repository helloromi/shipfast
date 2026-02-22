import { NextRequest, NextResponse } from "next/server";
import { grantFreeSlotAccess } from "@/lib/utils/access-control";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `free_slot:${id}`, max: 30 });
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await request.json();
    const { sceneId } = body;

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId is required" }, { status: 400 });
    }

    const success = await grantFreeSlotAccess(user.id, sceneId);

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error granting free slot access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


