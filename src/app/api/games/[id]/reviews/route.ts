import { NextResponse } from "next/server";
import { createGameReview, parseReviewInput } from "@/lib/reviews";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("見つかりません")
    ? 404
    : message.includes("選択") ||
        message.includes("入力") ||
        message.includes("正しく")
      ? 400
      : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const review = await createGameReview(
      id,
      parseReviewInput(await request.json()),
    );
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return errorResponse(error, "レビューの投稿に失敗しました");
  }
}
