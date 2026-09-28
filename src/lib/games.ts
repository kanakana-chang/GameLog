import {
  applyDetailsToSearchGame,
  ensureGameDetails,
  isGeneratedGameDetails,
  type GeneratedGameDetails,
} from "@/lib/game-details";
import {
  GENRES,
  PLATFORMS,
  type Genre,
  type Platform,
  type SearchGame,
} from "@/components/game-search/data";
import { prisma } from "@/lib/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const GENRE_ALIASES: Record<string, Genre> = {
  シューティング: "シューター",
  アクションRPG: "アドベンチャー",
  RPG: "アドベンチャー",
};

const gameWithPlatforms = {
  game_platform: {
    include: { platforms: true },
  },
  game_details: true,
} as const;

type GameWithPlatforms = Awaited<
  ReturnType<typeof prisma.games.findMany<{ include: typeof gameWithPlatforms }>>
>[number];

function mapGenre(value: string): Genre {
  if ((GENRES as readonly string[]).includes(value)) {
    return value as Genre;
  }
  return GENRE_ALIASES[value] ?? "アクション";
}

function mapPlatform(name: string, slug: string): Platform | string {
  if ((PLATFORMS as readonly string[]).includes(slug)) return slug as Platform;
  if ((PLATFORMS as readonly string[]).includes(name)) return name as Platform;
  if (slug.toLowerCase().includes("switch2") || name.includes("Switch2")) {
    return "Switch2";
  }
  if (slug.toLowerCase().includes("switch") || name.includes("Switch")) {
    return "Switch";
  }
  return name;
}

function coverImage(title: string, url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\//.test(url) && !url.includes("google.com/imgres")) {
    return url;
  }
  if (title.includes("スプラトゥーン")) return "/games/splatoon3.jpg";
  return "/games/gaming-alt.jpg";
}

function detailsFromRow(
  game: GameWithPlatforms,
): GeneratedGameDetails | null {
  return isGeneratedGameDetails(game.game_details?.payload)
    ? game.game_details.payload
    : null;
}

function toSearchGame(game: GameWithPlatforms): SearchGame {
  const platforms = game.game_platform.map((row) =>
    mapPlatform(row.platforms.name, row.platforms.slug),
  );
  const genre = mapGenre(game.genre);
  const isFree = game.game_type === "f2p" || game.game_type === "free";
  const hasGacha = game.game_type === "gacha" || game.genre.includes("ガチャ");

  const base: SearchGame = {
    id: game.id,
    title: game.title,
    developer: game.publisher,
    genre,
    platforms,
    rating: 0,
    ratingCount: 0,
    avgPlaytime: 0,
    releaseYear: Number(game.release_year),
    price: 0,
    isFree,
    hasGacha,
    f2pScore: isFree ? 4 : 3,
    volumeScore: 3,
    img: coverImage(game.title, game.cover_image_url),
    tags: [genre, game.game_type].filter(Boolean),
    popular: false,
  };

  return applyDetailsToSearchGame(base, detailsFromRow(game));
}

export async function getSearchGamesFromDb(): Promise<SearchGame[]> {
  const games = await prisma.games.findMany({
    include: gameWithPlatforms,
    orderBy: { created_at: "desc" },
  });

  return Promise.all(
    games.map(async (row) => {
      const game = toSearchGame(row);
      if (detailsFromRow(row)) return game;
      const generated = await ensureGameDetails(game);
      return applyDetailsToSearchGame(game, generated);
    }),
  );
}

export async function getSearchGameById(id: string): Promise<SearchGame | undefined> {
  if (!UUID_RE.test(id)) return undefined;

  const game = await prisma.games.findUnique({
    where: { id },
    include: gameWithPlatforms,
  });

  return game ? toSearchGame(game) : undefined;
}
