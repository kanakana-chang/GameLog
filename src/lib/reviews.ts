import type { GameDetailData, Kink, Review } from "@/components/game-detail/data";
import { isUuid } from "@/lib/games";
import { prisma } from "@/lib/prisma";

const AVATAR = {
  av: "G",
  avBg: "#EEF2FF",
  avC: "#4F46E5",
} as const;

const STATUS_TAGS: Record<string, string> = {
  playing: "プレイ中",
  cleared: "クリア済",
  dropped: "積みゲー",
  on_hold: "一時中断",
  want: "欲しい",
};

export type ReviewInput = {
  rating: number;
  status: string;
  comment: string;
  spoiler: boolean;
  playtimeHours: number;
  platform: string;
  params: {
    graphics: number;
    story: number;
    gameplay: number;
    music: number;
    value: number;
    f2p: number;
  };
  imageUrl: string;
};

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function asRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new Error("送信内容が正しくありません");
  }
  return body as Record<string, unknown>;
}

function paramValue(record: Record<string, unknown>, key: string, fallback: number) {
  const raw = record[key];
  const value = typeof raw === "number" ? raw : Number(raw);
  return clampInt(Number.isFinite(value) ? value : fallback, 1, 10);
}

export function parseReviewInput(body: unknown): ReviewInput {
  const record = asRecord(body);
  const paramsRecord =
    record.params && typeof record.params === "object"
      ? (record.params as Record<string, unknown>)
      : {};
  const rating = clampInt(Number(record.rating), 0, 5);
  const status = typeof record.status === "string" ? record.status.trim() : "";
  const comment = typeof record.comment === "string" ? record.comment.trim() : "";
  const playtimeHours = Number(record.playtimeHours);
  const platform = typeof record.platform === "string" ? record.platform.trim() : "";
  const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl.trim() : "";
  const fallbackParam = rating > 0 ? clampInt(rating * 2, 1, 10) : 5;

  if (!STATUS_TAGS[status]) {
    throw new Error("ステータスを選択してください");
  }
  if (rating < 1) {
    throw new Error("総合評価を選択してください");
  }
  if (comment.length > 4000) {
    throw new Error("感想は4000文字以内で入力してください");
  }
  if (playtimeHours < 0 || playtimeHours > 10000) {
    throw new Error("プレイ時間が正しくありません");
  }

  return {
    rating,
    status,
    comment,
    spoiler: record.spoiler === true,
    playtimeHours: Number.isFinite(playtimeHours) ? playtimeHours : 0,
    platform,
    params: {
      graphics: paramValue(paramsRecord, "graphics", fallbackParam),
      story: paramValue(paramsRecord, "story", fallbackParam),
      gameplay: paramValue(paramsRecord, "gameplay", fallbackParam),
      music: paramValue(paramsRecord, "music", fallbackParam),
      value: paramValue(paramsRecord, "value", fallbackParam),
      f2p: paramValue(paramsRecord, "f2p", fallbackParam),
    },
    imageUrl,
  };
}

function scoreFromStars(rating: number) {
  return rating >= 5 ? 9.9 : rating * 2;
}

function kinkFromF2p(f2p: number): Kink {
  if (f2p >= 8) return "無課金";
  if (f2p >= 5) return "微課金";
  return "重課金";
}

function titleFromComment(comment: string, rating: number) {
  const compact = comment.replace(/\s+/g, " ").trim();
  if (compact) return compact.slice(0, 40);
  const labels = ["", "最悪", "微妙", "普通", "良い", "神ゲー"];
  return labels[rating] || "レビュー";
}

function imageUrlForStore(url: string) {
  if (!url) return null;
  if (url.startsWith("data:")) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return null;
  }
  return null;
}

function encodeMeta(input: ReviewInput) {
  return JSON.stringify({
    h: input.playtimeHours,
    s: input.status,
    p: input.platform,
    f: input.params.f2p,
  });
}

