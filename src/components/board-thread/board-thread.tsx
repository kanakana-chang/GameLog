"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Post } from "@/components/game-detail/data";
import {
  CURRENT_USER,
  THREAD_REPLIES,
  THREAD_REPORT_REASONS,
  type ThreadReply,
} from "./data";

type ReportTarget =
  | { type: "thread"; label: string }
  | { type: "reply"; id: number; label: string };

function AvatarBadge({
  initials,
  color,
  size = "md",
}: {
  initials: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
        size === "sm" ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-[13px]"
      }`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

function SpoilerBlock({
  children,
  image,
}: {
  children: React.ReactNode;
  image?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div className="relative">
        <div className="text-sm leading-relaxed text-[#1a1a2e]">{children}</div>
        {image ? (
          <div className="mt-2 overflow-hidden rounded-lg bg-[#e8e8f0]">
            <Image
              src={image}
              alt="添付スクショ"
              width={600}
              height={340}
              className="max-h-56 w-full object-cover"
            />
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setRevealed(false)}
          className="mt-1 text-[11px] text-[#6b6b8a] underline underline-offset-2 transition-colors hover:text-[#5b4cf5]"
        >
          ネタバレを隠す
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="group flex w-full items-center gap-2 rounded-lg border border-[#d4d0ff] bg-[#f0efff] px-3 py-2 text-left transition-colors hover:bg-[#e4e0ff]"
    >
      <span className="text-base">🔒</span>
      <span className="text-sm font-medium text-[#3d3583] transition-colors group-hover:text-[#5b4cf5]">
        ネタバレあり — タップで表示
      </span>
    </button>
  );
}

function MenuButton({ onReport }: { onReport: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="メニューを開く"
        className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] leading-none text-[#aaaacc] transition-colors hover:bg-[#f0efff] hover:text-[#6b6b8a]"
      >
        ···
      </button>
      {open ? (
        <div className="absolute top-8 right-0 z-50 w-44 rounded-xl border border-[#e2e2ee] bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onReport();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#e53e3e] transition-colors hover:bg-[#fff5f5]"
          >
            <span>🚩</span>
            <span>通報する</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ReportModal({
  target,
  onClose,
}: {
  target: ReportTarget;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    window.setTimeout(() => onClose(), 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 backdrop-blur-[2px] sm:items-center sm:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full overflow-hidden rounded-t-2xl border border-[#e2e2ee] bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#f0efff] px-5 pt-5 pb-3">
          <div>
            <h2 className="font-display text-[15px] font-bold text-[#1a1a2e]">
              🚩 通報する
            </h2>
            <p className="mt-0.5 max-w-[260px] truncate text-[11px] text-[#6b6b8a]">
              対象: {target.label}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[18px] text-[#aaaacc] transition-colors hover:bg-[#f5f5f7]"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0efff] text-2xl">
              ✅
            </div>
            <p className="text-[14px] font-semibold text-[#1a1a2e]">
              通報を受け付けました
            </p>
            <p className="px-6 text-center text-[12px] text-[#6b6b8a]">
              モデレーターが内容を確認し、対応します。
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 px-5 py-4">
              <p className="mb-3 text-[12px] text-[#6b6b8a]">
                通報理由を選択してください
              </p>
              {THREAD_REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelected(reason.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    selected === reason.id
                      ? "border-[#5b4cf5] bg-[#f0efff] text-[#3d3583]"
                      : "border-[#e2e2ee] bg-[#fafafa] text-[#1a1a2e] hover:border-[#c8c5f5] hover:bg-[#f8f7ff]"
                  }`}
                >
                  <span className="shrink-0 text-base">{reason.icon}</span>
                  <span className="text-[13px] leading-snug font-medium">
                    {reason.label}
                  </span>
                  {selected === reason.id ? (
                    <span className="ml-auto text-[16px] text-[#5b4cf5]">●</span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex gap-2 px-5 pt-2 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-[#e2e2ee] py-2.5 text-[13px] font-medium text-[#6b6b8a] transition-colors hover:bg-[#f5f5f7]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selected}
                className="flex-1 rounded-full bg-[#e53e3e] py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#c53030] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                通報する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ReplyCard({
  reply,
  onLike,
  onReport,
}: {
  reply: ThreadReply;
  onLike: (id: number) => void;
  onReport: (target: ReportTarget) => void;
}) {
  return (
    <div className="rounded-xl border border-[#e2e2ee] bg-white p-4 transition-colors hover:border-[#c8c5f5]">
      <div className="flex items-start gap-3">
        <AvatarBadge initials={reply.avatar} color={reply.color} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#1a1a2e]">
              {reply.userName}
            </span>
            {reply.userId && reply.userId !== reply.userName ? (
              <span className="font-mono text-[11px] text-[#6b6b8a]">
                {reply.userId}
              </span>
            ) : null}
            <span className="ml-auto text-[11px] text-[#6b6b8a]">
              {reply.timestamp}
            </span>
            <MenuButton
              onReport={() =>
                onReport({
                  type: "reply",
                  id: reply.id,
                  label: `${reply.userName} のレス`,
                })
              }
            />
          </div>

          {reply.isSpoiler ? (
            <SpoilerBlock image={reply.image}>{reply.content}</SpoilerBlock>
          ) : (
            <div>
              <p className="text-sm leading-relaxed text-[#1a1a2e]">
                {reply.content}
              </p>
              {reply.image ? (
                <div className="mt-2 overflow-hidden rounded-lg bg-[#e8e8f0]">
                  <Image
                    src={reply.image}
                    alt="添付スクショ"
                    width={600}
                    height={340}
                    className="max-h-56 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onLike(reply.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95 ${
                reply.likedByMe
                  ? "bg-[#ff6b6b] text-white shadow-sm"
                  : "bg-[#f5f5f7] text-[#6b6b8a] hover:bg-[#ffe4e4] hover:text-[#ff6b6b]"
              }`}
            >
              <span>{reply.likedByMe ? "❤️" : "🤍"}</span>
              <span>{reply.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BoardThread({
  gameId,
  gameTitle,
  post,
}: {
  gameId: number;
  gameTitle: string;
  post: Post;
}) {
  const [replies, setReplies] = useState<ThreadReply[]>(() => [
    {
      id: 0,
      userId: post.user,
      userName: post.user,
      avatar: post.av,
      color: post.avC,
      content: post.body,
      isSpoiler: false,
      likes: 12,
      likedByMe: false,
      timestamp: `${post.date} 12:00`,
    },
    ...THREAD_REPLIES,
  ]);
  const [draft, setDraft] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLike(id: number) {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              likedByMe: !r.likedByMe,
              likes: r.likedByMe ? r.likes - 1 : r.likes + 1,
            }
          : r,
      ),
    );
  }

  function handlePost() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setReplies((prev) => [
      ...prev,
      {
        id: Date.now(),
        userId: CURRENT_USER.id,
        userName: CURRENT_USER.name,
        avatar: CURRENT_USER.avatar,
        color: CURRENT_USER.color,
        content: text,
        isSpoiler,
        likes: 0,
        likedByMe: false,
        timestamp: ts,
        image: attachedImage ?? undefined,
      },
    ]);
    setDraft("");
    setIsSpoiler(false);
    setAttachedImage(null);
  }

  return (
    <div className="min-h-full bg-thread-bg font-mypage text-[#1a1a2e]">
      <header className="shrink-0 border-b border-[#e2e2ee] bg-white px-4 pt-4 pb-3">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/games/${gameId}`}
              className="text-[12px] text-[#6b6b8a] transition-colors hover:text-[#5b4cf5]"
            >
              掲示板
            </Link>
            <span className="text-[12px] text-[#c8c8e0]">/</span>
            <Link
              href={`/games/${gameId}`}
              className="text-[12px] text-[#6b6b8a] transition-colors hover:text-[#5b4cf5]"
            >
              {gameTitle}
            </Link>
            <span className="text-[12px] text-[#c8c8e0]">/</span>
            <span className="text-[12px] font-medium text-[#1a1a2e]">
              スレッド #{post.id}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <h1 className="flex-1 font-display text-[18px] leading-snug font-bold text-[#1a1a2e]">
              {post.title}
            </h1>
            <MenuButton
              onReport={() =>
                setReportTarget({
                  type: "thread",
                  label:
                    post.title.length > 24
                      ? `${post.title.slice(0, 24)}…`
                      : post.title,
                })
              }
            />
          </div>
          <div className="mt-2 flex items-center gap-3">
            {post.tags.map((tag, i) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  i === 0
                    ? "bg-[#f0efff] text-[#5b4cf5]"
                    : "bg-[#fff0f0] text-[#ff6b6b]"
                }`}
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto text-[12px] text-[#6b6b8a]">
              {replies.length} レス
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-64">
        {replies.map((reply) => (
          <ReplyCard
            key={reply.id}
            reply={reply}
            onLike={handleLike}
            onReport={setReportTarget}
          />
        ))}
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[#e2e2ee] bg-white px-4 pt-3 pb-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center gap-2">
            <AvatarBadge
              initials={CURRENT_USER.avatar}
              color={CURRENT_USER.color}
              size="sm"
            />
            <span className="text-[12px] font-semibold text-[#1a1a2e]">
              {CURRENT_USER.name}
            </span>
            <span className="font-mono text-[11px] text-[#6b6b8a]">
              {CURRENT_USER.id}
            </span>
            <span className="ml-auto text-[11px] text-[#6b6b8a]">
              アカウント連携済み
            </span>
          </div>

          {attachedImage ? (
            <div className="relative mb-2 inline-block">
              {/* data URL preview */}
              <img
                src={attachedImage}
                alt="添付プレビュー"
                className="h-20 rounded-lg border border-[#e2e2ee] object-cover"
              />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                aria-label="添付を削除"
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6b6b] text-[10px] font-bold text-white transition-colors hover:bg-[#e55]"
              >
                ✕
              </button>
            </div>
          ) : null}

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="レスを入力… (匿名投稿は不可、アカウント紐づけ必須)"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e2e2ee] bg-[#f5f5f7] px-3 py-2.5 text-sm text-[#1a1a2e] placeholder-[#aaaacc] transition outline-none focus:border-[#5b4cf5] focus:ring-2 focus:ring-[#5b4cf5]/20"
          />

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSpoiler((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${
                isSpoiler
                  ? "border-[#c8c5f5] bg-[#f0efff] text-[#5b4cf5]"
                  : "border-[#e2e2ee] bg-[#f5f5f7] text-[#6b6b8a] hover:border-[#c8c5f5]"
              }`}
            >
              🔒 ネタバレ{isSpoiler ? "あり" : ""}
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={Boolean(attachedImage)}
              className="flex items-center gap-1.5 rounded-full border border-[#e2e2ee] bg-[#f5f5f7] px-3 py-1.5 text-[12px] font-medium text-[#6b6b8a] transition-all hover:border-[#c8c5f5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              📷 スクショ添付
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) =>
                  setAttachedImage(ev.target?.result as string);
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />

            <button
              type="button"
              onClick={handlePost}
              disabled={!draft.trim()}
              className="ml-auto rounded-full bg-[#5b4cf5] px-5 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-[#4a3de0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              投稿
            </button>
          </div>
        </div>
      </div>

      {reportTarget ? (
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      ) : null}
    </div>
  );
}
