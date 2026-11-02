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
  sources: PublicSource[];
  assembledFromPublic: boolean;
  assemblyVersion: number;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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
): GeneratedGameDetails {
  return {
    summary: summaryFromPublic(game, publicInfo),
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
  return typeof record.summary === "string";
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
