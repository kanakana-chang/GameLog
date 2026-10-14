import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { logoutUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to logout", error);
    return jsonError(error, "ログアウトに失敗しました");
  }
}
