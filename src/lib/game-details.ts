import type { SearchGame } from "@/components/game-search/data";
import { after } from "next/server";
import { cache } from "react";
import { generateGeminiText, hasGeminiKey } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import {
  cleanWikiExtract,
  fetchPublicGameInfo,
  takeSentences,
  type PublicGameInfo,
  type PublicSource,
} from "@/lib/public-game-info";

export type GameSummarySource = "gemini" | "wikipedia" | "registered";

export type GeneratedGameDetails = {
  summary: string;
  sources: PublicSource[];
  assembledFromPublic: boolean;
  assemblyVersion: number;
  generatedBy?: GameSummarySource;
};

const SUMMARY_ASSEMBLY_VERSION = 4;
const generatingSummaries = new Set<string>();

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

function cleanGeneratedSummary(raw: string | null) {
  if (!raw) return null;
  let text = raw
    .replace(/^```(?:markdown|text)?\s*/i, "")
    .replace(/\s*```$/, "")
    .replace(/^(ゲーム概要|概要)[:：]\s*/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length < 40) return null;
  return text.slice(0, 800).trim();
}

async function generateSummaryWithGemini(
  game: SearchGame,
  publicInfo: PublicGameInfo | null,
) {
  const sourceText = publicInfo
    ? publicInfo.extract.slice(0, 900)
    : "公開百科の本文は取得できませんでした。登録データのみを使い、不明な事実は書かないでください。";

  const generated = await generateGeminiText(
    `あなたは日本語のゲーム事典編集者です。次の公開情報と登録データだけを根拠に、ゲーム概要を書いてください。公開情報に無い事実は作らず、架空のレビューやスコアは書かないでください。

公開情報:
${sourceText}

登録データ:
- タイトル: ${game.title}
- パブリッシャー: ${game.developer}
- 発売年: ${game.releaseYear}
- ジャンル: ${game.genre}
- 対応プラットフォーム: ${game.platforms.join("、") || "未登録"}

条件:
- 日本語で3〜5文
- 遊び方・特徴・対象ハードが分かること
- 見出しや「概要:」などの接頭辞は付けない
- 本文だけを返す`,
    {
      temperature: 0.2,
      timeoutMs: 15000,
      maxOutputTokens: 400,
      retries: 2,
      model: "gemini-3.5-flash-lite",
    },
  );

  return cleanGeneratedSummary(generated);
}

function assembleFromPublic(
  game: SearchGame,
  publicInfo: PublicGameInfo | null,
  summary?: string | null,
  generatedBy?: GameSummarySource,
): GeneratedGameDetails {
  return {
    summary: summary?.trim() || summaryFromPublic(game, publicInfo),
    sources: publicInfo?.sources ?? [],
    assembledFromPublic: true,
    assemblyVersion: SUMMARY_ASSEMBLY_VERSION,
    generatedBy:
      generatedBy ??
      (publicInfo ? "wikipedia" : "registered"),
  };
}

export function isGeneratedGameDetails(
  value: unknown,
): value is GeneratedGameDetails {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.summary === "string";
}

function scheduleGeminiSummary(
  gameId: string,
  game: SearchGame,
  publicInfo?: PublicGameInfo | null,
) {
  if (!hasGeminiKey() || !UUID_RE.test(gameId)) return;
  if (generatingSummaries.has(gameId)) return;
  generatingSummaries.add(gameId);

  try {
    after(async () => {
      try {
        const info =
          publicInfo === undefined
            ? await fetchPublicGameInfo(game)
            : publicInfo;
        const geminiSummary = await generateSummaryWithGemini(game, info);
        if (!geminiSummary) return;
        await saveDetails(
          gameId,
          assembleFromPublic(game, info, geminiSummary, "gemini"),
          "gemini-3.5-flash-lite",
        );
      } catch (error) {
        console.error("Gemini game summary generation failed", error);
      } finally {
        generatingSummaries.delete(gameId);
      }
    });
  } catch (error) {
    generatingSummaries.delete(gameId);
    console.error("Failed to schedule Gemini game summary", error);
  }
}

function normalizeStored(value: GeneratedGameDetails): GeneratedGameDetails {
  const generatedBy =
    value.generatedBy === "gemini" ||
    value.generatedBy === "wikipedia" ||
    value.generatedBy === "registered"
      ? value.generatedBy
      : undefined;
  return {
    ...value,
    sources: asSources(value.sources),
    assembledFromPublic: value.assembledFromPublic === true,
    assemblyVersion: Number(value.assemblyVersion) || 0,
    generatedBy,
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
  if (stored?.generatedBy === "gemini") return stored;

  if (stored) {
    scheduleGeminiSummary(id, game);
    return stored;
  }

  const publicInfo = await fetchPublicGameInfo(game);
  const details = assembleFromPublic(game, publicInfo);
  if (UUID_RE.test(id)) {
    await saveDetails(
      id,
      details,
      publicInfo ? "wikipedia-public-sources" : "registered-public-facts",
    );
  }
  scheduleGeminiSummary(id, game, publicInfo);
  return details;
}
