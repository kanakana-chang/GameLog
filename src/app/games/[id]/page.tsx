import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetail } from "@/components/game-detail/game-detail";
import { getGameDetail, getSearchGame } from "@/components/game-detail/data";
import { SEARCH_GAMES } from "@/components/game-search/data";

type GameDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SEARCH_GAMES.map((game) => ({ id: String(game.id) }));
}

export async function generateMetadata({
  params,
}: GameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = getSearchGame(id);
  return {
    title: game ? `${game.title} | GameLog` : "ゲーム詳細 | GameLog",
    description: game
      ? `${game.title}の無課金の遊びやすさ・レビュー・プレイ記録`
      : "ゲームの詳細情報",
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const detail = getGameDetail(id);
  if (!detail) notFound();
  return <GameDetail detail={detail} />;
}
