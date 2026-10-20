import { isUuid } from "@/lib/games";
import { prisma } from "@/lib/prisma";

export type LikeResult = {
  liked: boolean;
  count: number;
};

async function getLikedIds(
  userId: string | undefined,
  ids: string[],
  kind: "post" | "review",
): Promise<Set<string>> {
  if (!userId || ids.length === 0) return new Set();
  if (kind === "post") {
    const rows = await prisma.post_likes.findMany({
      where: { user_id: userId, post_id: { in: ids } },
      select: { post_id: true },
    });
    return new Set(rows.map((row) => row.post_id));
  }
  const rows = await prisma.review_likes.findMany({
    where: { user_id: userId, review_id: { in: ids } },
    select: { review_id: true },
  });
  return new Set(rows.map((row) => row.review_id));
}

export function getLikedPostIds(userId: string | undefined, ids: string[]) {
  return getLikedIds(userId, ids, "post");
}

export function getLikedReviewIds(userId: string | undefined, ids: string[]) {
  return getLikedIds(userId, ids, "review");
}

export async function togglePostLike(
  postId: string,
  userId: string,
): Promise<LikeResult> {
  if (!userId) throw new Error("ログインしてください");
  if (!isUuid(postId)) throw new Error("投稿が見つかりません");

  const post = await prisma.posts.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) throw new Error("投稿が見つかりません");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.post_likes.findUnique({
      where: { user_id_post_id: { user_id: userId, post_id: postId } },
    });
    if (existing) {
      await tx.post_likes.delete({
        where: { user_id_post_id: { user_id: userId, post_id: postId } },
      });
    } else {
      await tx.post_likes.create({
        data: { user_id: userId, post_id: postId },
      });
    }
    const count = await tx.post_likes.count({ where: { post_id: postId } });
    await tx.posts.update({
      where: { id: postId },
      data: { likes_count: count },
    });
    return { liked: !existing, count };
  });
}

export async function toggleReviewLike(
  reviewId: string,
  userId: string,
): Promise<LikeResult> {
  if (!userId) throw new Error("ログインしてください");
  if (!isUuid(reviewId)) throw new Error("レビューが見つかりません");

  const review = await prisma.reviews.findUnique({
    where: { id: reviewId },
    select: { id: true },
  });
  if (!review) throw new Error("レビューが見つかりません");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.review_likes.findUnique({
      where: { user_id_review_id: { user_id: userId, review_id: reviewId } },
    });
    if (existing) {
      await tx.review_likes.delete({
        where: { user_id_review_id: { user_id: userId, review_id: reviewId } },
      });
    } else {
      await tx.review_likes.create({
        data: { user_id: userId, review_id: reviewId },
      });
    }
    const count = await tx.review_likes.count({
      where: { review_id: reviewId },
    });
    return { liked: !existing, count };
  });
}
