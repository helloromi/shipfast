import { NextResponse } from "next/server";
import { fetchSceneWithRelations } from "@/lib/queries/scenes";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scene = await fetchSceneWithRelations(id);

  if (!scene) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  const lines = scene.lines.map((line) => ({
    id: line.id,
    order: line.order,
    text: line.text,
  }));

  return NextResponse.json({ lines });
}



