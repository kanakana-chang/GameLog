import { NextResponse } from "next/server";

export function adminGameErrorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("見つかりません")
    ? 404
    : message.includes("入力") ||
        message.includes("選んで") ||
        message.includes("正しく")
      ? 400
      : 500;
  return NextResponse.json({ error: message }, { status });
}
