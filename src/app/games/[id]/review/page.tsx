import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form/review-form";
import { getSearchGameById, UUID_RE } from "@/lib/games";

type ReviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await getSearchGameById(id);
  return {
    title: game ? `レビューを書く | ${game.title}` : "レビューを書く | GameLog",
    description: game
      ? `${game.title}のレビューを投稿する`
      : "ゲームのレビューを投稿する",
  };
}

export default async function ReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const { id } = await params;
  const { edit } = await searchParams;
  const game = await getSearchGameById(id);
  if (!game) notFound();

  return (
    <ReviewForm
      game={{
        id: game.id,
        title: game.title,
        jacket: game.img,
        platforms: game.platforms,
        genre: [game.genre],
      }}
      editReviewId={edit && UUID_RE.test(edit) ? edit : undefined}
    />
  );
}
