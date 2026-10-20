import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { toggleReviewLike } from "@/lib/likes";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireSessionUser();
    const { id } = await params;
    const result = await toggleReviewLike(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to toggle review like", error);
    return jsonError(error, "いいねに失敗しました");
  }
}
