import type { Metadata } from "next";
import { GameSearch } from "@/components/game-search/game-search";
import {
  DEFAULT_FILTERS,
  SEARCH_GAMES,
  parseGacha,
  parsePlatforms,
} from "@/components/game-search/data";
import { getSearchGamesFromDb } from "@/lib/games";

export const metadata: Metadata = {
  title: "ゲームを探す | GameLog",
  description: "ハード・ジャンル・無課金の遊びやすさから、ぴったりのゲームを探せます",
};

export const dynamic = "force-dynamic";

type GamesPageProps = {
  searchParams: Promise<{
    platform?: string;
    gacha?: string;
    q?: string;
  }>;
};

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;
  let games = SEARCH_GAMES;
  try {
    const dbGames = await getSearchGamesFromDb();
    if (dbGames.length > 0) games = dbGames;
  } catch (error) {
    console.error("Failed to load games from database", error);
  }

  return (
    <GameSearch
      key={`${params.platform ?? ""}-${params.gacha ?? ""}-${params.q ?? ""}`}
      games={games}
      initialFilters={{
        ...DEFAULT_FILTERS,
        platforms: parsePlatforms(params.platform),
        hasGachaFilter: parseGacha(params.gacha),
      }}
      initialQuery={params.q ?? ""}
    />
  );
}
