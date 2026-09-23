"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  ADMIN_GENRES,
  ADMIN_PLATFORMS,
  INITIAL_GAMES,
  INITIAL_REPORTS,
  PLATFORM_COLORS,
  REASON_COLORS,
  REASON_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type AdminGame,
  type AdminNav,
  type AdminReport,
  type Genre,
  type Platform,
  type ReportReason,
  type ReportStatus,
} from "./data";

function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-medium ${STATUS_COLORS[status] ?? "border-slate-200 bg-slate-100 text-slate-500"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function PlatformPill({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${PLATFORM_COLORS[platform] ?? "border-slate-200 bg-slate-100 text-slate-500"}`}
    >
      {platform}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </span>
      <span
        className={`font-display text-3xl font-bold tracking-tight ${color ?? "text-slate-900"}`}
      >
        {value}
      </span>
      {sub ? <span className="text-xs text-slate-400">{sub}</span> : null}
    </div>
  );
}

function GameForm({
  game,
  onSave,
  onCancel,
}: {
  game: Partial<AdminGame> | null;
  onSave: (g: AdminGame) => void;
  onCancel: () => void;
}) {
  const empty: Partial<AdminGame> = {
    title: "",
    platform: [],
    genre: "Action",
    releaseYear: 2024,
    developer: "",
    freeToPlay: false,
    hasCurrency: false,
    avgPlaytime: 0,
    coverUrl: "",
    status: "active",
  };
  const [form, setForm] = useState<Partial<AdminGame>>({
    ...empty,
    ...(game ?? {}),
  });

  function togglePlatform(p: Platform) {
    const cur = form.platform ?? [];
    setForm({
      ...form,
      platform: cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString().split("T")[0];
    onSave({
      id: form.id ?? `g${Date.now()}`,
      title: form.title!,
      platform: form.platform ?? [],
      genre: form.genre!,
      releaseYear: form.releaseYear!,
      developer: form.developer!,
      freeToPlay: form.freeToPlay!,
      hasCurrency: form.hasCurrency!,
      avgPlaytime: form.avgPlaytime!,
      coverUrl: form.coverUrl ?? "",
      status: form.status!,
      addedAt: form.addedAt ?? now,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-6 py-5">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {game?.id ? "ゲーム情報を編集" : "ゲームを新規追加"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="閉じる"
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              ゲームタイトル <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title ?? ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              placeholder="例：スプラトゥーン3"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              デベロッパー <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.developer ?? ""}
              onChange={(e) => setForm({ ...form, developer: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              placeholder="例：Nintendo"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ジャンル
              </label>
              <select
                value={form.genre}
                onChange={(e) =>
                  setForm({ ...form, genre: e.target.value as Genre })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                {ADMIN_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                発売年
              </label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={form.releaseYear ?? 2024}
                onChange={(e) =>
                  setForm({ ...form, releaseYear: +e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              対応プラットフォーム
            </label>
            <div className="flex flex-wrap gap-2">
              {ADMIN_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${(form.platform ?? []).includes(p) ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                平均プレイ時間 (h)
              </label>
              <input
                type="number"
                min={0}
                value={form.avgPlaytime ?? 0}
                onChange={(e) =>
                  setForm({ ...form, avgPlaytime: +e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ステータス
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "active" | "archived",
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="active">公開中</option>
                <option value="archived">非公開</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={form.freeToPlay ?? false}
                onChange={(e) =>
                  setForm({ ...form, freeToPlay: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">基本無料 (F2P)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={form.hasCurrency ?? false}
                onChange={(e) =>
                  setForm({ ...form, hasCurrency: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">課金要素あり</span>
            </label>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              カバー画像 URL
            </label>
            <input
              value={form.coverUrl ?? ""}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 rounded-b-2xl border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            {game?.id ? "変更を保存" : "追加する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function GamesPanel() {
  const [games, setGames] = useState<AdminGame[]>(INITIAL_GAMES);
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">(
    "all",
  );
  const [editing, setEditing] = useState<Partial<AdminGame> | null | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<AdminGame | null>(null);

  const filtered = games.filter((g) => {
    const matchSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.developer.toLowerCase().includes(search.toLowerCase());
    const matchPlatform =
      filterPlatform === "all" || g.platform.includes(filterPlatform);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchPlatform && matchStatus;
  });

  function saveGame(g: AdminGame) {
    setGames((prev) =>
      prev.find((x) => x.id === g.id)
        ? prev.map((x) => (x.id === g.id ? g : x))
        : [g, ...prev],
    );
    setEditing(undefined);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkArchive() {
    setGames((prev) =>
      prev.map((g) =>
        selectedIds.has(g.id) ? { ...g, status: "archived" as const } : g,
      ),
    );
    setSelectedIds(new Set());
  }

  const allSelected =
    filtered.length > 0 && filtered.every((g) => selectedIds.has(g.id));

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((g) => g.id)));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {editing !== undefined ? (
        <GameForm
          game={editing ?? null}
          onSave={saveGame}
          onCancel={() => setEditing(undefined)}
        />
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="font-display text-base font-semibold text-slate-900">
              このゲームを削除しますか？
            </h2>
            <p className="mt-2 text-sm text-slate-500">{pendingDelete.title}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  setGames((prev) =>
                    prev.filter((x) => x.id !== pendingDelete.id),
                  );
                  setPendingDelete(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="総タイトル数" value={games.length} sub="DBに登録済み" />
        <StatCard
          label="公開中"
          value={games.filter((g) => g.status === "active").length}
          color="text-emerald-600"
        />
        <StatCard
          label="無料タイトル"
          value={games.filter((g) => g.freeToPlay).length}
          color="text-violet-600"
        />
        <StatCard
          label="課金要素あり"
          value={games.filter((g) => g.hasCurrency).length}
          color="text-amber-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative min-w-48 flex-1">
          <svg
            width={16}
            height={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="タイトル・デベロッパーで検索"
            className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm transition focus:border-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>
        <select
          value={filterPlatform}
          onChange={(e) =>
            setFilterPlatform(e.target.value as Platform | "all")
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-violet-500 focus:outline-none"
        >
          <option value="all">全プラットフォーム</option>
          {ADMIN_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as "all" | "active" | "archived")
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-violet-500 focus:outline-none"
        >
          <option value="all">全ステータス</option>
          <option value="active">公開中</option>
          <option value="archived">非公開</option>
        </select>
        {selectedIds.size > 0 ? (
          <button
            type="button"
            onClick={bulkArchive}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 transition-colors hover:bg-amber-100"
          >
            {selectedIds.size}件を非公開にする
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          <svg
            width={16}
            height={16}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          新規追加
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="max-h-[calc(100dvh-16rem)] min-h-0 flex-1 overflow-auto overscroll-contain">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="すべて選択"
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  ゲーム
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  プラットフォーム
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  ジャンル
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  プレイ時間
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  属性
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  ステータス
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((g) => (
                <tr
                  key={g.id}
                  className={`transition-colors hover:bg-slate-50/60 ${selectedIds.has(g.id) ? "bg-violet-50/40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(g.id)}
                      onChange={() => toggleSelect(g.id)}
                      aria-label={`${g.title}を選択`}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {g.coverUrl ? (
                          <Image
                            src={g.coverUrl}
                            alt={g.title}
                            width={40}
                            height={40}
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>
                      <div>
                        <div className="leading-snug font-medium text-slate-900">
                          {g.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {g.developer} · {g.releaseYear}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {g.platform.map((p) => (
                        <PlatformPill key={p} platform={p} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{g.genre}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {g.avgPlaytime}h
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {g.freeToPlay ? (
                        <span className="rounded border border-violet-100 bg-violet-50 px-1.5 py-0.5 text-xs text-violet-600">
                          F2P
                        </span>
                      ) : null}
                      {g.hasCurrency ? (
                        <span className="rounded border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-xs text-amber-600">
                          課金
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={g.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(g)}
                        title="編集"
                        aria-label={`${g.title}を編集`}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
                      >
                        <svg
                          width={16}
                          height={16}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(g)}
                        title="削除"
                        aria-label={`${g.title}を削除`}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <svg
                          width={16}
                          height={16}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-400"
                  >
                    該当するゲームが見つかりません
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="font-mono text-xs text-slate-400">
            {filtered.length} / {games.length} タイトル
          </span>
          <span className="text-xs text-slate-400">最終更新: 2024-06-12</span>
        </div>
      </div>
    </div>
  );
}

function ReportsPanel({
  reports,
  onUpdateStatus,
}: {
  reports: AdminReport[];
  onUpdateStatus: (id: string, status: ReportStatus) => void;
}) {
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const [reasonFilter, setReasonFilter] = useState<ReportReason | "all">("all");

  const filtered = reports.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchReason = reasonFilter === "all" || r.reason === reasonFilter;
    return matchStatus && matchReason;
  });

  const counts = {
    open: reports.filter((r) => r.status === "open").length,
    hidden: reports.filter((r) => r.status === "hidden").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="未対応"
          value={counts.open}
          color="text-red-600"
          sub="要対応"
        />
        <StatCard
          label="非表示済み"
          value={counts.hidden}
          color="text-slate-500"
        />
        <StatCard label="却下" value={counts.dismissed} color="text-slate-400" />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex gap-1">
          {(["all", "open", "hidden", "dismissed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === s ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {s === "all" ? "すべて" : STATUS_LABELS[s]}
              {s !== "all" ? (
                <span
                  className={`ml-1.5 font-mono text-xs ${filter === s ? "opacity-70" : "text-slate-400"}`}
                >
                  {counts[s]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={reasonFilter}
            onChange={(e) =>
              setReasonFilter(e.target.value as ReportReason | "all")
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm transition focus:ring-2 focus:ring-violet-500 focus:outline-none"
          >
            <option value="all">全理由</option>
            {(Object.entries(REASON_LABELS) as [ReportReason, string][]).map(
              ([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rep) => (
          <div
            key={rep.id}
            className={`overflow-hidden rounded-xl border bg-white transition-opacity ${rep.status === "dismissed" ? "opacity-50" : ""} ${rep.status === "open" ? "border-red-200" : "border-slate-200"}`}
          >
            <div className="px-5 py-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-400">
                    {rep.targetType === "review" ? "レビュー" : "コメント"}
                  </span>
                  <span className="font-display text-sm font-semibold text-slate-700">
                    {rep.gameTitle}
                  </span>
                  <Badge status={rep.status} />
                  <span
                    className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${REASON_COLORS[rep.reason]}`}
                  >
                    {REASON_LABELS[rep.reason]}
                  </span>
                </div>
                <span className="shrink-0 font-mono text-xs text-slate-400">
                  {rep.reportedAt.replace("T", " ").slice(0, 16)}
                </span>
              </div>

              <div className="mb-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p
                  className={`text-sm leading-relaxed ${rep.status === "hidden" ? "blur-sm select-none" : "text-slate-700"}`}
                >
                  {rep.targetContent}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  通報者: <span className="font-mono">{rep.reporter}</span>
                </span>
                <div className="flex gap-2">
                  {rep.status === "open" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(rep.id, "hidden")}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        <svg
                          width={14}
                          height={14}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                        非表示にする
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(rep.id, "dismissed")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
                      >
                        却下
                      </button>
                    </>
                  ) : null}
                  {rep.status === "hidden" ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(rep.id, "open")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      表示に戻す
                    </button>
                  ) : null}
                  {rep.status === "dismissed" ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(rep.id, "open")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      再度確認する
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
            該当する通報はありません
          </div>
        ) : null}
      </div>
    </div>
  );
}

const NAV_ITEMS: {
  key: AdminNav;
  label: string;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "games",
    label: "ゲームDB",
    desc: "ゲームタイトルの追加・編集・管理",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "通報・モデレーション",
    desc: "ユーザー投稿の通報を確認して処理",
    icon: (
      <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
];

export function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const [nav, setNav] = useState<AdminNav>("games");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<AdminReport[]>(INITIAL_REPORTS);

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) router.replace("/");
  }, [isLoggedIn, isAdmin, router]);

  if (!isLoggedIn || !isAdmin) return null;

  const current = NAV_ITEMS.find((n) => n.key === nav)!;
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="flex min-h-0 flex-1 bg-admin-bg font-body">
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
              <svg
                width={16}
                height={16}
                className="text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.997.176-1.97.468-2.888l.368-1.107a3 3 0 10-5.67 0l.367 1.107A6.065 6.065 0 008 14h4z" />
              </svg>
            </div>
            <div>
              <div className="font-display text-sm leading-tight font-bold text-slate-900">
                GameLog
              </div>
              <div className="text-xs text-slate-400">管理コンソール</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = nav === item.key;
            const badge = item.key === "reports" ? openCount : 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setNav(item.key);
                  setSidebarOpen(false);
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-violet-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
              >
                <span
                  className={
                    active
                      ? "text-white"
                      : "text-slate-400 transition-colors group-hover:text-slate-600"
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 font-mono text-xs font-bold ${active ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}
                  >
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              管
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-slate-700">
                admin@gamelog.jp
              </div>
              <div className="text-xs text-slate-400">スーパー管理者</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="サイドバーを閉じる"
          className="fixed top-16 right-0 bottom-0 left-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="メニューを開く"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <svg
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-lg leading-tight font-bold text-slate-900">
              {current.label}
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">
              {current.desc}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-mono text-xs text-slate-400 sm:block">
              2024-06-12
            </span>
            <div
              className="h-2 w-2 rounded-full bg-emerald-400"
              title="サービス稼働中"
            />
          </div>
        </header>

        <main
          className={
            nav === "games"
              ? "flex flex-1 flex-col p-5"
              : "flex-1 p-5"
          }
        >
          {nav === "games" ? <GamesPanel /> : null}
          {nav === "reports" ? (
            <ReportsPanel
              reports={reports}
              onUpdateStatus={(id, status) =>
                setReports((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, status } : r)),
                )
              }
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
