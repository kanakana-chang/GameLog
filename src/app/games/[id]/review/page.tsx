import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGameDetail, getSearchGame } from "@/components/game-detail/data";
import { ReviewForm } from "@/components/review-form/review-form";
import { SEARCH_GAMES } from "@/components/game-search/data";
import { getSearchGameById } from "@/lib/games";

type ReviewPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return SEARCH_GAMES.map((game) => ({ id: String(game.id) }));
}

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = getSearchGame(id) ?? (await getSearchGameById(id));
  return {
    title: game ? `レビューを書く | ${game.title}` : "レビューを書く | GameLog",
    description: game
      ? `${game.title}のレビューを投稿する`
      : "ゲームのレビューを投稿する",
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const detail = getGameDetail(id);
  if (detail) {
    return (
      <ReviewForm
        game={{
          id: detail.id,
          title: detail.title,
          jacket: detail.jacket,
          platforms: detail.platforms,
          genre: detail.genre,
        }}
      />
    );
  }

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
    />
  );
}
