import type { SearchGame } from "@/components/game-search/data";
import { GameTop } from "@/components/game-top/game-top";
import { getLatestGames } from "@/lib/games";

export const dynamic = "force-dynamic";

export default async function Home() {
  let latestGames: SearchGame[] = [];
  try {
    latestGames = await getLatestGames(10);
  } catch (error) {
    console.error("Failed to load latest games", error);
  }

  return <GameTop latestGames={latestGames} />;
}
