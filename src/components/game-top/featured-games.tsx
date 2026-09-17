"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FEATURED_GAMES,
  type FeaturedFilter,
} from "./data";
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

const FILTERS = [
  ["all", "すべて"],
  ["rising", "急上昇"],
  ["f2p", "無課金OK"],
  ["sabage", "サバゲー"],
] as const;

export function FeaturedGames() {
  const [filter, setFilter] = useState<FeaturedFilter>("all");

  const filtered = FEATURED_GAMES.filter((game) => {
    if (filter === "rising") return game.tag === "評価急上昇" || game.tag === "新着";
    if (filter === "f2p") return game.freeToPlay;
    if (filter === "sabage")
      return game.genre.includes("サバゲー") || game.genre.includes("シューター");
    return true;
  });

  return (
    <section className="py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-[#1a1c22]">
          注目・評価急上昇ゲーム
        </h2>
        <div className="flex gap-1.5">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === id
                  ? "border-[#5c4dff] bg-[#5c4dff] text-white"
                  : "border-[#e3e4ea] bg-white text-[#7a7d8a] hover:border-[#5c4dff]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filtered.map((game) => (
          <div
            key={game.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-[#e3e4ea] bg-white transition-all hover:shadow-lg"
          >
            <div className="relative h-36 overflow-hidden bg-[#f0f1f5]">
              <Image
                src={game.img}
                alt={game.title.replace("\n", " ")}
                fill
                sizes="(max-width: 640px) 50vw, 280px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <span
                className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white shadow"
                style={{ backgroundColor: game.tagColor }}
              >
                {game.tag}
              </span>
              <span className="absolute right-2.5 bottom-2 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {game.platform}
              </span>
            </div>

            <div className="p-3.5">
              <p className="mb-0.5 text-[11px] text-[#7a7d8a]">{game.genre}</p>
              <h3 className="mb-2 text-sm leading-snug font-bold whitespace-pre-line text-[#1a1c22]">
                {game.title}
              </h3>

              <div className="mb-2 flex items-center gap-1.5">
                <Stars rating={game.rating} />
                <span className="text-xs font-bold text-[#1a1c22]">
                  {game.rating}
                </span>
                <span className="text-xs text-[#7a7d8a]">
                  ({game.reviewCount.toLocaleString()}件)
                </span>
              </div>

              {game.freeToPlay && game.f2pScore !== null ? (
                <F2PBar score={game.f2pScore} />
              ) : null}

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#7a7d8a]">⏱ {game.playtime}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    game.freeToPlay
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-[#f0f1f5] text-[#7a7d8a]"
                  }`}
                >
                  {game.freeToPlay ? "無料" : "有料"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="rounded-full border border-[#e3e4ea] bg-white px-8 py-3 text-sm font-bold text-[#5c4dff] transition-colors hover:border-[#5c4dff] hover:bg-[#eeedf8]"
        >
          すべてのゲームを見る →
        </button>
      </div>
    </section>
  );
}
