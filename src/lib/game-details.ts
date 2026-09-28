import type { SearchGame } from "@/components/game-search/data";
import { prisma } from "@/lib/prisma";

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

function normalizeDetails(
  raw: Record<string, unknown>,
  game: SearchGame,
): GeneratedGameDetails {
  return {
    summary: asString(raw.summary, `${game.title}の公開情報を整理した詳細です。`),
    priceLabel: asString(
      raw.priceLabel,
      game.isFree ? "基本無料" : "価格情報なし",
    ),
    ageRating: asString(raw.ageRating, "情報なし"),
    releaseDate: asString(raw.releaseDate, `${game.releaseYear}年`),
    monetizationType: asString(
      raw.monetizationType,
      game.isFree ? "基本無料 + アイテム課金" : "買い切り",
    ),
    monthly: asString(raw.monthly, "なし"),
    ceiling: asString(
      raw.ceiling,
      game.hasGacha ? "ガチャあり" : "天井なし（ガチャ非搭載）",
    ),
    f2pScore: clamp(Number(raw.f2pScore), 0, 100),
    volumeScore: clamp(Number(raw.volumeScore), 0, 100),
    graphicScore: clamp(Number(raw.graphicScore), 0, 100),
    controlScore: clamp(Number(raw.controlScore), 0, 100),
    storyScore: clamp(Number(raw.storyScore), 0, 100),
    kinkaScore: clamp(Number(raw.kinkaScore), 0, 100),
    avgPlayTime: clamp(Number(raw.avgPlayTime), 0, 5000),
    avgScore: clamp(Number(raw.avgScore), 0, 10),
    tags: asStringList(raw.tags).slice(0, 6),
    platforms: asStringList(raw.platforms),
  };
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function buildPrompt(game: SearchGame) {
  return `あなたは日本語のゲーム事典編集者です。次の登録データだけを手がかりに、公開されている事実に基づいてゲーム詳細をJSONで返してください。不明な項目は推測しすぎず、その旨が分かる表現にしてください。架空のユーザーレビューや存在しない数値の出典は書かないでください。

入力:
- タイトル: ${game.title}
- パブリッシャー: ${game.developer}
- 発売年: ${game.releaseYear}
- ジャンル: ${game.genre}
- ゲーム種別: ${game.tags.join(", ") || "不明"}
- 登録プラットフォーム: ${game.platforms.join(", ") || "未登録"}

出力JSONのキー:
{
  "summary": "3〜5文の日本語概要。遊び方、課金の有無、対象ハードを含める",
  "priceLabel": "例: 基本無料 / ¥6,480 / ¥6,480〜",
  "ageRating": "CERO表記。スマホアプリで不明なら対象年齢の目安",
  "releaseDate": "できるだけ具体的な発売日。不明なら年のみ",
  "monetizationType": "課金モデル",
  "monthly": "月額パス。なければなし",
  "ceiling": "ガチャ天井の有無",
  "f2pScore": 0から100の整数。無課金の遊びやすさ,
  "volumeScore": 0から100の整数,
  "graphicScore": 0から100の整数,
  "controlScore": 0から100の整数,
  "storyScore": 0から100の整数,
  "kinkaScore": 0から100の整数。高いほど課金圧が低い,
  "avgPlayTime": 平均プレイ時間の推定（時間、整数）,
  "avgScore": 0から10の小数1桁,
  "tags": ["短い日本語タグ"],
  "platforms": ["Switch2", "iOS", "Android"]
}`;
}

async function generateWithGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? parseJsonObject(text) : null;
}

async function generateWithOpenAI(prompt: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "ゲーム事典の編集者として、指定キーのJSONだけを返す。",
        },
        { role: "user", content: prompt },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  return text ? parseJsonObject(text) : null;
}

export function isGeneratedGameDetails(
  value: unknown,
): value is GeneratedGameDetails {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.summary === "string" && typeof record.priceLabel === "string";
}

