import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { deleteAccount, parseAccountDeleteInput } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  try {
    parseAccountDeleteInput(await request.json());
    await deleteAccount();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete account", error);
    return jsonError(error, "アカウントの削除に失敗しました");
  }
}
