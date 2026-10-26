import type { AdminReport, ReportReason, ReportStatus } from "@/components/admin-dashboard/data";
import { isUuid } from "@/lib/games";
import { prisma } from "@/lib/prisma";

export const REPORT_TARGET_TYPES = ["review", "topic", "post"] as const;
export const REPORT_REASONS = ["harassment", "spoiler", "spam", "other"] as const;
export const REPORT_STATUSES = ["open", "hidden", "dismissed"] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export type ReportInput = {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  comment: string;
};

export type HiddenTargetSets = {
  reviews: Set<string>;
  topics: Set<string>;
  posts: Set<string>;
};

function asRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new Error("送信内容が正しくありません");
  }
  return body as Record<string, unknown>;
}

function isTargetType(value: string): value is ReportTargetType {
  return (REPORT_TARGET_TYPES as readonly string[]).includes(value);
}

function isReason(value: string): value is ReportReason {
  return (REPORT_REASONS as readonly string[]).includes(value);
}

function isStatus(value: string): value is ReportStatus {
  return (REPORT_STATUSES as readonly string[]).includes(value);
}

function visibleText(raw: string | null | undefined) {
  if (!raw) return "";
  const match = raw.match(/^<!--gl:(.*?)-->\n?([\s\S]*)$/);
  return (match?.[2] ?? raw).trim();
}

