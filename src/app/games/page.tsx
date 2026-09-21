import type { Metadata } from "next";
import { GameSearch } from "@/components/game-search/game-search";
import {
  DEFAULT_FILTERS,
  parseGacha,
  parsePlatforms,
} from "@/components/game-search/data";

export const metadata: Metadata = {
  title: "ゲームを探す | GameLog",
  description: "ハード・ジャンル・無課金の遊びやすさから、ぴったりのゲームを探せます",
};

type GamesPageProps = {
  searchParams: Promise<{
    platform?: string;
    gacha?: string;
    q?: string;
  }>;
};

export default async function GamesPage({ searchParams }: GamesPageProps) {
  const params = await searchParams;

  return (
    <GameSearch
      key={`${params.platform ?? ""}-${params.gacha ?? ""}-${params.q ?? ""}`}
      initialFilters={{
        ...DEFAULT_FILTERS,
        platforms: parsePlatforms(params.platform),
        hasGachaFilter: parseGacha(params.gacha),
      }}
      initialQuery={params.q ?? ""}
    />
  );
}
