import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

const PER_PAGE = 50;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, null, {
      skipCsrf: true,
      requireAdmin: true,
    });
    if (!auth.ok) return auth.response;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

    const admin = createSupabaseAdminClient();
    const { data: listData, error: listError } = await admin.auth.admin.listUsers({
      page,
      perPage: PER_PAGE,
    });

    if (listError) {
      console.error("Error listing users:", listError);
      return NextResponse.json(
        { error: "Failed to list users" },
        { status: 500 }
      );
    }

    const users = (listData?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? undefined,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? undefined,
    }));

    return NextResponse.json({
      users,
      total: listData?.total ?? users.length,
      page,
      perPage: PER_PAGE,
      hasMore: (listData?.total ?? 0) > page * PER_PAGE,
    });
  } catch (error) {
    console.error("Error in admin dashboard users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