function clip(value: string, max = 200) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}…`;
}

function toReportReason(value: string): ReportReason {
  if (value === "inappropriate") return "harassment";
  if (value === "false_info") return "other";
  if (isReason(value)) return value;
  return "other";
}

function toReportStatus(value: string): ReportStatus {
  if (value === "pending") return "open";
  if (isStatus(value)) return value;
  return "open";
}

export function parseReportInput(body: unknown): ReportInput {
  const record = asRecord(body);
  const targetType = typeof record.targetType === "string" ? record.targetType.trim() : "";
  const targetId = typeof record.targetId === "string" ? record.targetId.trim() : "";
  const reason = typeof record.reason === "string" ? record.reason.trim() : "";
  const comment = typeof record.comment === "string" ? record.comment.trim() : "";

  if (!isTargetType(targetType)) {
    throw new Error("通報対象が正しくありません");
  }
  if (!isUuid(targetId)) {
    throw new Error("この投稿は通報できません");
  }
  if (!isReason(reason)) {
    throw new Error("通報理由を選択してください");
  }
  if (comment.length > 500) {
    throw new Error("補足は500文字以内で入力してください");
  }

  return { targetType, targetId, reason, comment };
}

export function parseReportStatus(body: unknown): ReportStatus {
  const record = asRecord(body);
  const status = typeof record.status === "string" ? record.status.trim() : "";
  if (!isStatus(status)) {
    throw new Error("ステータスが正しくありません");
  }
  return status;
}

export async function getHiddenTargetSets(): Promise<HiddenTargetSets> {
  const rows = await prisma.reports.findMany({
    where: { status: "hidden" },
    select: { target_type: true, target_id: true },
  });

  const reviews = new Set<string>();
  const topics = new Set<string>();
  const posts = new Set<string>();

  for (const row of rows) {
    if (row.target_type === "review") reviews.add(row.target_id);
    else if (row.target_type === "topic") topics.add(row.target_id);
    else if (row.target_type === "post") posts.add(row.target_id);
  }

  return { reviews, topics, posts };
}

async function assertReportableTarget(
  targetType: ReportTargetType,
  targetId: string,
  reporterId: string,
) {
  if (targetType === "review") {
    const review = await prisma.reviews.findUnique({
      where: { id: targetId },
      select: { user_id: true },
    });
    if (!review) throw new Error("対象が見つかりません");
    if (review.user_id && review.user_id === reporterId) {
      throw new Error("自分の投稿は通報できません");
    }
    return;
  }

  if (targetType === "topic") {
    const topic = await prisma.topics.findUnique({
      where: { id: targetId },
      include: {
        posts: {
          orderBy: { created_at: "asc" },
          take: 1,
          select: { user_id: true },
        },
      },
    });
    if (!topic) throw new Error("対象が見つかりません");
    const ownerId = topic.posts[0]?.user_id;
    if (ownerId && ownerId === reporterId) {
      throw new Error("自分の投稿は通報できません");
    }
    return;
  }

  const post = await prisma.posts.findUnique({
    where: { id: targetId },
    select: { user_id: true },
  });
  if (!post) throw new Error("対象が見つかりません");
  if (post.user_id && post.user_id === reporterId) {
    throw new Error("自分の投稿は通報できません");
  }
}

export async function createReport(input: ReportInput, reporterId: string) {
  if (!reporterId) throw new Error("ログインしてください");

  await assertReportableTarget(input.targetType, input.targetId, reporterId);

  const existing = await prisma.reports.findFirst({
    where: {
      reporter_id: reporterId,
      target_type: input.targetType,
      target_id: input.targetId,
      status: { in: ["open", "pending", "hidden"] },
    },
    select: { id: true },
  });
  if (existing) throw new Error("既に通報済みです");

  return prisma.reports.create({
    data: {
      reporter_id: reporterId,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      comment: input.comment || null,
      status: "open",
    },
  });
}

async function resolveTargets(rows: { target_type: string; target_id: string }[]) {
  const reviewIds = rows
    .filter((row) => row.target_type === "review")
    .map((row) => row.target_id);
  const topicIds = rows
    .filter((row) => row.target_type === "topic")
    .map((row) => row.target_id);
  const postIds = rows
    .filter((row) => row.target_type === "post")
    .map((row) => row.target_id);

  const [reviews, topics, posts] = await Promise.all([
    reviewIds.length
      ? prisma.reviews.findMany({
          where: { id: { in: reviewIds } },
          include: { games: { select: { title: true } } },
        })
      : Promise.resolve([]),
    topicIds.length
      ? prisma.topics.findMany({
          where: { id: { in: topicIds } },
          include: {
            games: { select: { title: true } },
            posts: {
              orderBy: { created_at: "asc" },
              take: 1,
              select: { content: true },
            },
          },
        })
      : Promise.resolve([]),
    postIds.length
      ? prisma.posts.findMany({
          where: { id: { in: postIds } },
          include: {
            topics: {
              include: { games: { select: { title: true } } },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const reviewMap = new Map(reviews.map((item) => [item.id, item]));
  const topicMap = new Map(topics.map((item) => [item.id, item]));
  const postMap = new Map(posts.map((item) => [item.id, item]));

  return { reviewMap, topicMap, postMap };
}

function toAdminReport(
  row: {
    id: string;
    target_type: string;
    target_id: string;
    reason: string;
    comment: string | null;
    status: string;
    created_at: Date;
    profiles: { username: string; display_name: string } | null;
  },
  maps: Awaited<ReturnType<typeof resolveTargets>>,
): AdminReport {
  let gameTitle = "不明なゲーム";
  let targetContent = "削除された投稿";

  if (row.target_type === "review") {
    const review = maps.reviewMap.get(row.target_id);
    if (review) {
      gameTitle = review.games.title;
      targetContent = clip(visibleText(review.comment)) || "（本文なし）";
    }
  } else if (row.target_type === "topic") {
    const topic = maps.topicMap.get(row.target_id);
    if (topic) {
      gameTitle = topic.games.title;
      const body = visibleText(topic.posts[0]?.content);
      targetContent = clip(body ? `${topic.title} / ${body}` : topic.title);
    }
  } else if (row.target_type === "post") {
    const post = maps.postMap.get(row.target_id);
    if (post) {
      gameTitle = post.topics.games.title;
      targetContent = clip(visibleText(post.content)) || "（本文なし）";
    }
  }

  const targetType: AdminReport["targetType"] =
    row.target_type === "topic" || row.target_type === "post"
      ? row.target_type
      : "review";

  return {
    id: row.id,
    targetType,
    targetId: row.target_id,
    targetContent,
    gameTitle,
    reporter: row.profiles?.username || row.profiles?.display_name || "不明",
    reason: toReportReason(row.reason),
    reportedAt: row.created_at.toISOString(),
    status: toReportStatus(row.status),
    comment: row.comment?.trim() || undefined,
  };
}

export async function listAdminReports(): Promise<AdminReport[]> {
  const rows = await prisma.reports.findMany({
    include: {
      profiles: { select: { username: true, display_name: true } },
    },
    orderBy: { created_at: "desc" },
  });
  const maps = await resolveTargets(rows);
  return rows.map((row) => toAdminReport(row, maps));
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  if (!isUuid(id)) throw new Error("通報が見つかりません");

  const existing = await prisma.reports.findUnique({
    where: { id },
    select: { id: true, target_type: true, target_id: true },
  });
  if (!existing) throw new Error("通報が見つかりません");

  if (status === "dismissed") {
    await prisma.reports.updateMany({
      where: {
        target_type: existing.target_type,
        target_id: existing.target_id,
        status: "hidden",
      },
      data: { status: "dismissed" },
    });
  }

  const updated = await prisma.reports.update({
    where: { id },
    data: { status },
    include: {
      profiles: { select: { username: true, display_name: true } },
    },
  });
  const maps = await resolveTargets([updated]);
  return toAdminReport(updated, maps);
}
