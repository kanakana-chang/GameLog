import { isUuid } from "@/lib/games";
import { prisma } from "@/lib/prisma";

export const DETAIL_STATUS_KEYS = ["playing", "completed", "want", "dropped"] as const;
export type DetailStatusKey = (typeof DETAIL_STATUS_KEYS)[number];

export function isDetailStatusKey(value: string): value is DetailStatusKey {
  return (DETAIL_STATUS_KEYS as readonly string[]).includes(value);
}

export function storedStatusFromReview(status: string) {
  if (status === "playing") return "playing";
  if (status === "cleared" || status === "completed") return "cleared";
  if (status === "want") return "want";
  if (status === "dropped" || status === "on_hold") return "stacked";
  return "stacked";
}

export function toDetailStatusKey(stored: string): DetailStatusKey | null {
  if (stored === "playing") return "playing";
  if (stored === "cleared" || stored === "completed") return "completed";
  if (stored === "want") return "want";
  if (stored === "dropped" || stored === "quit") return "dropped";
  return null;
}

export function shelfLabel(stored: string) {
  if (stored === "playing") return "プレイ中" as const;
  if (stored === "cleared" || stored === "completed") return "クリア済み" as const;
  if (stored === "dropped" || stored === "quit") return "やめた" as const;
  return "積みゲー" as const;
}

export async function getUserGameStatus(userId: string, gameId: string) {
  if (!isUuid(userId) || !isUuid(gameId)) return null;
  const row = await prisma.user_game_statuses.findFirst({
    where: { user_id: userId, game_id: gameId },
    select: { status: true },
  });
  return row ? toDetailStatusKey(row.status) : null;
}

export async function upsertUserGameStatus(options: {
  userId: string;
  gameId: string;
  status: string | null;
  playTimeHours?: number;
}) {
  if (!isUuid(options.userId) || !isUuid(options.gameId)) {
    throw new Error("ゲームが見つかりません");
  }

  const existing = await prisma.user_game_statuses.findFirst({
    where: { user_id: options.userId, game_id: options.gameId },
  });

  if (!options.status) {
    if (existing) {
      await prisma.user_game_statuses.delete({ where: { id: existing.id } });
    }
    return null;
  }

  const hours =
    options.playTimeHours != null
      ? options.playTimeHours
      : existing
        ? Number(existing.play_time_hours)
        : 0;

  if (existing) {
    return prisma.user_game_statuses.update({
      where: { id: existing.id },
      data: {
        status: options.status,
        play_time_hours: hours,
        updated_at: new Date(),
      },
    });
  }

  return prisma.user_game_statuses.create({
    data: {
      user_id: options.userId,
      game_id: options.gameId,
      status: options.status,
      play_time_hours: hours,
    },
  });
}

export function parseGameStatusInput(body: unknown): DetailStatusKey | null {
  if (!body || typeof body !== "object") {
    throw new Error("ステータスが正しくありません");
  }
  const status = (body as { status?: unknown }).status;
  if (status === null) return null;
  if (typeof status !== "string" || !isDetailStatusKey(status)) {
    throw new Error("ステータスが正しくありません");
  }
  return status;
}
