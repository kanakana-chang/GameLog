"use client";

import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import type { SearchGame } from "@/components/game-search/data";
import { Stars } from "./icons";

function F2PBar({ score }: { score: number }) {
  const percent = (score / 5) * 100;
  const color = score >= 4 ? "#10b981" : score >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] whitespace-nowrap text-[#7a7d8a]">無課金</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#e3e4ea]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>
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
  return platforms[0] || "—";
}

export function FeaturedGames({ games }: { games: SearchGame[] }) {
  return (
    <section className="py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-[#1a1c22]">新着ゲーム</h2>
      </div>

      {games.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {games.map((game) => (
            <Link
              key={String(game.id)}
              href={`/games/${game.id}`}
              className="group min-w-0 overflow-hidden rounded-2xl border border-[#e3e4ea] bg-white transition-all hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f1f5] sm:h-36 sm:aspect-auto">
                <CoverImage
                  src={game.img}
                  alt={game.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-1.5 left-1.5 rounded-full bg-[#ff4d84] px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow sm:top-2 sm:left-2 sm:px-2">
                  新着
                </span>
                <span className="absolute right-1.5 bottom-1.5 max-w-[70%] truncate rounded-full bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:right-2 sm:bottom-2 sm:px-2">
                  {platformLabel(game.platforms)}
                </span>
              </div>

              <div className="min-w-0 p-2 sm:p-3">
                <p className="mb-0.5 truncate text-[10px] text-[#7a7d8a] sm:text-[11px]">
                  {game.genre}
                </p>
                <h3 className="mb-1.5 line-clamp-2 min-h-8 text-xs leading-snug font-bold break-words text-[#1a1c22] sm:mb-2 sm:min-h-9 sm:text-sm">
                  {game.title}
                </h3>

                <div className="mb-1.5 flex min-w-0 items-center gap-1 overflow-hidden sm:mb-2">
                  <Stars rating={game.rating} size="xs" />
                  <span className="shrink-0 text-[11px] font-bold text-[#1a1c22] sm:text-xs">
                    {game.rating.toFixed(1)}
                  </span>
                  <span className="hidden truncate text-[10px] text-[#7a7d8a] sm:inline">
                    ({game.ratingCount.toLocaleString()})
                  </span>
                </div>

                {game.isFree ? <F2PBar score={game.f2pScore} /> : null}

                <div className="mt-1.5 flex min-w-0 items-center justify-between gap-1 sm:mt-2">
                  <span className="truncate text-[10px] text-[#7a7d8a] sm:text-[11px]">
                    ⏱ {playtimeLabel(game.avgPlaytime)}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold sm:px-2 ${
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
