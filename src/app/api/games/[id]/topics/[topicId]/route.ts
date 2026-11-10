import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { deleteGameTopic, parseTopicInput, updateGameTopic } from "@/lib/board";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; topicId: string }> },
) {
  try {
    const { id, topicId } = await params;
    const user = await requireSessionUser();
    const topic = await updateGameTopic(
      id,
      topicId,
      parseTopicInput(await request.json()),
      user.id,
    );
    return NextResponse.json(topic);
  } catch (error) {
    console.error("Failed to update topic", error);
    return jsonError(error, "トピックの更新に失敗しました");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; topicId: string }> },
) {
  try {
    const { id, topicId } = await params;
    const user = await requireSessionUser();
    await deleteGameTopic(id, topicId, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete topic", error);
    return jsonError(error, "トピックの削除に失敗しました");
  }
}
