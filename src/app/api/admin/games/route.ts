import { NextResponse } from "next/server";
import { createAdminGame, parseAdminGameInput } from "@/lib/games";
import { adminGameErrorResponse } from "@/lib/admin-game-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const game = await createAdminGame(parseAdminGameInput(await request.json()));
    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin game", error);
    return adminGameErrorResponse(error, "ゲームの追加に失敗しました");
  }
}
