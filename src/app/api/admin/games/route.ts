import { NextResponse } from "next/server";
import { adminGameErrorResponse } from "@/lib/admin-game-api";
import { requireAdminUser } from "@/lib/auth";
import {
  createAdminGame,
  parseAdminGameInput,
  parseAdminGamesStatusInput,
  updateAdminGamesStatus,
} from "@/lib/games";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminUser();
    const game = await createAdminGame(parseAdminGameInput(await request.json()));
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin game", error);
    return adminGameErrorResponse(error, "ゲームの追加に失敗しました");
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminUser();
    const { ids, status } = parseAdminGamesStatusInput(await request.json());
    const updated = await updateAdminGamesStatus(ids, status);
    return NextResponse.json({ updated, status });
  } catch (error) {
    console.error("Failed to update game visibility", error);
    return adminGameErrorResponse(error, "公開状態の更新に失敗しました");
  }
}