function decodeMeta(comment: string | null): {
  text: string;
  playtimeHours: number;
  status: string;
  platform: string;
  f2p: number | null;
} {
  if (!comment) {
    return { text: "", playtimeHours: 0, status: "", platform: "", f2p: null };
  }
  const match = comment.match(/^<!--gl:(.*?)-->\n?([\s\S]*)$/);
  if (!match) {
    return { text: comment, playtimeHours: 0, status: "", platform: "", f2p: null };
  }
  try {
    const meta = JSON.parse(match[1]) as {
      h?: number;
      s?: string;
      p?: string;
      f?: number;
    };
    return {
      text: match[2] ?? "",
      playtimeHours: Number(meta.h) || 0,
      status: typeof meta.s === "string" ? meta.s : "",
      platform: typeof meta.p === "string" ? meta.p : "",
      f2p: typeof meta.f === "number" ? meta.f : null,
    };
  } catch {
    return { text: comment, playtimeHours: 0, status: "", platform: "", f2p: null };
  }
}

type ReviewRow = Awaited<ReturnType<typeof prisma.reviews.findMany<{
  include: { profiles: true };
}>>>[number];

function toDetailReview(row: ReviewRow, fallbackPlatform: string): Review {
  const meta = decodeMeta(row.comment);
  const score = Number(row.rating_overall);
  const f2pScore = meta.f2p ?? row.param_5;
  const text = meta.text.trim();
  const author = row.profiles?.display_name || row.profiles?.username || "ゲスト";

  return {
    id: row.id,
    user: author,
    av: author.slice(0, 1).toUpperCase() || AVATAR.av,
    avBg: AVATAR.avBg,
    avC: AVATAR.avC,
    platform: meta.platform || fallbackPlatform || "—",
    score,
    playTime: meta.playtimeHours,
    date: row.created_at.toISOString().slice(0, 10),
    f2p: f2pScore >= 6,
    kink: kinkFromF2p(f2pScore),
    title: titleFromComment(text, Math.round(score / 2)),
    body: row.is_spoiler ? "このレビューにはネタバレが含まれています。" : text,
    spoilerBody: row.is_spoiler ? text : "",
    helpful: 0,
    tags: [
      STATUS_TAGS[meta.status],
      f2pScore >= 8 ? "無課金OK" : f2pScore <= 4 ? "課金推奨" : "",
      row.is_spoiler ? "ネタバレ" : "",
    ].filter(Boolean),
  };
}

function scoreDist(scores: number[]) {
  const buckets = [
    { label: "10", count: 0 },
    { label: "8-9", count: 0 },
    { label: "6-7", count: 0 },
    { label: "4-5", count: 0 },
    { label: "1-3", count: 0 },
  ];
  for (const score of scores) {
    if (score >= 9.5) buckets[0].count += 1;
    else if (score >= 8) buckets[1].count += 1;
    else if (score >= 6) buckets[2].count += 1;
    else if (score >= 4) buckets[3].count += 1;
    else buckets[4].count += 1;
  }
  return buckets;
}

export function attachGameReviews(
  detail: GameDetailData,
  reviews: Review[],
): GameDetailData {
  if (!reviews.length) return detail;
  const scores = reviews.map((item) => item.score);
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return {
    ...detail,
    reviews,
    totalReviews: reviews.length,
    avgScore: Math.round(avg * 10) / 10,
    scoreDist: scoreDist(scores),
  };
}

export async function getGameReviews(gameId: string): Promise<Review[]> {
  if (!isUuid(gameId)) return [];

  const game = await prisma.games.findUnique({
    where: { id: gameId },
    include: {
      game_platform: { include: { platforms: true } },
    },
  });
  if (!game) return [];

  const rows = await prisma.reviews.findMany({
    where: { game_id: gameId },
    include: { profiles: true },
    orderBy: { created_at: "desc" },
  });

  const fallbackPlatform = game.game_platform[0]?.platforms.name ?? "";
  return rows.map((row) => toDetailReview(row, fallbackPlatform));
}

export async function createGameReview(
  gameId: string,
  input: ReviewInput,
): Promise<Review> {
  if (!isUuid(gameId)) {
    throw new Error("ゲームが見つかりません");
  }

  const game = await prisma.games.findUnique({ where: { id: gameId } });
  if (!game) throw new Error("ゲームが見つかりません");

  const created = await prisma.reviews.create({
    data: {
      game_id: gameId,
      rating_overall: scoreFromStars(input.rating),
      param_1: input.params.graphics,
      param_2: input.params.story,
      param_3: input.params.gameplay,
      param_4: input.params.music,
      param_5: input.params.value,
      comment: `<!--gl:${encodeMeta(input)}-->\n${input.comment}`,
      image_url: imageUrlForStore(input.imageUrl),
      is_spoiler: input.spoiler,
    },
    include: { profiles: true },
  });

  return toDetailReview(created, input.platform);
}
