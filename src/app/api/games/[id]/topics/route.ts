import { NextResponse } from "next/server";
import { createGameTopic, parseTopicInput } from "@/lib/board";
import { jsonError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const topic = await createGameTopic(id, parseTopicInput(await request.json()));
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Failed to create topic", error);
    return jsonError(error, "トピックの投稿に失敗しました");
  }
}
