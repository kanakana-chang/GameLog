import type { AdminGame } from "@/components/admin-dashboard/data";
import {
  applyDetailsToSearchGame,
  ensureGameDetails,
  isAssembledPublicDetails,
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

function coverImage(url: string) {
  const value = url.trim();
  if (!value) return "/games/gaming-alt.jpg";
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const parsed = new URL(value);
    if (parsed.hostname.includes("google.") && parsed.pathname === "/imgres") {
      const actual = parsed.searchParams.get("imgurl");
      if (actual) return actual;
    }
    return value;
  } catch {
    return "/games/gaming-alt.jpg";
  }
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
    img: coverImage(game.cover_image_url),
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
      const stored = detailsFromRow(row);
      if (isAssembledPublicDetails(stored)) return game;
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

export type AdminGameInput = {
  title: string;
  developer: string;
  genre: string;
  releaseYear: number;
  platform: string[];
  freeToPlay: boolean;
  hasCurrency: boolean;
  coverUrl: string;
};

export function parseAdminGameInput(body: unknown): AdminGameInput {
  if (!body || typeof body !== "object") {
    throw new Error("送信内容が正しくありません");
  }
  const record = body as Record<string, unknown>;
  return {
    title: typeof record.title === "string" ? record.title : "",
    developer: typeof record.developer === "string" ? record.developer : "",
    genre: typeof record.genre === "string" ? record.genre : "",
    releaseYear: Number(record.releaseYear),
    platform: Array.isArray(record.platform)
      ? record.platform.filter((item): item is string => typeof item === "string")
      : [],
    freeToPlay: record.freeToPlay === true,
    hasCurrency: record.hasCurrency === true,
    coverUrl: typeof record.coverUrl === "string" ? record.coverUrl : "",
  };
}

function assertGameId(id: string) {
  if (!UUID_RE.test(id)) {
    throw new Error("ゲームが見つかりません");
  }
}

function isPrismaNotFound(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2025"
  );
}

type NormalizedAdminGame = {
  title: string;
  developer: string;
  genre: string;
  platforms: string[];
  releaseYear: number;
  coverUrl: string;
};

function normalizeAdminGameInput(input: AdminGameInput): NormalizedAdminGame {
  const title = input.title.trim();
  const developer = input.developer.trim();
  const genre = input.genre.trim();
  const platforms = [
    ...new Set(input.platform.map((item) => item.trim()).filter(Boolean)),
  ];

  if (!title) throw new Error("ゲームタイトルを入力してください");
  if (!developer) throw new Error("デベロッパーを入力してください");
  if (!genre) throw new Error("ジャンルを選択してください");
  if (
    !Number.isInteger(input.releaseYear) ||
    input.releaseYear < 1990 ||
    input.releaseYear > 2035
  ) {
    throw new Error("発売年が正しくありません");
  }
  if (platforms.length === 0) {
    throw new Error("対応プラットフォームを1つ以上選んでください");
  }

  return {
    title,
    developer,
    genre,
    platforms,
    releaseYear: input.releaseYear,
    coverUrl: input.coverUrl.trim() || "/games/gaming-alt.jpg",
  };
}

const PLATFORM_DEFS: Record<
  string,
  { name: string; slug: string; category: string }
> = {
  Switch: { name: "Nintendo Switch", slug: "switch", category: "console" },
  Switch2: { name: "Nintendo Switch 2", slug: "Switch2", category: "console" },
  iOS: { name: "iOS", slug: "ios", category: "mobile" },
  Android: { name: "Android", slug: "android", category: "mobile" },
  Steam: { name: "Steam", slug: "steam", category: "pc" },
  PC: { name: "PC", slug: "pc", category: "pc" },
  PS5: { name: "PlayStation 5", slug: "ps5", category: "console" },
  Xbox: { name: "Xbox", slug: "xbox", category: "console" },
};

