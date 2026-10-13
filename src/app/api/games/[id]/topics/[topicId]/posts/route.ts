import { NextResponse } from "next/server";
import { createTopicReply, parseReplyInput } from "@/lib/board";
import { jsonError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; topicId: string }> },
) {
  try {
    const { id, topicId } = await params;
    const reply = await createTopicReply(
      id,
      topicId,
      parseReplyInput(await request.json()),
    );
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Failed to create reply", error);
    return jsonError(error, "レスの投稿に失敗しました");
  }
}
