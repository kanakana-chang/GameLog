"use client";

import { useMemo, useState } from "react";
import { GameCardGrid, GameCardList } from "./cards";
import {
  SEARCH_GAMES,
  SORT_OPTIONS,
  type SearchFilters,
  type SearchGame,
  type SortKey,
  type ViewMode,
} from "./data";
import { RequestModal } from "./request-modal";
import { SearchSidebar } from "./sidebar";
import { CloseIcon, FilterIcon, GridIcon, ListIcon } from "./ui";

type GameSearchProps = {
  initialFilters: SearchFilters;
  initialQuery: string;
  games?: SearchGame[];
};

export function GameSearch({
  initialFilters,
  initialQuery,
  games = SEARCH_GAMES,
}: GameSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState(initialQuery);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = games.filter((game) => {
      if (
        query &&
        !game.title.includes(query) &&
        !game.developer.includes(query) &&
        !game.tags.some((tag) => tag.includes(query))
      ) {
        return false;
      }
      if (
        filters.platforms.length &&
        !filters.platforms.some((platform) => game.platforms.includes(platform))
      ) {
        return false;
      }
      if (filters.genres.length && !filters.genres.includes(game.genre)) {
        return false;
      }
      if (game.rating < filters.minRating) return false;
      if (game.f2pScore < filters.minF2P) return false;
      if (filters.freeOnly && !game.isFree) return false;
      if (filters.hasGachaFilter === "gacha" && !game.hasGacha) return false;
      if (filters.hasGachaFilter === "nogacha" && game.hasGacha) return false;
      if (game.avgPlaytime > filters.maxPlaytime) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "popular") {
        return (
          Number(b.popular) - Number(a.popular) || b.ratingCount - a.ratingCount
        );
      }
      if (sort === "newest") return b.releaseYear - a.releaseYear;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "playtime_asc") return a.avgPlaytime - b.avgPlaytime;
      if (sort === "f2p") return b.f2pScore - a.f2pScore;
      return 0;
    });

    return list;
  }, [filters, sort, query, games]);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-search-bg">
      <div className="relative flex flex-1 overflow-hidden">
        {sidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-[rgba(26,26,46,0.35)] md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute top-0 bottom-0 left-0 z-[41]"
              onClick={(event) => event.stopPropagation()}
            >
              <SearchSidebar
                filters={filters}
                onChange={setFilters}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        ) : null}

        <div className="hidden shrink-0 md:flex">
          <SearchSidebar filters={filters} onChange={setFilters} />
        </div>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-search-border bg-white px-3 py-1.5 text-xs text-search-label md:hidden"
            >
              <FilterIcon />
              フィルター
            </button>

            <label className="sr-only" htmlFor="game-search-query">
              ゲームを検索
            </label>
            <input
              id="game-search-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ゲームを検索..."
              className="w-full max-w-[220px] rounded-full border border-search-border bg-white px-3 py-1.5 text-xs text-search-text outline-none placeholder:text-search-dim focus:border-search-primary md:max-w-[260px]"
            />

            <span className="text-xs text-search-dim">
              <span className="font-semibold text-search-primary">
                {filtered.length}
              </span>{" "}
              件
            </span>

            <div className="flex flex-1 flex-wrap gap-[5px]">
              {filters.freeOnly ? (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, freeOnly: false })}
                  className="flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-medium text-[#059669]"
                >
                  基本無料
                  <CloseIcon />
                </button>
              ) : null}
              {filters.hasGachaFilter !== "all" ? (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ ...filters, hasGachaFilter: "all" })
                  }
                  className="flex items-center gap-1 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-0.5 text-[11px] font-medium text-[#D97706]"
                >
                  {filters.hasGachaFilter === "gacha" ? "ガチャあり" : "ガチャなし"}
                  <CloseIcon />
                </button>
              ) : null}
              {filters.platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      platforms: filters.platforms.filter(
                        (item) => item !== platform,
                      ),
                    })
                  }
                  className="flex items-center gap-1 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-medium text-search-primary"
                >
                  {platform}
                  <CloseIcon />
                </button>
              ))}
              {filters.genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      genres: filters.genres.filter((item) => item !== genre),
                    })
                  }
                  className="flex items-center gap-1 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-2.5 py-0.5 text-[11px] font-medium text-[#7C3AED]"
                >
                  {genre}
                  <CloseIcon />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs font-medium text-search-label hover:text-search-primary"
            >
              掲載リクエスト
            </button>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-search-border bg-white px-2.5 py-1.5 font-body text-xs text-search-label shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex overflow-hidden rounded-lg border border-search-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {(["grid", "list"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  aria-label={mode === "grid" ? "グリッド表示" : "リスト表示"}
                  className={`flex items-center px-[11px] py-1.5 transition-all duration-150 ${
                    view === mode
                      ? "bg-[#EEF2FF] text-search-primary"
                      : "bg-transparent text-search-dim"
                  }`}
                >
                  {mode === "grid" ? <GridIcon /> : <ListIcon />}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="pt-20 text-center text-search-dim">
              <div className="mb-3 text-[40px]">🎮</div>
              <div className="mb-1.5 font-search text-[22px] font-semibold text-search-muted">
                ゲームが見つかりませんでした
              </div>
              <p className="text-[13px]">絞り込み条件を変更してみてください</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5">
              {filtered.map((game) => (
                <GameCardGrid key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((game) => (
                <GameCardList key={game.id} game={game} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal ? <RequestModal onClose={() => setShowModal(false)} /> : null}
    </div>
  );
}
