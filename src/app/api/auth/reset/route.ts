import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { parseResetInput, requestPasswordReset } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = parseResetInput(await request.json());
    const origin = new URL(request.url).origin;
    await requestPasswordReset(
      email,
      `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to request password reset", error);
    return jsonError(error, "リセットメールの送信に失敗しました");
  }
}
