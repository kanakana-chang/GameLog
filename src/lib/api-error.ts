import { NextResponse } from "next/server";

export function jsonError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("見つかりません")
    ? 404
    : message.includes("既に")
      ? 409
      : message.includes("上限")
        ? 429
        : message.includes("ログインしてください") ||
            message.includes("確認が完了")
          ? 401
          : message.includes("入力") ||
              message.includes("選択") ||
              message.includes("正しく") ||
              message.includes("同意") ||
              message.includes("未対応")
            ? 400
            : 500;
  return NextResponse.json({ error: message }, { status });
}
