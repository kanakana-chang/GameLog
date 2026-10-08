"use client";

import { CoverImage } from "@/components/cover-image";
import Link from "next/link";
import { useState } from "react";
import type { SearchGame } from "./data";
import { ClockIcon, F2PBadge, PlatformBadge, ScoreDots, StarRating } from "./ui";

export function GameCardGrid({ game }: { game: SearchGame }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/games/${game.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
        hovered
          ? "-translate-y-0.5 border-[#C8CADB] shadow-[0_8px_24px_rgba(99,102,241,0.10)]"
          : "border-search-border shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      }`}
    >
      <div className="relative overflow-hidden bg-search-bg pt-[56.25%]">
        <CoverImage
          src={game.img}
          alt={game.title}
          fill
          sizes="(max-width: 768px) 50vw, 220px"
          className={`object-cover transition-transform duration-300 ${
            hovered ? "scale-105" : "scale-100"
          }`}
        />
        {game.isFree ? (
          <div className="absolute top-2.5 left-2.5 rounded bg-[#059669] px-2 py-[3px] font-search text-[10px] font-bold tracking-[0.08em] text-white">
            基本無料
          </div>
        ) : null}
        {game.hasGacha ? (
          <div
            className="absolute left-2.5 rounded bg-[#F59E0B] px-2 py-[3px] font-search text-[10px] font-bold tracking-[0.06em] text-white"
            style={{ top: game.isFree ? 34 : 10 }}
          >
            ガチャあり
          </div>
        ) : null}
        <div className="absolute top-2.5 right-2.5 rounded bg-white/93 px-2 py-[3px] font-search text-xs font-bold text-[#D97706] shadow-[0_1px_4px_rgba(0,0,0,0.08)] backdrop-blur-[4px]">
          ★ {game.rating.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">
        <div>
          <h3 className="overflow-hidden font-search text-base leading-tight font-bold tracking-[0.02em] text-search-text text-ellipsis whitespace-nowrap">
            {game.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-search-dim">{game.developer}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {game.platforms.map((platform) => (
            <PlatformBadge key={platform} platform={platform} />
          ))}
        </div>

        <div className="flex flex-col gap-[5px] rounded-lg bg-[#F8F9FF] px-2.5 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-search-muted">
              無課金度
            </span>
            <ScoreDots score={game.f2pScore} color="#059669" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-search-muted">
              ボリューム
            </span>
            <ScoreDots score={game.volumeScore} color="#6366F1" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {game.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-[3px] border border-search-border bg-[#F8F9FF] px-1.5 py-0.5 text-[10px] text-search-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-[#F0F0F8] pt-2.5">
          <F2PBadge score={game.f2pScore} />
          <div className="flex items-center gap-1">
            <ClockIcon size={11} />
            <span className="text-[11px] text-search-dim">
              {game.avgPlaytime}h~
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function GameCardList({ game }: { game: SearchGame }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/games/${game.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
        hovered
          ? "border-[#C8CADB] shadow-[0_4px_16px_rgba(99,102,241,0.09)]"
          : "border-search-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="relative h-[132px] w-[148px] shrink-0 overflow-hidden bg-search-bg">
        <CoverImage
          src={game.img}
          alt={game.title}
          fill
          sizes="148px"
          className={`object-cover transition-transform duration-300 ${
            hovered ? "scale-105" : "scale-100"
          }`}
        />
        {game.isFree ? (
          <div className="absolute top-2 left-2 rounded-[3px] bg-[#059669] px-1.5 py-0.5 font-search text-[9px] font-bold tracking-[0.08em] text-white">
            基本無料
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-search text-lg font-bold tracking-[0.02em] text-search-text">
              {game.title}
            </h3>
            {game.hasGacha ? (
              <span className="rounded-[3px] border border-[#FDE68A] bg-[#FFFBEB] px-1.5 py-px text-[10px] font-bold text-[#D97706]">
                ガチャあり
              </span>
            ) : null}
          </div>
          <p className="mb-2 text-[11px] text-search-dim">
            {game.developer} · {game.releaseYear}年
          </p>
          <div className="mb-2 flex flex-wrap gap-1">
            {game.platforms.map((platform) => (
              <PlatformBadge key={platform} platform={platform} />
            ))}
          </div>
          <div className="flex gap-3">
            <div>
              <div className="mb-[3px] text-[9px] font-semibold tracking-[0.08em] text-search-dim uppercase">
                無課金度
              </div>
              <ScoreDots score={game.f2pScore} color="#059669" />
            </div>
            <div>
              <div className="mb-[3px] text-[9px] font-semibold tracking-[0.08em] text-search-dim uppercase">
                ボリューム
              </div>
              <ScoreDots score={game.volumeScore} color="#6366F1" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[3px] border border-search-border bg-[#F8F9FF] px-1.5 py-0.5 text-[10px] text-search-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-[5px]">
            <StarRating rating={game.rating} size="md" />
            <span className="font-search text-lg font-bold text-[#D97706]">
              {game.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-[10px] text-search-dim">
            ({game.ratingCount.toLocaleString()}件)
          </span>
          <F2PBadge score={game.f2pScore} />
          <div className="mt-1 flex items-center gap-1">
            <ClockIcon size={12} />
            <span className="text-[11px] text-search-muted">
              {game.avgPlaytime}時間~
            </span>
          </div>
          <span
            className={`font-search text-base font-bold ${
              game.isFree ? "text-[#059669]" : "text-search-text"
            }`}
          >
            {game.isFree ? "無料" : `¥${game.price.toLocaleString()}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