function toAdminGame(game: GameWithPlatforms): AdminGame {
  const platforms = game.game_platform.map((row) =>
    mapPlatform(row.platforms.name, row.platforms.slug),
  );
  const details = detailsFromRow(game);
  const isFree = details
    ? details.priceLabel.includes("無料")
    : game.game_type === "f2p" ||
      game.game_type === "free" ||
      game.game_type === "gacha" ||
      game.game_type === "mobile";
  const hasGacha = details
    ? /ガチャあり/.test(`${details.ceiling}${details.monetizationType}`) ||
      details.tags.includes("ガチャ")
    : game.game_type === "gacha" || game.genre.includes("ガチャ");

  return {
    id: game.id,
    title: game.title,
    platform: platforms,
    genre: game.genre,
    releaseYear: Number(game.release_year),
    developer: game.publisher,
    freeToPlay: isFree,
    hasCurrency: hasGacha || isFree,
    avgPlaytime: details?.avgPlayTime ?? 0,
    coverUrl: coverImage(game.cover_image_url),
    status: "active",
    addedAt: game.created_at.toISOString().slice(0, 10),
  };
}

function gameTypeFromInput(input: AdminGameInput) {
  if (input.freeToPlay && input.hasCurrency) return "gacha";
  if (input.freeToPlay) return "f2p";
  if (input.platform.some((item) => /iOS|Android/i.test(item))) return "mobile";
  if (input.platform.some((item) => /Switch|PS5|Xbox/i.test(item))) {
    return "console";
  }
  if (input.platform.some((item) => /Steam|PC/i.test(item))) return "pc";
  return "paid";
}

async function resolvePlatformIds(labels: string[]) {
  const existing = await prisma.platforms.findMany();
  const ids: string[] = [];

  for (const label of labels) {
    const def = PLATFORM_DEFS[label] ?? {
      name: label,
      slug: label.toLowerCase().replace(/\s+/g, "-"),
      category: "other",
    };
    const found = existing.find((row) => {
      const mapped = mapPlatform(row.name, row.slug);
      return (
        mapped === label ||
        row.slug.toLowerCase() === def.slug.toLowerCase() ||
        row.name === def.name ||
        row.name === label
      );
    });
    if (found) {
      ids.push(found.id);
      continue;
    }

    const created = await prisma.platforms.create({
      data: {
        name: def.name,
        slug: def.slug,
        category: def.category,
      },
    });
    existing.push(created);
    ids.push(created.id);
  }

  return [...new Set(ids)];
}

export async function getAdminGamesFromDb(): Promise<AdminGame[]> {
  const games = await prisma.games.findMany({
    include: gameWithPlatforms,
    orderBy: { created_at: "desc" },
  });

  return games.map(toAdminGame);
}

function gameWriteData(input: AdminGameInput, normalized: NormalizedAdminGame) {
  return {
    title: normalized.title,
    publisher: normalized.developer,
    release_year: BigInt(normalized.releaseYear),
    genre: normalized.genre,
    cover_image_url: normalized.coverUrl,
    game_type: gameTypeFromInput({ ...input, platform: normalized.platforms }),
  };
}

export async function createAdminGame(input: AdminGameInput): Promise<AdminGame> {
  const normalized = normalizeAdminGameInput(input);
  const platformIds = await resolvePlatformIds(normalized.platforms);
  const created = await prisma.games.create({
    data: {
      ...gameWriteData(input, normalized),
      game_platform: {
        create: platformIds.map((platform_id) => ({ platform_id })),
      },
    },
    include: gameWithPlatforms,
  });

  return toAdminGame(created);
}

export async function updateAdminGame(
  id: string,
  input: AdminGameInput,
): Promise<AdminGame> {
  assertGameId(id);
  const normalized = normalizeAdminGameInput(input);
  const existing = await prisma.games.findUnique({ where: { id } });
  if (!existing) throw new Error("ゲームが見つかりません");

  const platformIds = await resolvePlatformIds(normalized.platforms);
  const updated = await prisma.games.update({
    where: { id },
    data: {
      ...gameWriteData(input, normalized),
      game_platform: {
        deleteMany: {},
        create: platformIds.map((platform_id) => ({ platform_id })),
      },
    },
    include: gameWithPlatforms,
  });

  return toAdminGame(updated);
}

export async function deleteAdminGame(id: string): Promise<void> {
  assertGameId(id);
  try {
    await prisma.games.delete({ where: { id } });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      throw new Error("ゲームが見つかりません");
    }
    throw error;
  }
}
