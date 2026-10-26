import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import {
  generatePostTitle,
  type PostTitleKind,
} from "@/lib/post-title";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireSessionUser();
    const body = (await request.json()) as {
      kind?: string;
      body?: string;
      gameTitle?: string;
      extra?: string;
    };
    const kind: PostTitleKind =
      body.kind === "review" || body.kind === "reply" || body.kind === "topic"
        ? body.kind
        : "topic";
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text) throw new Error("本文を入力してください");

    const title = await generatePostTitle({
      kind,
      body: text,
      gameTitle: typeof body.gameTitle === "string" ? body.gameTitle : "",
      extra: typeof body.extra === "string" ? body.extra : "",
    });
    return NextResponse.json({ title });
  } catch (error) {
    console.error("Failed to generate title", error);
    return jsonError(error, "タイトルの生成に失敗しました");
  }
}
