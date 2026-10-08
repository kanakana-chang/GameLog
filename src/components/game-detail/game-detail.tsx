"use client";

import { CoverImage } from "@/components/cover-image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  POST_TAGS,
  REPORT_REASONS,
  STATUSES,
  type GameAxis,
  type GameDetailData,
  type Kink,
  type Post,
  type Review,
} from "./data";
import { EvalRadar } from "./radar-chart";

type TabKey = "reviews" | "board" | "mylog";
type SortKey = "helpful" | "new" | "score";
type LogTab = "time" | "achv" | "shots";
type ReportTarget = { type: "review" | "post"; id: string | number; title: string };

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-[#f0f2fa] px-[9px] py-0.5 text-[10px] font-semibold text-detail-muted">
      {label}
    </span>
  );
}

function F2pBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const bg = score >= 80 ? "#d1fae5" : score >= 60 ? "#fef3c7" : "#fee2e2";
  const label =
    score >= 80 ? "無課金フレンドリー" : score >= 60 ? "一部課金推奨" : "課金圧高め";

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2"
      style={{ background: bg, border: `1.5px solid ${color}44` }}
    >
      <span className="text-lg">{score >= 80 ? "🆓" : score >= 60 ? "💰" : "💸"}</span>
      <div>
        <div className="font-display text-xl font-extrabold leading-none" style={{ color }}>
          {score}
        </div>
        <div className="text-[10px] font-semibold" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function AxisBar({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex w-[110px] shrink-0 items-center gap-1 whitespace-nowrap text-[11px] text-detail-muted">
        {highlight ? <span className="text-[9px] text-detail-green">●</span> : null}
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#eef0f8]">
        <div
          className="h-full rounded-[3px]"
          style={{
            width: `${value}%`,
            background: highlight
              ? "linear-gradient(90deg,#10b981,#34d399)"
              : "linear-gradient(90deg,#ff6b35,#ff9f7a)",
          }}
        />
      </div>
      <span
        className={`min-w-[26px] font-mono text-[11px] font-semibold ${
          highlight ? "text-detail-green" : "text-detail-accent"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function KinkBadge({ kink }: { kink: Kink }) {
  const map = {
    無課金: { color: "#10b981", bg: "#d1fae5" },
    微課金: { color: "#f59e0b", bg: "#fef3c7" },
    重課金: { color: "#ef4444", bg: "#fee2e2" },
  };
  const { color, bg } = map[kink];
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ color, background: bg }}
    >
      {kink}
    </span>
  );
}

function StarRow({ score }: { score: number }) {
  const filled = Math.round(score / 2);
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="text-xs"
          style={{ color: i <= filled ? "#f59e0b" : "#dde0f0" }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  small,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-[10px] bg-gradient-to-br from-detail-accent to-[#ff9158] font-display font-bold text-white shadow-[0_4px_14px_rgba(255,107,53,0.25)] ${
        small ? "px-3.5 py-1.5 text-xs" : "px-5 py-[9px] text-[13px]"
      }`}
    >
      {children}
    </button>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-detail-overlay p-5 backdrop-blur-[4px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl bg-white shadow-[0_20px_60px_rgba(20,24,50,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="閉じる"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-detail-border bg-[#f5f6fa] text-sm text-detail-muted"
    >
      ✕
    </button>
  );
}

function DotMenu({ onReport }: { onReport: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="メニュー"
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-base tracking-widest text-detail-dim hover:border hover:border-detail-border hover:bg-[#f0f2fa]"
      >
        •••
      </button>
      {open ? (
        <div className="absolute top-8 right-0 z-[100] min-w-[140px] overflow-hidden rounded-[10px] border border-detail-border bg-white shadow-[0_8px_24px_rgba(20,24,50,0.12)]">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onReport();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13px] font-semibold text-detail-red hover:bg-detail-red-bg"
          >
            🚩 通報する
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ReviewCard({ r, onReport }: { r: Review; onReport: () => void }) {
  const [exp, setExp] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [vote, setVote] = useState<boolean | null>(null);
  const [helpN, setHelpN] = useState(r.helpful);
  const LIMIT = 130;
  const long = r.body.length > LIMIT;
  const sc =
    r.score >= 8.5
      ? "#ff6b35"
      : r.score >= 7
        ? "#10b981"
        : r.score >= 5
          ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-detail-border bg-white px-5 py-[18px] shadow-[0_2px_8px_rgba(30,40,100,0.05)]">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-base font-extrabold"
          style={{ background: r.avBg, color: r.avC }}
        >
          {r.av}
        </div>
        <div className="flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
            <span className="font-display text-[13px] font-bold text-detail-text">
              {r.user}
            </span>
            <KinkBadge kink={r.kink} />
            <span className="rounded px-[7px] py-px font-mono text-[10px] text-detail-muted bg-[#f0f2fa]">
              {r.platform}
            </span>
            <span className="font-mono text-[10px] text-detail-dim">{r.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRow score={r.score} />
            {r.playTime > 0 ? (
              <span className="font-mono text-[10px] text-detail-dim">
                累計 {r.playTime.toLocaleString()}h
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-[10px] px-2.5 py-1.5 text-right"
            style={{ background: `${sc}15` }}
          >
            <div
              className="font-display text-[26px] leading-none font-black"
              style={{ color: sc }}
            >
              {r.score.toFixed(1)}
            </div>
            <div className="font-mono text-[9px] text-detail-dim">/10</div>
          </div>
          <DotMenu onReport={onReport} />
        </div>
      </div>

      <div className="font-display text-sm leading-snug font-bold text-detail-text">
        {r.title}
      </div>

      <div>
        <p className="m-0 text-[13px] leading-[1.75] text-[#3d4466]">
          {exp || !long ? r.body : `${r.body.slice(0, LIMIT)}…`}
        </p>
        {long ? (
          <button
            type="button"
            onClick={() => setExp(!exp)}
            className="px-0 py-0.5 text-xs font-semibold text-detail-accent"
          >
            {exp ? "閉じる ▲" : "続きを見る ▼"}
          </button>
        ) : null}
      </div>

      {r.spoilerBody ? (
        <div>
          <button
            type="button"
            onClick={() => setSpoiler(!spoiler)}
            className={`inline-flex items-center gap-[5px] rounded-full border px-3 py-[5px] text-[11px] font-semibold ${
              spoiler
                ? "border-detail-accent-bd bg-[#fff3ee] text-detail-accent"
                : "border-detail-border bg-[#f5f6fa] text-detail-dim"
            }`}
          >
            🔒 ネタバレを{spoiler ? "隠す" : "見る"}
          </button>
          {spoiler ? (
            <div className="mt-2 rounded-lg border border-detail-accent-bd bg-[#fff8f5] px-3.5 py-3 text-[13px] leading-[1.75] text-[#7c3a1a]">
              {r.spoilerBody}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f2fa] pt-2.5">
        <div className="flex flex-wrap gap-[5px]">
          {r.tags.map((t) => (
            <Tag key={t} label={`# ${t}`} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-detail-dim">参考になった？</span>
          <button
            type="button"
            onClick={() => {
              if (vote === null) {
                setVote(true);
                setHelpN((n) => n + 1);
              }
            }}
            className={`rounded-full border px-2.5 py-[3px] font-mono text-[11px] font-semibold ${
              vote === true
                ? "border-detail-green bg-detail-green-bg text-detail-green"
                : "border-detail-border bg-[#f8f9fc] text-detail-muted"
            } ${vote === null ? "cursor-pointer" : "cursor-default"}`}
          >
            👍 {helpN}
          </button>
          <button
            type="button"
            onClick={() => {
              if (vote === null) setVote(false);
            }}
            className={`rounded-full border px-2.5 py-[3px] font-mono text-[11px] font-semibold ${
              vote === false
                ? "border-detail-red bg-detail-red-bg text-detail-red"
                : "border-detail-border bg-[#f8f9fc] text-detail-muted"
            } ${vote === null ? "cursor-pointer" : "cursor-default"}`}
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  p,
  gameId,
  onReport,
}: {
  p: Post;
  gameId: string | number;
  onReport: () => void;
}) {
  return (
    <article className="relative overflow-hidden rounded-[14px] border border-detail-border bg-white shadow-[0_1px_4px_rgba(30,40,100,0.04)] transition-all duration-[180ms] hover:border-detail-accent hover:shadow-[0_4px_16px_rgba(255,107,53,0.09)]">
      <Link
        href={`/games/${gameId}/board/${p.id}`}
        className="flex gap-3 py-3.5 pr-12 pl-[18px]"
      >
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] font-display text-[13px] font-extrabold"
          style={{ background: p.avBg, color: p.avC }}
        >
          {p.av}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-[3px] font-display text-sm font-bold text-detail-text">
            {p.title}
          </div>
          <p className="mb-[7px] text-xs leading-relaxed text-detail-muted">
            {p.body}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {p.tags.map((t) => (
              <Tag key={t} label={t} />
            ))}
            <span className="font-mono text-[10px] text-detail-dim">
              {p.user} · {p.date}
            </span>
            <span className="font-mono text-[10px] text-detail-muted">
              💬 {p.replies}
            </span>
            <span className="font-mono text-[10px] text-detail-dim">
              👁 {p.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute top-3.5 right-[18px]">
        <DotMenu onReport={onReport} />
      </div>
    </article>
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
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <Overlay onClose={onClose}>
      {done ? (
        <div className="px-6 py-8 text-center">
          <div className="mb-3 text-5xl">✅</div>
          <div className="mb-2 font-display text-xl font-extrabold text-detail-text">
            通報を受け付けました
          </div>
          <div className="mb-6 text-[13px] leading-relaxed text-detail-muted">
            内容を確認のうえ、適切に対応いたします。
            <br />
            ご協力ありがとうございました。
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] bg-detail-accent px-7 py-2.5 font-display text-sm font-bold text-white"
          >
            閉じる
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-[22px] pt-5">
            <div>
              <div className="font-display text-lg font-extrabold text-detail-text">
                🚩 通報する
              </div>
              <div className="mt-0.5 text-xs text-detail-muted">
                {target.type === "review" ? "レビュー" : "掲示板トピック"}:{" "}
                {target.title.slice(0, 24)}
                {target.title.length > 24 ? "…" : ""}
              </div>
            </div>
            <CloseBtn onClick={onClose} />
          </div>

          <div className="flex flex-col gap-2.5 px-[22px] pt-4 pb-[22px]">
            <div className="mb-1 text-xs text-detail-muted">
              通報理由を選択してください（必須）
            </div>
            {REPORT_REASONS.map((r) => {
              const on = selected === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setSelected(r.key)}
                  className={`flex items-center gap-3 rounded-[10px] border-[1.5px] px-3.5 py-3 text-left ${
                    on
                      ? "border-detail-accent bg-detail-accent-bg"
                      : "border-detail-border bg-[#fafbff]"
                  }`}
                >
                  <div
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                      on ? "border-detail-accent" : "border-detail-dim"
                    }`}
                  >
                    {on ? (
                      <div className="h-2 w-2 rounded-full bg-detail-accent" />
                    ) : null}
                  </div>
                  <span
                    className={`text-[13px] ${
                      on ? "font-semibold text-detail-accent" : "text-detail-text"
                    }`}
                  >
                    {r.label}
                  </span>
                </button>
              );
            })}

            <div className="mt-1">
              <div className="mb-1.5 text-xs text-detail-muted">補足（任意）</div>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="詳細があれば入力してください…"
                className="min-h-[72px] w-full resize-y rounded-lg border border-detail-border bg-[#fafbff] px-3 py-2.5 text-[13px] text-detail-text outline-none"
              />
            </div>

            <div className="mt-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] border border-detail-border bg-white px-[18px] py-[9px] font-display text-[13px] font-semibold text-detail-muted"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!selected}
                onClick={() => {
                  if (selected) setDone(true);
                }}
                className={`rounded-[10px] px-5 py-[9px] font-display text-[13px] font-bold text-white ${
                  selected ? "bg-detail-red" : "cursor-default bg-[#dde0f0]"
                }`}
              >
                通報する
              </button>
            </div>
          </div>
        </>
      )}
    </Overlay>
  );
}

function NewPostModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (p: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selTags, setSelTags] = useState<string[]>([]);
  const valid = title.trim().length > 0 && body.trim().length > 0;

  function toggleTag(t: string) {
    setSelTags((prev) =>
      prev.includes(t)
        ? prev.filter((x) => x !== t)
        : prev.length < 3
          ? [...prev, t]
          : prev,
    );
  }

  function submit() {
    if (!valid) return;
    onSubmit({
      id: Date.now(),
      user: "あなた",
      av: "あ",
      avBg: "#fff3ee",
      avC: "#ff6b35",
      date: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      body: body.trim(),
      replies: 0,
      views: 1,
      tags: selTags,
    });
    onClose();
  }

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between px-[22px] pt-5">
        <div className="font-display text-lg font-extrabold text-detail-text">
          ✏️ 新規トピック投稿
        </div>
        <CloseBtn onClick={onClose} />
      </div>

      <div className="flex flex-col gap-3.5 px-[22px] pt-4 pb-[22px]">
        <div>
          <label className="mb-1.5 block text-xs text-detail-muted">
            タイトル <span className="text-detail-red">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="例：攻略法や感想など、話題のタイトルを入力"
            className="w-full rounded-lg border border-detail-border bg-[#fafbff] px-3 py-2.5 text-[13px] text-detail-text outline-none"
          />
          <div className="mt-[3px] text-right font-mono text-[10px] text-detail-dim">
            {title.length}/60
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-detail-muted">
            本文 <span className="text-detail-red">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={1000}
            placeholder="トピックの詳細を入力してください…"
            className="min-h-[120px] w-full resize-y rounded-lg border border-detail-border bg-[#fafbff] px-3 py-2.5 text-[13px] text-detail-text outline-none"
          />
          <div className="mt-[3px] text-right font-mono text-[10px] text-detail-dim">
            {body.length}/1000
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-detail-muted">タグ（最大3つ）</label>
          <div className="flex flex-wrap gap-1.5">
            {POST_TAGS.map((t) => {
              const on = selTags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full border-[1.5px] px-3 py-1 text-[11px] ${
                    on
                      ? "border-detail-accent bg-detail-accent-bg font-bold text-detail-accent"
                      : "border-detail-border bg-white text-detail-muted"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-detail-border pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-detail-border bg-white px-[18px] py-[9px] font-display text-[13px] font-semibold text-detail-muted"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className={`rounded-[10px] px-[22px] py-[9px] font-display text-[13px] font-bold text-white ${
              valid
                ? "bg-gradient-to-br from-detail-accent to-[#ff9158] shadow-[0_4px_14px_rgba(255,107,53,0.25)]"
                : "cursor-default bg-[#dde0f0]"
            }`}
          >
            投稿する
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Toast({ msg, onEnd }: { msg: string; onEnd: () => void }) {
  useEffect(() => {
    const t = setTimeout(onEnd, 3000);
    return () => clearTimeout(t);
  }, [onEnd]);

  return (
    <div className="fixed bottom-7 left-1/2 z-[2000] -translate-x-1/2 whitespace-nowrap rounded-[30px] bg-detail-text px-[22px] py-3 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(20,24,50,0.2)]">
      {msg}
    </div>
  );
}

export function GameDetail({ detail }: { detail: GameDetailData }) {
  const [status, setStatus] = useState<string | null>("playing");
  const [tab, setTab] = useState<TabKey>("reviews");
  const [sort, setSort] = useState<SortKey>("helpful");
  const [f2pOnly, setF2pOnly] = useState(false);
  const [platform, setPlatform] = useState("all");
  const [logTab, setLogTab] = useState<LogTab>("time");
  const [posts, setPosts] = useState<Post[]>(detail.posts);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const platforms = ["all", ...detail.platforms];
  const filtR = detail.reviews.filter(
    (r) =>
      (!f2pOnly || r.f2p) && (platform === "all" || r.platform === platform),
  );
  const sortR = [...filtR].sort((a, b) =>
    sort === "helpful"
      ? b.helpful - a.helpful
      : sort === "score"
        ? b.score - a.score
        : new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const maxDist = Math.max(1, ...detail.scoreDist.map((d) => d.count), 0);
  const f2pShare = detail.reviews.length
    ? Math.round(
        (detail.reviews.filter((r) => r.f2p).length / detail.reviews.length) *
          100,
      )
    : 0;

  return (
    <div className="min-h-full bg-detail-bg font-body">
      <div className="relative h-60 overflow-hidden">
        <CoverImage
          src={detail.coverWide}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover brightness-[0.6] saturate-90"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 10%, #f5f6fa 100%)",
          }}
        />
        <Link
          href="/games"
          className="absolute top-4 left-5 whitespace-nowrap rounded-lg border border-white/30 bg-white/15 px-3 py-[5px] text-xs text-white backdrop-blur-[6px]"
        >
          ← ゲーム一覧
        </Link>
        <div className="absolute top-4 right-5 flex gap-1.5">
          {detail.genre.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/20 px-2.5 py-[3px] text-[10px] font-semibold text-white backdrop-blur-[6px]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1060px] px-[18px] pb-20">
        <div className="relative z-10 mt-[-80px] grid grid-cols-1 gap-[22px] min-[540px]:grid-cols-[120px_1fr] min-[860px]:grid-cols-[148px_1fr]">
          <div className="relative mx-auto aspect-[320/440] w-[148px] overflow-hidden rounded-[14px] border-[3px] border-white shadow-[0_12px_36px_rgba(30,40,100,0.15)] min-[540px]:mx-0 min-[540px]:w-full">
            <CoverImage
              src={detail.jacket}
              alt={detail.title}
              fill
              sizes="148px"
              className="object-cover"
            />
          </div>
          <div className="pt-0 min-[540px]:pt-11">
            <h1 className="mb-0.5 font-display text-[30px] leading-tight font-black tracking-[-0.3px] text-detail-text">
              {detail.title}
            </h1>
            <div className="mb-3 text-xs text-detail-muted">{detail.developer}</div>
            <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-[7px]">
              {[
                { l: "対応OS", v: detail.platforms.join(" / ") },
                { l: "価格", v: detail.priceLabel },
                { l: "発売日", v: detail.releaseDate },
                { l: "年齢", v: detail.ageRating },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  className="rounded-lg border border-detail-border bg-white px-2.5 py-[7px] shadow-[0_1px_3px_rgba(30,40,100,0.04)]"
                >
                  <div className="mb-0.5 font-mono text-[9px] tracking-[0.06em] text-detail-dim uppercase">
                    {l}
                  </div>
                  <div className="text-[11px] font-semibold text-detail-text">{v}</div>
                </div>
              ))}
            </div>
            <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
              <F2pBadge score={detail.f2pScore} />
              <div className="flex flex-col gap-[3px]">
                <div className="text-[11px] text-detail-muted">
                  💳 {detail.monetization.monthly}
                </div>
                <div className="text-[11px] text-detail-muted">
                  🎰 {detail.monetization.ceiling}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {STATUSES.map((s) => {
                const on = status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(on ? null : s.key)}
                    className="flex items-center gap-[5px] rounded-[10px] px-4 py-2 font-display text-[13px] font-bold"
                    style={{
                      border: `2px solid ${on ? s.color : "#e4e6f0"}`,
                      background: on ? s.bg : "#fff",
                      color: on ? s.color : "#5a6080",
                      boxShadow: on
                        ? `0 3px 10px ${s.color}30`
                        : "0 1px 3px rgba(30,40,100,0.06)",
                    }}
                  >
                    {s.icon} {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {detail.summary ? (
          <div className="mt-6 rounded-[14px] border border-detail-border bg-white px-5 py-[18px] shadow-[0_2px_8px_rgba(30,40,100,0.05)]">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <div className="font-mono text-[9px] tracking-[0.1em] text-detail-dim uppercase">
                ゲーム概要
              </div>
              {detail.detailsGenerated ? (
                <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-semibold text-[#4F46E5]">
                  公開情報から整理
                </span>
              ) : null}
            </div>
            <p className="text-[13px] leading-relaxed text-detail-text whitespace-pre-wrap">
              {detail.summary}
            </p>
            {detail.sources?.length ? (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-detail-dim">
                <span>出典</span>
                {detail.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-[#c8cadb] underline-offset-2 hover:text-detail-text"
                  >
                    {source.title}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 min-[860px]:grid-cols-3">
          <ScoreCard detail={detail} maxDist={maxDist} />
          <RadarCard axes={detail.axes} />
          <PlayTimeCard detail={detail} f2pShare={f2pShare} />
        </div>

        <div className="mt-7 flex border-b-2 border-detail-border">
          {(
            [
              { key: "reviews", label: `レビュー (${detail.totalReviews.toLocaleString()})` },
              { key: "board", label: `掲示板 (${posts.length})` },
              { key: "mylog", label: "📂 マイ記録" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-0.5 whitespace-nowrap border-b-[2.5px] px-[22px] py-[11px] font-display text-[13px] font-bold ${
                tab === t.key
                  ? "border-detail-accent text-detail-text"
                  : "border-transparent text-detail-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "reviews" ? (
          <div className="mt-[18px]">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["helpful", "new", "score"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSort(s)}
                    className={`rounded-full border px-3 py-[5px] text-[11px] ${
                      sort === s
                        ? "border-detail-accent bg-detail-accent-bg font-bold text-detail-accent"
                        : "border-detail-border bg-white text-detail-muted"
                    }`}
                  >
                    {s === "helpful" ? "参考順" : s === "new" ? "新着" : "スコア順"}
                  </button>
                ))}
                {platforms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`rounded-full border px-[11px] py-[5px] font-mono text-[10px] ${
                      platform === p
                        ? "border-detail-green bg-detail-green-bg font-bold text-detail-green"
                        : "border-detail-border bg-white text-detail-muted"
                    }`}
                  >
                    {p === "all" ? "全OS" : p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setF2pOnly(!f2pOnly)}
                  className={`flex items-center gap-1 rounded-full border-[1.5px] px-3 py-[5px] text-[11px] ${
                    f2pOnly
                      ? "border-detail-green bg-detail-green-bg font-bold text-detail-green"
                      : "border-detail-border bg-white text-detail-muted"
                  }`}
                >
                  🆓 {f2pOnly ? "無課金のみ表示中" : "無課金のみ表示"}
                </button>
              </div>
              <Link
                href={`/games/${detail.id}/review`}
                className="shrink-0 rounded-[10px] bg-gradient-to-br from-detail-accent to-[#ff9158] px-5 py-[9px] font-display text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(255,107,53,0.25)]"
              >
                + レビューを書く
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {sortR.length ? (
                sortR.map((r) => (
                  <ReviewCard
                    key={r.id}
                    r={r}
                    onReport={() =>
                      setReportTarget({ type: "review", id: r.id, title: r.title })
                    }
                  />
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-detail-border bg-white px-5 py-10 text-center text-[13px] text-detail-muted">
                  まだレビューはありません。最初のレビューを書いてみましょう。
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "board" ? (
          <div className="mt-[18px]">
            <div className="mb-3.5 flex justify-end">
              <PrimaryBtn onClick={() => setShowNewPost(true)}>+ 新規投稿</PrimaryBtn>
            </div>
            <div className="flex flex-col gap-2.5">
              {posts.length ? (
                posts.map((p) => (
                  <PostCard
                    key={p.id}
                    p={p}
                    gameId={detail.id}
                    onReport={() =>
                      setReportTarget({ type: "post", id: p.id, title: p.title })
                    }
                  />
                ))
              ) : (
                <div className="rounded-[14px] border border-dashed border-detail-border bg-white px-5 py-10 text-center text-[13px] text-detail-muted">
                  まだ掲示板の投稿はありません。
                </div>
              )}
            </div>
          </div>
        ) : null}

        {tab === "mylog" ? (
          <MyLog
            detail={detail}
            logTab={logTab}
            setLogTab={setLogTab}
            onToast={setToast}
          />
        ) : null}
      </div>

      {reportTarget ? (
        <ReportModal
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      ) : null}
      {showNewPost ? (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={(p) => {
            setPosts((prev) => [p, ...prev]);
            setToast("トピックを投稿しました！");
          }}
        />
      ) : null}
      {toast ? <Toast msg={toast} onEnd={() => setToast(null)} /> : null}
    </div>
  );
}

function ScoreCard({
  detail,
  maxDist,
}: {
  detail: GameDetailData;
  maxDist: number;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-detail-border bg-white px-5 py-[18px] shadow-[0_2px_8px_rgba(30,40,100,0.05)]">
      <div className="font-mono text-[9px] tracking-[0.1em] text-detail-dim uppercase">
        総合スコア
      </div>
      <div className="flex items-end gap-1.5">
        <div className="font-display text-[56px] leading-none font-black text-detail-accent">
          {detail.avgScore}
        </div>
        <div className="mb-[5px] font-mono text-sm text-detail-dim">/10</div>
      </div>
      <div className="text-[11px] text-detail-muted">
        {detail.detailsGenerated
          ? "公開情報からの推定"
          : `${detail.totalReviews.toLocaleString()} 件のレビュー`}
      </div>
      {detail.scoreDist.length ? (
        <div className="flex flex-col gap-1">
          {detail.scoreDist.map((d) => (
            <div key={d.label} className="flex items-center gap-[7px]">
              <span className="w-[26px] shrink-0 text-right font-mono text-[10px] text-detail-muted">
                {d.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#f0f2fa]">
                <div
                  className="h-full rounded-[3px] bg-detail-accent opacity-55"
                  style={{ width: `${(d.count / maxDist) * 100}%` }}
                />
              </div>
              <span className="min-w-7 text-right font-mono text-[10px] text-detail-dim">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-[7px] border-t border-[#f0f2fa] pt-3">
        {detail.axes.map((a) => (
          <AxisBar
            key={a.key}
            label={a.label}
            value={a.value}
            highlight={a.key === "f2p" || a.key === "kinka"}
          />
        ))}
      </div>
    </div>
  );
}

function RadarCard({ axes }: { axes: GameAxis[] }) {
  return (
    <div className="flex flex-col rounded-[14px] border border-detail-border bg-white px-5 py-[18px] shadow-[0_2px_8px_rgba(30,40,100,0.05)]">
      <div className="mb-1.5 font-mono text-[9px] tracking-[0.1em] text-detail-dim uppercase">
        多角評価レーダー
      </div>
      <div className="mb-1.5 text-[10px] font-semibold text-detail-green">
        🟢 緑軸 = 無課金関連
      </div>
      <EvalRadar axes={axes} />
      <div className="mt-1.5 flex flex-col gap-1">
        {axes.map((a) => (
          <div
            key={a.key}
            className={`flex items-center justify-between rounded-md px-2 py-1 ${
              a.key === "f2p" || a.key === "kinka" ? "bg-[#f0fdf4]" : "bg-[#f8f9fc]"
            }`}
          >
            <span
              className={`text-[11px] ${
                a.key === "f2p" || a.key === "kinka"
                  ? "text-detail-green"
                  : "text-detail-muted"
              }`}
            >
              {a.label}
            </span>
            <span
              className={`font-mono text-[11px] font-bold ${
                a.key === "f2p" || a.key === "kinka"
                  ? "text-detail-green"
                  : "text-detail-accent"
              }`}
            >
              {a.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayTimeCard({
  detail,
  f2pShare,
}: {
  detail: GameDetailData;
  f2pShare: number;
}) {
  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-detail-border bg-white px-5 py-[18px] shadow-[0_2px_8px_rgba(30,40,100,0.05)]">
      <div className="font-mono text-[9px] tracking-[0.1em] text-detail-dim uppercase">
        平均プレイ時間
      </div>
      <div className="flex items-end gap-1.5">
        <div className="font-display text-5xl leading-none font-black text-detail-green">
          {detail.avgPlayTime}
        </div>
        <div className="mb-1 font-mono text-base text-detail-dim">時間</div>
      </div>
      <div className="text-[11px] text-detail-muted">
        {detail.detailsGenerated
          ? "公開情報からの推定プレイ時間"
          : `${detail.totalReviews.toLocaleString()} 件より`}
      </div>
      <div className="flex flex-col gap-2 rounded-[10px] bg-[#f8f9fc] px-3.5 py-3">
        <div className="mb-0.5 font-display text-xs font-bold text-detail-text">
          💰 課金情報
        </div>
        {[
          { l: "課金モデル", v: detail.monetization.type },
          { l: "月額パス", v: detail.monetization.monthly },
          { l: "天井・ガチャ", v: detail.monetization.ceiling },
        ].map(({ l, v }) => (
          <div key={l} className="flex justify-between gap-2">
            <span className="shrink-0 text-[11px] text-detail-dim">{l}</span>
            <span className="text-right text-[11px] font-medium text-detail-text">
              {v}
            </span>
          </div>
        ))}
      </div>
      {detail.reviews.length ? (
        <div className="rounded-lg border-l-[3px] border-detail-green bg-detail-green-bg px-3 py-2.5">
          <div className="text-[11px] font-semibold text-[#065f46]">無課金ユーザーの声</div>
          <div className="mt-0.5 text-[11px] text-[#047857]">
            レビューの {f2pShare}% が「無課金でプレイ」と回答
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MyLog({
  detail,
  logTab,
  setLogTab,
  onToast,
}: {
  detail: GameDetailData;
  logTab: LogTab;
  setLogTab: (t: LogTab) => void;
  onToast: (msg: string) => void;
}) {
  return (
    <div className="mt-[18px]">
      <div className="mb-4 flex gap-1.5">
        {(
          [
            { k: "time", label: "⏱ プレイ時間" },
            { k: "achv", label: "🏆 クリア実績" },
            { k: "shots", label: "📸 スクショ" },
          ] as const
        ).map((lt) => (
          <button
            key={lt.k}
            type="button"
            onClick={() => setLogTab(lt.k)}
            className={`rounded-full border-[1.5px] px-4 py-[7px] font-display text-xs font-bold ${
              logTab === lt.k
                ? "border-detail-accent bg-detail-accent-bg text-detail-accent"
                : "border-detail-border bg-white text-detail-muted"
            }`}
          >
            {lt.label}
          </button>
        ))}
      </div>
      {logTab === "time" ? (
        <div className="grid grid-cols-1 gap-3 min-[860px]:grid-cols-3">
          {[
            {
              icon: "⏱",
              label: "総プレイ時間",
              val: `${detail.myRecord.playTime}h`,
              sub: "本作の累計",
              color: "#ff6b35",
            },
            {
              icon: "📅",
              label: "プレイ回数",
              val: `${detail.myRecord.sessions}回`,
              sub: "セッション数",
              color: "#10b981",
            },
            {
              icon: "📊",
              label: "平均との差",
              val: `+${detail.myRecord.playTime - detail.avgPlayTime}h`,
              sub: "全ユーザー比",
              color: "#8b5cf6",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[14px] border border-detail-border bg-white px-[22px] py-5 shadow-[0_2px_8px_rgba(30,40,100,0.05)]"
            >
              <div className="mb-2 text-[28px]">{item.icon}</div>
              <div
                className="font-display text-4xl leading-none font-black"
                style={{ color: item.color }}
              >
                {item.val}
              </div>
              <div className="mt-1 text-xs text-detail-muted">{item.label}</div>
              <div className="mt-0.5 text-[11px] text-detail-dim">{item.sub}</div>
            </div>
          ))}
        </div>
      ) : null}
      {logTab === "achv" ? (
        <div className="flex flex-col gap-2.5">
          {detail.myRecord.achievements.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-3.5 rounded-xl border border-detail-border bg-white px-[18px] py-3.5 shadow-[0_1px_4px_rgba(30,40,100,0.04)]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-detail-yellow-bg text-[22px]">
                {a.icon}
              </div>
              <div className="flex-1">
                <div className="font-display text-sm font-bold text-detail-text">
                  {a.label}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-detail-dim">
                  達成日: {a.date}
                </div>
              </div>
              <div className="rounded-full border border-[#fcd34d] bg-detail-yellow-bg px-2.5 py-1 text-[10px] font-bold text-detail-yellow">
                達成済み ✓
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onToast("実績の記録は準備中です")}
            className="rounded-xl border-2 border-dashed border-detail-border py-3 font-display text-[13px] font-semibold text-detail-dim"
          >
            + 実績を記録する
          </button>
        </div>
      ) : null}
      {logTab === "shots" ? (
        <div>
          <div className="mb-3.5 flex items-center justify-between">
            <div className="font-display text-sm font-bold text-detail-text">
              保存済みスクショ {detail.myRecord.screenshotCount}枚
            </div>
            <PrimaryBtn onClick={() => onToast("スクリーンショット追加は準備中です")}>
              + 追加
            </PrimaryBtn>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {detail.screenshots.map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-detail-border bg-[#f0f2fa] transition-transform duration-[180ms] hover:scale-[1.02]"
                >
                  <CoverImage
                    src={src}
                    alt={`screenshot-${i + 1}`}
                    fill
                    sizes="(max-width: 860px) 33vw, 330px"
                    className="object-cover"
                  />
                </div>
            ))}
            <button
              type="button"
              onClick={() => onToast("スクリーンショット追加は準備中です")}
              className="flex aspect-video cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-detail-border bg-[#fafbff] font-display text-[22px] font-bold text-detail-dim"
            >
              +
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
