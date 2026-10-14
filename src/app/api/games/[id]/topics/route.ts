import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { createGameTopic, parseTopicInput } from "@/lib/board";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const topic = await createGameTopic(
      id,
      parseTopicInput(await request.json()),
      user.id,
    );
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Failed to create topic", error);
    return jsonError(error, "トピックの投稿に失敗しました");
  }
}
