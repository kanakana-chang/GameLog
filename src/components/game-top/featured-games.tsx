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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {games.map((game) => (
            <Link
              key={String(game.id)}
              href={`/games/${game.id}`}
              className="group overflow-hidden rounded-2xl border border-[#e3e4ea] bg-white transition-all hover:shadow-lg"
            >
              <div className="relative h-36 overflow-hidden bg-[#f0f1f5]">
                <CoverImage
                  src={game.img}
                  alt={game.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-2 left-2 rounded-full bg-[#ff4d84] px-2 py-0.5 text-[10px] font-extrabold text-white shadow">
                  新着
                </span>
                <span className="absolute right-2 bottom-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  {platformLabel(game.platforms)}
                </span>
              </div>

              <div className="p-3">
                <p className="mb-0.5 truncate text-[11px] text-[#7a7d8a]">
                  {game.genre}
                </p>
                <h3 className="mb-2 line-clamp-2 min-h-9 text-sm leading-snug font-bold text-[#1a1c22]">
                  {game.title}
                </h3>

                <div className="mb-2 flex flex-wrap items-center gap-1">
                  <Stars rating={game.rating} size="xs" />
                  <span className="text-xs font-bold text-[#1a1c22]">
                    {game.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[#7a7d8a]">
                    ({game.ratingCount.toLocaleString()})
                  </span>
                </div>

                {game.isFree ? <F2PBar score={game.f2pScore} /> : null}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#7a7d8a]">
                    ⏱ {playtimeLabel(game.avgPlaytime)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
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
