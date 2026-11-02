import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetail } from "@/components/game-detail/game-detail";
import {
  applyGeneratedDetails,
  toGameDetail,
} from "@/components/game-detail/data";
import { ensureGameDetails } from "@/lib/game-details";
import { getSearchGameById } from "@/lib/games";
import { getSessionUser } from "@/lib/auth";
import { attachGameTopics, getGameTopics } from "@/lib/board";
import { getUserGameStatus } from "@/lib/game-status";
import { attachGameReviews, getGameReviews } from "@/lib/reviews";

type GameDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: GameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await getSearchGameById(id);
  return {
    title: game ? `${game.title} | GameLog` : "ゲーム詳細 | GameLog",
    description: game
      ? `${game.title}のレビュー・プレイ記録`
      : "ゲームの詳細情報",
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const game = await getSearchGameById(id);
  if (!game) notFound();

  const user = await getSessionUser();
  const [assembled, reviews, topics, userRecord] = await Promise.all([
    ensureGameDetails(game),
    getGameReviews(id, user?.id),
    getGameTopics(id),
    user ? getUserGameStatus(user.id, id) : Promise.resolve(null),
  ]);
  const detail = attachGameTopics(
    attachGameReviews(
      applyGeneratedDetails(toGameDetail(game), assembled),
      reviews,
    ),
    topics,
  );
  const reviewHours =
    reviews.find((item) => item.accountId === user?.id)?.playTime ?? 0;
  const playTime = Math.max(userRecord?.playTimeHours ?? 0, reviewHours);
  return (
    <GameDetail
      detail={{
        ...detail,
        userStatus: userRecord?.status ?? null,
        myRecord: {
          playTime,
        },
      }}
    />
  );
}
