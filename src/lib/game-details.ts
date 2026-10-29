import type { SearchGame } from "@/components/game-search/data";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  cleanWikiExtract,
  fetchPublicGameInfo,
  takeSentences,
  type PublicGameInfo,
  type PublicSource,
} from "@/lib/public-game-info";

export type GeneratedGameDetails = {
  summary: string;
  priceLabel: string;
  ageRating: string;
  releaseDate: string;
  monetizationType: string;
  monthly: string;
  ceiling: string;
  f2pScore: number;
  volumeScore: number;
  graphicScore: number;
  controlScore: number;
  storyScore: number;
  kinkaScore: number;
  avgPlayTime: number;
  avgScore: number;
  tags: string[];
  platforms: string[];
  sources: PublicSource[];
  assembledFromPublic: boolean;
  assemblyVersion: number;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asSources(value: unknown): PublicSource[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = asString(record.title, "");
    const url = asString(record.url, "");
    return title && url ? [{ title, url }] : [];
  });
}

function detectGacha(game: SearchGame, extract: string) {
  if (/ガチャあり/.test(extract)) return true;
  if (/ガチャ非搭載|ガチャなし|ガチャは搭載されていない/.test(extract)) {
    return false;
  }
  return game.hasGacha || /ガチャ/.test(extract);
}

function detectFree(game: SearchGame, extract: string) {
  return (
    game.isFree ||
    /基本プレイ無料|基本無料|無料配信/.test(extract)
  );
}

function releaseDateFromPublic(game: SearchGame, extract: string) {
  const match = extract.match(/(20\d{2})年(\d{1,2})月(\d{1,2})日/);
  if (match) return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
  return `${game.releaseYear}年`;
}

function ageRatingFromPublic(extract: string) {
  const match = extract.match(/CERO\s*([A-Z])/i);
  if (match) return `CERO ${match[1].toUpperCase()}`;
  return "情報なし";
}

function platformsFromPublic(game: SearchGame, extract: string) {
  if (game.platforms.length) return game.platforms.map(String);
  const found: string[] = [];
  if (/Switch\s*2|Nintendo Switch 2/i.test(extract)) found.push("Switch2");
  else if (/Nintendo Switch|Switch/.test(extract)) found.push("Switch");
  if (/\biOS\b/.test(extract)) found.push("iOS");
  if (/Android/.test(extract)) found.push("Android");
  if (/\bPS5\b|PlayStation 5/.test(extract)) found.push("PS5");
  if (/\bPC\b|Steam/.test(extract)) found.push("PC");
  return found;
}

function tagsFromPublic(extract: string, game: SearchGame) {
  const tags = [
    /スピンオフ/.test(extract) ? "スピンオフ" : "",
    /協力|マルチ/.test(extract) ? "協力プレイ" : "",
    /探索|ダンジョン/.test(extract) ? "探索" : "",
    /ガチャ/.test(extract) && !/ガチャ非搭載/.test(extract) ? "ガチャ" : "",
    /ひっぱり|引っ張/.test(extract) ? "ひっぱり" : "",
    game.genre,
  ].filter(Boolean);
  return [...new Set(tags)].slice(0, 6);
}

function scoresFromPublicFacts(game: SearchGame, extract: string) {
  const free = detectFree(game, extract);
  const gacha = detectGacha(game, extract);
  const storyLight = /ストーリーやプレイヤーキャラクターなどは持たず/.test(extract);
  const nintendo = /任天堂|Nintendo/.test(`${game.developer}${extract}`);

  if (gacha) {
    return {
      f2pScore: 38,
      volumeScore: 92,
      graphicScore: nintendo ? 80 : 72,
      controlScore: 84,
      storyScore: storyLight ? 42 : 52,
      kinkaScore: 32,
      avgPlayTime: 320,
      avgScore: 7.6,
    };
  }

  if (free) {
    return {
      f2pScore: 72,
      volumeScore: 70,
      graphicScore: 74,
      controlScore: 78,
      storyScore: 55,
      kinkaScore: 68,
      avgPlayTime: 80,
      avgScore: 7.4,
    };
  }

  return {
    f2pScore: 90,
    volumeScore: /ダンジョン|協力/.test(extract) ? 82 : 74,
    graphicScore: nintendo ? 88 : 76,
    controlScore: 86,
    storyScore: 74,
    kinkaScore: 94,
    avgPlayTime: 30,
    avgScore: 8.2,
  };
}

function summaryFromPublic(game: SearchGame, publicInfo: PublicGameInfo | null) {
  if (publicInfo) {
    const cleaned = takeSentences(cleanWikiExtract(publicInfo.extract), 5);
    if (cleaned.length >= 40) return cleaned;
  }
  const kind = game.isFree ? "基本無料のゲーム" : "ゲーム";
  return `『${game.title}』は${game.developer}が${game.releaseYear}年に公開した${game.genre}の${kind}です。対応プラットフォームは${game.platforms.join("、") || "情報なし"}です。`;
}

