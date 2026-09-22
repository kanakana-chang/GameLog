"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Status = "playing" | "cleared" | "dropped" | "want" | "on_hold";
type ReviewMode = "quick" | "detailed";

export type ReviewGameInfo = {
  id: number;
  title: string;
  jacket: string;
  platforms: string[];
  genre: string[];
};

const STATUS_OPTIONS: {
  value: Status;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    value: "playing",
    label: "プレイ中",
    emoji: "🎮",
    color: "border-blue-300 bg-blue-100 text-blue-700",
  },
  {
    value: "cleared",
    label: "クリア済",
    emoji: "✅",
    color: "border-emerald-300 bg-emerald-100 text-emerald-700",
  },
  {
    value: "dropped",
    label: "積みゲー",
    emoji: "📦",
    color: "border-slate-300 bg-slate-100 text-slate-600",
  },
  {
    value: "on_hold",
    label: "一時中断",
    emoji: "⏸️",
    color: "border-amber-300 bg-amber-100 text-amber-700",
  },
  {
    value: "want",
    label: "欲しい",
    emoji: "🌟",
    color: "border-purple-300 bg-purple-100 text-purple-700",
  },
];

const PARAMS = [
  { key: "graphics", label: "グラフィック", icon: "🖼️" },
  { key: "story", label: "ストーリー", icon: "📖" },
  { key: "gameplay", label: "ゲームプレイ", icon: "🕹️" },
  { key: "music", label: "サウンド", icon: "🎵" },
  { key: "value", label: "コスパ", icon: "💰" },
  { key: "f2p", label: "無課金度", icon: "🆓" },
] as const;

const RATING_LABELS = ["", "最悪", "微妙", "普通", "良い", "神ゲー"] as const;

const DEFAULT_PARAMS = Object.fromEntries(PARAMS.map((p) => [p.key, 5]));

