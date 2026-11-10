import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import {
  deleteGameReview,
  getReviewForEdit,
  parseReviewInput,
  updateGameReview,
} from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const review = await getReviewForEdit(id, user.id);
    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to load review", error);
    return jsonError(error, "レビューの取得に失敗しました");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    const review = await updateGameReview(
      id,
      parseReviewInput(await request.json()),
      user.id,
    );
    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to update review", error);
    return jsonError(error, "レビューの更新に失敗しました");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    await deleteGameReview(id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete review", error);
    return jsonError(error, "レビューの削除に失敗しました");
  }
}
