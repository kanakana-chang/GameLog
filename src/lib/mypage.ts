import type { Game, Review } from "@/components/my-page/data";
import { gameCoverUrl } from "@/lib/games";
import { shelfLabel, storedStatusFromReview } from "@/lib/game-status";
import { prisma } from "@/lib/prisma";
import { decodeMeta, STATUS_TAGS } from "@/lib/reviews";

function starsFromScore(score: number) {
  if (!Number.isFinite(score) || score <= 0) return null;
  if (score >= 9.5) return 5;
  return Math.min(5, Math.max(1, Math.round(score / 2)));
}

function hoursFrom(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

function platformName(
  stored: string | undefined,
  platforms: { platforms: { name: string; slug: string } }[],
) {
  if (stored) return stored;
  const first = platforms[0]?.platforms;
  if (!first) return "—";
  if (first.slug.toLowerCase().includes("switch") || first.name.includes("Switch")) {
    return first.name.includes("2") || first.slug.toLowerCase().includes("switch2")
      ? "Switch2"
      : "Switch";
  }
  if (first.slug.toLowerCase().includes("ios") || first.name.includes("iOS")) {
    return "iOS";
  }
  if (first.slug.toLowerCase().includes("android") || first.name.includes("Android")) {
    return "Android";
  }
  return first.name;
}

function reviewTags(meta: ReturnType<typeof decodeMeta>, spoiler: boolean) {
  const f2p = meta.f2p;
  return [
    STATUS_TAGS[meta.status],
    f2p != null ? (f2p >= 8 ? "無課金OK" : f2p <= 4 ? "課金推奨" : "") : "",
    meta.platform,
    spoiler ? "ネタバレ" : "",
  ].filter(Boolean);
}

function formatReviewDate(value: Date) {
  return value.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getMyPageContent(userId: string): Promise<{
  games: Game[];
  reviews: Review[];
}> {
  const [statusRows, reviewRows] = await Promise.all([
    prisma.user_game_statuses.findMany({
      where: { user_id: userId },
      include: {
        games: {
          include: {
            game_platform: { include: { platforms: true } },
          },
        },
      },
      orderBy: { updated_at: "desc" },
    }),
    prisma.reviews.findMany({
      where: { user_id: userId },
      include: {
        games: {
          include: {
            game_platform: { include: { platforms: true } },
          },
        },
        _count: { select: { review_likes: true } },
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  const reviews: Review[] = reviewRows.map((row) => {
    const meta = decodeMeta(row.comment);
    const text = meta.text.trim();
    return {
      id: row.id,
      gameId: row.game_id,
      gameTitle: row.games.title,
      cover: gameCoverUrl(row.games.cover_image_url),
      rating: starsFromScore(Number(row.rating_overall)) ?? 0,
      date: formatReviewDate(row.created_at),
      text: text || "（本文なし）",
      likes: row._count.review_likes,
      comments: 0,
      tags: reviewTags(meta, row.is_spoiler),
      href: `/games/${row.game_id}`,
    };
  });

  const latestReviewByGame = new Map<string, (typeof reviewRows)[number]>();
  for (const row of reviewRows) {
    if (!latestReviewByGame.has(row.game_id)) {
      latestReviewByGame.set(row.game_id, row);
    }
  }

  const games = new Map<string, Game>();

  for (const row of statusRows) {
    if (games.has(row.game_id)) continue;
    const review = latestReviewByGame.get(row.game_id);
    const meta = review ? decodeMeta(review.comment) : null;
    const reviewHours = meta?.playtimeHours ?? 0;
    const statusHours = Number(row.play_time_hours);
    games.set(row.game_id, {
      id: row.game_id,
      title: row.games.title,
      cover: gameCoverUrl(row.games.cover_image_url),
      status: shelfLabel(row.status),
      hours: hoursFrom(reviewHours > 0 ? reviewHours : statusHours),
      platform: platformName(meta?.platform, row.games.game_platform),
      rating: review ? starsFromScore(Number(review.rating_overall)) : null,
      href: `/games/${row.game_id}`,
    });
  }

  for (const row of reviewRows) {
    if (games.has(row.game_id)) continue;
    const meta = decodeMeta(row.comment);
    games.set(row.game_id, {
      id: row.game_id,
      title: row.games.title,
      cover: gameCoverUrl(row.games.cover_image_url),
      status: shelfLabel(storedStatusFromReview(meta.status)),
      hours: hoursFrom(meta.playtimeHours),
      platform: platformName(meta.platform, row.games.game_platform),
      rating: starsFromScore(Number(row.rating_overall)),
      href: `/games/${row.game_id}`,
    });
  }

  return { games: [...games.values()], reviews };
}