function draftKey(id: number) {
  return `gamelog-review-draft-${id}`;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star}星`}
          className="text-3xl transition-transform duration-100 hover:scale-110 focus:outline-none"
        >
          <span
            className={
              star <= (hovered || value)
                ? "text-amber-400 drop-shadow-sm"
                : "text-slate-200"
            }
          >
            ★
          </span>
        </button>
      ))}
      {value > 0 ? (
        <span className="ml-2 self-center text-sm font-semibold text-slate-500">
          {RATING_LABELS[value]}
        </span>
      ) : null}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${
        checked ? "bg-indigo-500" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ScreenshotUpload({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (i: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) onAdd(e.target.result as string);
        };
        reader.readAsDataURL(file);
      });
    },
    [onAdd],
  );

  return (
    <div className="space-y-3">
      <div
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors duration-200 hover:border-indigo-400 hover:bg-indigo-50"
      >
        <span className="text-3xl">📷</span>
        <p className="text-sm font-medium text-slate-600">
          スクショをドラッグ or タップしてアップロード
        </p>
        <p className="text-xs text-slate-400">PNG, JPG, GIF（最大10枚）</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={`${src.slice(0, 24)}-${i}`} className="group relative">
              <img
                src={src}
                alt={`スクリーンショット ${i + 1}`}
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="画像を削除"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ParamSlider({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 shrink-0 text-center text-base">{icon}</span>
      <span className="w-24 shrink-0 text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="review-range flex-1"
        style={{
          background: `linear-gradient(to right, #6366F1 ${pct}%, #E2E8F0 ${pct}%)`,
        }}
      />
      <span className="w-8 shrink-0 text-right text-sm font-bold text-indigo-600">
        {value}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ReviewForm({ game }: { game: ReviewGameInfo }) {
  const router = useRouter();
  const [mode, setMode] = useState<ReviewMode>("quick");
  const [status, setStatus] = useState<Status | null>(null);
  const [rating, setRating] = useState(0);
  const [playtime, setPlaytime] = useState("");
  const [playtimeUnit, setPlaytimeUnit] = useState<"h" | "min">("h");
  const [review, setReview] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [params, setParams] = useState<Record<string, number>>(DEFAULT_PARAMS);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(game.id));
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        mode?: ReviewMode;
        status?: Status | null;
        rating?: number;
        playtime?: string;
        playtimeUnit?: "h" | "min";
        review?: string;
        spoiler?: boolean;
        params?: Record<string, number>;
      };
      if (draft.mode) setMode(draft.mode);
      if (draft.status) setStatus(draft.status);
      if (typeof draft.rating === "number") setRating(draft.rating);
      if (typeof draft.playtime === "string") setPlaytime(draft.playtime);
      if (draft.playtimeUnit) setPlaytimeUnit(draft.playtimeUnit);
      if (typeof draft.review === "string") setReview(draft.review);
      if (typeof draft.spoiler === "boolean") setSpoiler(draft.spoiler);
      if (draft.params) setParams({ ...DEFAULT_PARAMS, ...draft.params });
    } catch {
      /* ignore invalid draft */
    }
  }, [game.id]);

  const addImage = useCallback((url: string) => {
    setImages((prev) => (prev.length < 10 ? [...prev, url] : prev));
  }, []);

  const removeImage = useCallback((i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const canSubmit = Boolean(rating && status);
  const overallScore =
    mode === "detailed"
      ? Math.round(
          (Object.values(params).reduce((a, b) => a + b, 0) / PARAMS.length) *
            10,
        ) / 10
      : null;

  function saveDraft() {
    localStorage.setItem(
      draftKey(game.id),
      JSON.stringify({
        mode,
        status,
        rating,
        playtime,
        playtimeUnit,
        review,
        spoiler,
        params,
      }),
    );
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitted) return;
    setSubmitted(true);
    localStorage.removeItem(draftKey(game.id));
    window.setTimeout(() => {
      router.push(`/games/${game.id}`);
    }, 1600);
  }

  const platformLabel = game.platforms.join(" • ");
  const genreLabel = game.genre[0] ?? "";

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-full bg-review-bg font-mypage"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/games/${game.id}`}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              ←
            </Link>
            <span className="text-xl">🎮</span>
            <span className="text-sm font-bold text-slate-800">
              レビューを投稿
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("quick")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                mode === "quick"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              ⚡ サクッと
            </button>
            <button
              type="button"
              onClick={() => setMode("detailed")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                mode === "detailed"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              📊 詳細
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 pb-28">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 shadow-md">
            <Image
              src={game.jacket}
              alt={game.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base leading-tight font-bold text-slate-800">
              {game.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {platformLabel}
              {genreLabel ? ` • ${genreLabel}` : ""}
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              編集中
            </span>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Section title="ステータス">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                    status === opt.value
                      ? `${opt.color} scale-105 shadow-sm`
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Section title="総合評価">
            <StarRating value={rating} onChange={setRating} />
          </Section>
          <div className="h-px bg-slate-100" />
          <Section title="プレイ時間">
            <div className="flex items-center gap-2">
              <div className="relative max-w-[140px] flex-1">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={playtime}
                  onChange={(e) => setPlaytime(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-lg font-bold text-slate-800 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="flex overflow-hidden rounded-xl border border-slate-200">
                {(["h", "min"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setPlaytimeUnit(u)}
                    className={`px-3 py-2.5 text-sm font-semibold transition-colors ${
                      playtimeUnit === u
                        ? "bg-indigo-500 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {u === "h" ? "時間" : "分"}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-400">でプレイ</span>
            </div>
          </Section>
        </div>

        {mode === "detailed" ? (
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                多角評価
              </h3>
              {overallScore !== null ? (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                  平均 {overallScore} / 10
                </span>
              ) : null}
            </div>
            <div className="space-y-4">
              {PARAMS.map((p) => (
                <ParamSlider
                  key={p.key}
                  label={p.label}
                  icon={p.icon}
                  value={params[p.key]}
                  onChange={(v) =>
                    setParams((prev) => ({ ...prev, [p.key]: v }))
                  }
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PARAMS.map((p) => {
                const v = params[p.key];
                const level =
                  v >= 8
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : v >= 5
                      ? "border-amber-200 bg-amber-50 text-amber-600"
                      : "border-red-200 bg-red-50 text-red-500";
                return (
                  <div
                    key={p.key}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${level}`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Section title="感想・レビュー">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={
                mode === "quick"
                  ? "ひとこと感想を書こう！（例：無課金でも十分楽しめる！ストーリーが熱い）"
                  : "詳細なレビューを書いてください。\n・無課金での遊びやすさ\n・ゲームボリューム\n・おすすめポイントなど"
              }
              rows={mode === "quick" ? 3 : 6}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{review.length} 文字</span>
              {mode === "quick" ? (
                <button
                  type="button"
                  onClick={() => setMode("detailed")}
                  className="text-xs font-semibold text-indigo-500 transition-colors hover:text-indigo-700"
                >
                  詳細評価を追加 →
                </button>
              ) : null}
            </div>
          </Section>
          <div className="h-px bg-slate-100" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                ネタバレを含む
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                ONにすると折りたたまれて表示されます
              </p>
            </div>
            <div className="flex items-center gap-2">
              {spoiler ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                  ⚠️ ネタバレ
                </span>
              ) : null}
              <Toggle checked={spoiler} onChange={setSpoiler} />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Section title={`スクリーンショット（${images.length}/10）`}>
            <ScreenshotUpload
              images={images}
              onAdd={addImage}
              onRemove={removeImage}
            />
          </Section>
        </div>

        {status || rating > 0 || playtime || review ? (
          <div className="space-y-2 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              投稿プレビュー
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {status ? (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    STATUS_OPTIONS.find((s) => s.value === status)?.color
                  }`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === status)?.emoji}{" "}
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                </span>
              ) : null}
              {rating > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)} {RATING_LABELS[rating]}
                </span>
              ) : null}
              {playtime ? (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  ⏱ {playtime}
                  {playtimeUnit === "h" ? "時間" : "分"}
                </span>
              ) : null}
              {spoiler ? (
                <span className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                  ⚠️ ネタバレあり
                </span>
              ) : null}
              {images.length > 0 ? (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  📷 {images.length}枚
                </span>
              ) : null}
            </div>
            {review ? (
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
                {review}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            type="button"
            onClick={saveDraft}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {draftSaved ? "保存しました" : "下書き保存"}
          </button>
          <button
            type="submit"
            disabled={!canSubmit || submitted}
            className={`flex-[2] rounded-xl py-3 text-sm font-bold transition-all duration-150 ${
              canSubmit
                ? submitted
                  ? "scale-95 bg-emerald-500 text-white"
                  : "bg-indigo-500 text-white shadow-md hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-95"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            {submitted ? "✅ 投稿しました！" : "レビューを投稿する"}
          </button>
        </div>
        {!canSubmit ? (
          <p className="mt-2 text-center text-xs text-slate-400">
            ステータスと評価★を選択してください
          </p>
        ) : null}
      </div>
    </form>
  );
}
