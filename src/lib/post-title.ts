import { generateGeminiText } from "@/lib/gemini";

export type PostTitleKind = "review" | "topic" | "reply";

const MAX_TITLE_LENGTH = 60;

export function fallbackPostTitle(body: string, kind: PostTitleKind) {
  const compact = body.replace(/\s+/g, " ").trim();
  if (compact) return compact.slice(0, 40);
  if (kind === "review") return "レビュー";
  if (kind === "reply") return "レス";
  return "新しいトピック";
}

export function cleanGeneratedTitle(raw: string, max = MAX_TITLE_LENGTH) {
  let text = raw.replace(/\s+/g, " ").trim();
  text = text.replace(/^["「『#*\-\s]+/, "").replace(/["」』]+$/, "");
  text = text.replace(/^\*{1,2}/, "").replace(/\*{1,2}$/, "");
  text = text.replace(/^(タイトル|題名)[:：]\s*/, "");
  return text.slice(0, max).trim();
}

export async function generatePostTitle(input: {
  kind: PostTitleKind;
  body: string;
  gameTitle?: string;
  extra?: string;
}) {
  const fallback = fallbackPostTitle(input.body, input.kind);
  const kindLabel =
    input.kind === "review"
      ? "レビュー"
      : input.kind === "reply"
        ? "掲示板のレス"
        : "掲示板トピック";

  try {
    const generated = await generateGeminiText(
      `あなたは日本語のゲームコミュニティ編集者です。次の${kindLabel}から、太字見出し向きの短いタイトルを1つ作ってください。

ゲーム: ${input.gameTitle || "不明"}
${input.extra ? `補足: ${input.extra}\n` : ""}本文:
${input.body.slice(0, 1200)}

条件:
- 18〜36文字程度
- 投稿の要点が分かる日本語
- 鉤括弧・番号・「タイトル:」などの接頭辞は付けない
- タイトル本文だけを返す`,
      { temperature: 0.5 },
    );
    const cleaned = generated ? cleanGeneratedTitle(generated) : "";
    return cleaned || fallback;
  } catch (error) {
    console.error("Failed to generate post title", error);
    return fallback;
  }
}
