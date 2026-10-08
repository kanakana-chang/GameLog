import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetail } from "@/components/game-detail/game-detail";
import {
  applyGeneratedDetails,
  getGameDetail,
  getGameDetailFromSearch,
  getSearchGame,
} from "@/components/game-detail/data";
import { SEARCH_GAMES } from "@/components/game-search/data";
import { ensureGameDetails } from "@/lib/game-details";
import { getSearchGameById } from "@/lib/games";

type GameDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return SEARCH_GAMES.map((game) => ({ id: String(game.id) }));
}

export async function generateMetadata({
  params,
}: GameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const game = getSearchGame(id) ?? (await getSearchGameById(id));
  return {
    title: game ? `${game.title} | GameLog` : "ゲーム詳細 | GameLog",
    description: game
      ? `${game.title}の無課金の遊びやすさ・レビュー・プレイ記録`
      : "ゲームの詳細情報",
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { id } = await params;
  const mockDetail = getGameDetail(id);
  if (mockDetail) return <GameDetail detail={mockDetail} />;

  const game = await getSearchGameById(id);
  if (!game) notFound();

  const assembled = await ensureGameDetails(game);
  const detail = applyGeneratedDetails(
    getGameDetailFromSearch(game, { syntheticSocial: false }),
    assembled,
  );
  return <GameDetail detail={detail} />;
}
