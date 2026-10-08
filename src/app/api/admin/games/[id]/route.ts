import { NextResponse } from "next/server";
import {
  deleteAdminGame,
  parseAdminGameInput,
  updateAdminGame,
} from "@/lib/games";
import { adminGameErrorResponse } from "@/lib/admin-game-api";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const game = await updateAdminGame(id, parseAdminGameInput(await request.json()));
    return NextResponse.json(game);
  } catch (error) {
    console.error("Failed to update admin game", error);
    return adminGameErrorResponse(error, "ゲームの更新に失敗しました");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteAdminGame(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete admin game", error);
    return adminGameErrorResponse(error, "ゲームの削除に失敗しました");
  }
}
