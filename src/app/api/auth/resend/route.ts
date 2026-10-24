import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { parseResetInput, resendConfirmationEmail } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = parseResetInput(await request.json());
    const origin = new URL(request.url).origin;
    await resendConfirmationEmail(email, `${origin}/auth/callback`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to resend confirmation email", error);
    return jsonError(error, "確認メールの再送信に失敗しました");
  }
}