function assembleFromPublic(
  game: SearchGame,
  publicInfo: PublicGameInfo | null,
  raw?: Record<string, unknown>,
): GeneratedGameDetails {
  const extract = publicInfo?.extract ?? "";
  const scores = scoresFromPublicFacts(game, extract);
  const free = detectFree(game, extract);
  const gacha = detectGacha(game, extract);

  return {
    summary: asString(raw?.summary, summaryFromPublic(game, publicInfo)),
    priceLabel: asString(raw?.priceLabel, free ? "基本無料" : "買い切り"),
    ageRating: asString(raw?.ageRating, ageRatingFromPublic(extract)),
    releaseDate: asString(
      raw?.releaseDate,
      releaseDateFromPublic(game, extract),
    ),
    monetizationType: asString(
      raw?.monetizationType,
      gacha
        ? "基本無料 + ガチャ・アイテム課金"
        : free
          ? "基本無料 + アイテム課金"
          : "買い切り",
    ),
    monthly: asString(raw?.monthly, "なし"),
    ceiling: asString(
      raw?.ceiling,
      gacha ? "ガチャあり" : "天井なし（ガチャ非搭載）",
    ),
    f2pScore: clamp(Number(raw?.f2pScore ?? scores.f2pScore), 0, 100),
    volumeScore: clamp(Number(raw?.volumeScore ?? scores.volumeScore), 0, 100),
    graphicScore: clamp(
      Number(raw?.graphicScore ?? scores.graphicScore),
      0,
      100,
    ),
    controlScore: clamp(
      Number(raw?.controlScore ?? scores.controlScore),
      0,
      100,
    ),
    storyScore: clamp(Number(raw?.storyScore ?? scores.storyScore), 0, 100),
    kinkaScore: clamp(Number(raw?.kinkaScore ?? scores.kinkaScore), 0, 100),
    avgPlayTime: clamp(Number(raw?.avgPlayTime ?? scores.avgPlayTime), 0, 5000),
    avgScore: clamp(Number(raw?.avgScore ?? scores.avgScore), 0, 10),
    tags: asStringList(raw?.tags).length
      ? asStringList(raw?.tags).slice(0, 6)
      : tagsFromPublic(extract, game),
    platforms: asStringList(raw?.platforms).length
      ? asStringList(raw?.platforms)
      : platformsFromPublic(game, extract),
    sources: publicInfo?.sources ?? [],
    assembledFromPublic: true,
    assemblyVersion: 2,
  };
}

export function isGeneratedGameDetails(
  value: unknown,
): value is GeneratedGameDetails {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.summary === "string" && typeof record.priceLabel === "string";
}

export function isAssembledPublicDetails(
  value: unknown,
): value is GeneratedGameDetails {
  return (
    isGeneratedGameDetails(value) &&
    value.assembledFromPublic === true &&
    (value.assemblyVersion ?? 0) >= 2
  );
}

async function assembleDetails(
  game: SearchGame,
): Promise<{ details: GeneratedGameDetails; model: string }> {
  const publicInfo = await fetchPublicGameInfo(game);
  return {
    details: assembleFromPublic(game, publicInfo),
    model: publicInfo ? "wikipedia-public-sources" : "registered-public-facts",
  };
}

function normalizeStored(value: GeneratedGameDetails): GeneratedGameDetails {
  return {
    ...value,
    sources: asSources(value.sources),
    assembledFromPublic: value.assembledFromPublic === true,
    assemblyVersion: Number(value.assemblyVersion) || 0,
  };
}

export const getStoredGameDetails = cache(async (gameId: string) => {
  if (!UUID_RE.test(gameId)) return null;
  const row = await prisma.game_details.findUnique({
    where: { game_id: gameId },
  });
  if (!row || !isGeneratedGameDetails(row.payload)) return null;
  return normalizeStored(row.payload);
});

async function saveDetails(
  gameId: string,
  details: GeneratedGameDetails,
  model: string,
) {
  await prisma.game_details.upsert({
    where: { game_id: gameId },
    create: {
      game_id: gameId,
      payload: details,
      model,
    },
    update: {
      payload: details,
      model,
      generated_at: new Date(),
    },
  });
}

export async function ensureGameDetails(
  game: SearchGame,
): Promise<GeneratedGameDetails> {
  const id = String(game.id);
  const stored = await getStoredGameDetails(id);
  if (stored) return stored;

  const assembled = await assembleDetails(game);
  if (UUID_RE.test(id)) {
    await saveDetails(id, assembled.details, assembled.model);
  }
  return assembled.details;
}

export function applyDetailsToSearchGame(
  game: SearchGame,
  details: GeneratedGameDetails | null,
): SearchGame {
  if (!details) return game;
  return {
    ...game,
    f2pScore: Math.max(1, Math.round(details.f2pScore / 20)),
    volumeScore: Math.max(1, Math.round(details.volumeScore / 20)),
    platforms: game.platforms,
    tags: details.tags.length ? details.tags : game.tags,
    isFree: details.priceLabel.includes("無料") || game.isFree,
    hasGacha:
      /ガチャあり/.test(`${details.ceiling}${details.monetizationType}`) ||
      details.tags.includes("ガチャ"),
  };
}
