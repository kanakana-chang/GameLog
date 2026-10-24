import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import {
  changePassword,
  completePasswordReset,
  parsePasswordChangeInput,
  parsePasswordResetCompleteInput,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record =
      body && typeof body === "object" ? (body as Record<string, unknown>) : {};

    if (typeof record.currentPassword === "string") {
      await changePassword(parsePasswordChangeInput(body));
    } else {
      await completePasswordReset(parsePasswordResetCompleteInput(body));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update password", error);
    return jsonError(error, "パスワードの変更に失敗しました");
  }
}
