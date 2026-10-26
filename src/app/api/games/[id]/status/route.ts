import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { isUuid } from "@/lib/games";
import {
  parseGameStatusInput,
  upsertUserGameStatus,
} from "@/lib/game-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await requireSessionUser();
    if (!isUuid(id)) throw new Error("ゲームが見つかりません");

    const game = await prisma.games.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!game) throw new Error("ゲームが見つかりません");

    const status = parseGameStatusInput(await request.json());
    await upsertUserGameStatus({
      userId: user.id,
      gameId: id,
      status,
    });
    return NextResponse.json({ status });
  } catch (error) {
    console.error("Failed to update game status", error);
    return jsonError(error, "ステータスの更新に失敗しました");
  }
}