function curatedDetails(title: string): GeneratedGameDetails | null {
  if (title.includes("スプラトゥーン") && title.includes("レイダース")) {
    return {
      summary:
        "『スプラトゥーン レイダース』は2026年7月23日発売のNintendo Switch 2向けソフトで、スプラトゥーンシリーズ初のスピンオフです。ウズシオ諸島を舞台に、新たな主人公「メカニック」とすりみ連合が島に眠るオタカラを探す協力型のアクションシューティングで、対戦ではなく探索・強化・シャケとの戦いが中心です。オンラインまたはローカルで最大4人まで冒険でき、ソロ中に救援を呼ぶヘルプ機能もあります。ダウンロード版は6,480円、パッケージ版は7,480円です。",
      priceLabel: "¥6,480〜",
      ageRating: "CERO A（全年齢対象）",
      releaseDate: "2026年7月23日",
      monetizationType: "買い切り",
      monthly: "なし",
      ceiling: "天井なし（ガチャ非搭載）",
      f2pScore: 90,
      volumeScore: 82,
      graphicScore: 88,
      controlScore: 86,
      storyScore: 74,
      kinkaScore: 94,
      avgPlayTime: 30,
      avgScore: 8.4,
      tags: ["スピンオフ", "協力プレイ", "探索"],
      platforms: ["Switch2"],
    };
  }

  if (title.includes("モンスターストライク")) {
    return {
      summary:
        "『モンスターストライク』はMIXIが配信するスマートフォン向け協力RPGです。2013年10月10日にiOS版、同年12月にAndroid版が始まり、モンスターを引っ張って敵に当てる「ひっぱりハンティング」が特徴です。友情コンボやストライクショット、最大4人のマルチプレイでクエストを攻略します。アプリ自体は無料ですが、ガチャや育成、月額480円のモンストパスポートなどの課金要素があります。",
      priceLabel: "基本無料",
      ageRating: "ストア年齢指定（CERO対象外のアプリ配信）",
      releaseDate: "2013年10月10日",
      monetizationType: "基本無料 + ガチャ・アイテム課金",
      monthly: "モンストパスポート 月額480円",
      ceiling: "ガチャあり（イベント・コラボごとに変動）",
      f2pScore: 38,
      volumeScore: 96,
      graphicScore: 72,
      controlScore: 84,
      storyScore: 48,
      kinkaScore: 32,
      avgPlayTime: 400,
      avgScore: 7.8,
      tags: ["ガチャ", "マルチプレイ", "ひっぱり"],
      platforms: ["iOS", "Android"],
    };
  }

  return null;
}

async function generateDetails(
  game: SearchGame,
): Promise<{ details: GeneratedGameDetails; model: string } | null> {
  const prompt = buildPrompt(game);

  try {
    const gemini = await generateWithGemini(prompt);
    if (gemini) {
      return {
        details: normalizeDetails(gemini, game),
        model: "gemini-2.5-flash",
      };
    }
  } catch (error) {
    console.error("Gemini game-detail generation failed", error);
  }

  try {
    const openai = await generateWithOpenAI(prompt);
    if (openai) {
      return {
        details: normalizeDetails(openai, game),
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      };
    }
  } catch (error) {
    console.error("OpenAI game-detail generation failed", error);
  }

  const curated = curatedDetails(game.title);
  if (curated) {
    return { details: curated, model: "curated-public-sources" };
  }

  return null;
}

export async function getStoredGameDetails(gameId: string) {
  if (!UUID_RE.test(gameId)) return null;
  const row = await prisma.game_details.findUnique({
    where: { game_id: gameId },
  });
  if (!row || !isGeneratedGameDetails(row.payload)) return null;
  return row.payload;
}

export async function ensureGameDetails(
  game: SearchGame,
): Promise<GeneratedGameDetails | null> {
  const id = String(game.id);
  const stored = await getStoredGameDetails(id);
  if (stored) return stored;

  const generated = await generateDetails(game);
  if (!generated || !UUID_RE.test(id)) return null;

  await prisma.game_details.upsert({
    where: { game_id: id },
    create: {
      game_id: id,
      payload: generated.details,
      model: generated.model,
    },
    update: {
      payload: generated.details,
      model: generated.model,
      generated_at: new Date(),
    },
  });

  return generated.details;
}

export function applyDetailsToSearchGame(
  game: SearchGame,
  details: GeneratedGameDetails | null,
): SearchGame {
  if (!details) return game;
  return {
    ...game,
    rating: Math.round((details.avgScore / 2) * 10) / 10,
    avgPlaytime: details.avgPlayTime,
    f2pScore: Math.max(1, Math.round(details.f2pScore / 20)),
    volumeScore: Math.max(1, Math.round(details.volumeScore / 20)),
    platforms: game.platforms.length ? game.platforms : details.platforms,
    tags: details.tags.length ? details.tags : game.tags,
    isFree: details.priceLabel.includes("無料") || game.isFree,
    hasGacha:
      /ガチャあり/.test(`${details.ceiling}${details.monetizationType}`) ||
      details.tags.includes("ガチャ"),
  };
}
