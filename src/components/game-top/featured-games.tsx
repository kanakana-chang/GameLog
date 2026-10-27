"use client";

import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import type { SearchGame } from "@/components/game-search/data";
import { Stars } from "./icons";

function F2PBar({ score }: { score: number }) {
  const percent = (score / 5) * 100;
  const color = score >= 4 ? "#10b981" : score >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs whitespace-nowrap text-[#7a7d8a]">無課金度</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e3e4ea]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function playtimeLabel(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) return "—";
  return `${hours}h`;
}

function platformLabel(platforms: SearchGame["platforms"]) {
  return platforms.slice(0, 2).join(" / ") || "—";
}

export function FeaturedGames({ games }: { games: SearchGame[] }) {
  return (
    <section className="py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-[#1a1c22]">新着ゲーム</h2>
      </div>

      {games.length > 0 ? (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <Link
              key={String(game.id)}
              href={`/games/${game.id}`}
              className="group flex overflow-hidden rounded-2xl border border-[#e3e4ea] bg-white transition-all hover:shadow-lg"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[#f0f1f5] sm:h-32 sm:w-36">
                <CoverImage
                  src={game.img}
                  alt={game.title}
                  fill
                  sizes="(max-width: 640px) 96px, 144px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-2 left-2 rounded-full bg-[#ff4d84] px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
                  新着
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-[11px] text-[#7a7d8a]">{game.genre}</p>
                  <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-[#5a6080]">
                    {platformLabel(game.platforms)}
                  </span>
                </div>
                <h3 className="mb-2 truncate text-sm leading-snug font-bold text-[#1a1c22] sm:text-base">
                  {game.title}
                </h3>

                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <Stars rating={game.rating} />
                  <span className="text-xs font-bold text-[#1a1c22]">
                    {game.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#7a7d8a]">
                    ({game.ratingCount.toLocaleString()}件)
                  </span>
                </div>

                {game.isFree ? <F2PBar score={game.f2pScore} /> : null}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#7a7d8a]">
                    ⏱ {playtimeLabel(game.avgPlaytime)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      game.isFree
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-[#f0f1f5] text-[#7a7d8a]"
                    }`}
                  >
                    {game.isFree ? "無料" : "有料"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#e3e4ea] bg-white px-4 py-12 text-center text-sm text-[#7a7d8a]">
          まだゲームが登録されていません
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/games"
          className="inline-block rounded-full border border-[#e3e4ea] bg-white px-8 py-3 text-sm font-bold text-[#5c4dff] transition-colors hover:border-[#5c4dff] hover:bg-[#eeedf8]"
        >
          すべてのゲームを見る →
        </Link>
      </div>
    </section>
  );
}
