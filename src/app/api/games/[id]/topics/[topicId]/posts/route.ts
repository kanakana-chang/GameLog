import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { createTopicReply, parseReplyInput } from "@/lib/board";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; topicId: string }> },
) {
  try {
    const { id, topicId } = await params;
    const user = await requireSessionUser();
    const reply = await createTopicReply(
      id,
      topicId,
      parseReplyInput(await request.json()),
      user.id,
    );
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Failed to create reply", error);
    return jsonError(error, "レスの投稿に失敗しました");
  }
}
