import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { createGameReview, parseReviewInput } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const review = await createGameReview(
      id,
      parseReviewInput(await request.json()),
      user.id,
    );
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return jsonError(error, "レビューの投稿に失敗しました");
  }
}
