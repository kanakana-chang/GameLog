import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import {
  deleteTopicReply,
  parseReplyInput,
  updateTopicReply,
} from "@/lib/board";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const reply = await updateTopicReply(
      id,
      parseReplyInput(await request.json()),
      user.id,
    );
    return NextResponse.json(reply);
  } catch (error) {
    console.error("Failed to update reply", error);
    return jsonError(error, "レスの更新に失敗しました");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const result = await deleteTopicReply(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete reply", error);
    return jsonError(error, "レスの削除に失敗しました");
  }
}
