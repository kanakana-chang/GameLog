"use client";

import {
  GENRES,
  PLATFORMS,
  type SearchFilters,
} from "./data";
import { CheckIcon, RadioIcon } from "./ui";

type SidebarProps = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClose?: () => void;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[26px]">
      <div className="mb-2.5 font-search text-[10px] font-bold tracking-[0.12em] text-search-dim uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

export function SearchSidebar({ filters, onChange, onClose }: SidebarProps) {
  const togglePlatform = (platform: (typeof PLATFORMS)[number]) => {
    const next = filters.platforms.includes(platform)
      ? filters.platforms.filter((item) => item !== platform)
      : [...filters.platforms, platform];
    onChange({ ...filters, platforms: next });
  };

  const toggleGenre = (genre: (typeof GENRES)[number]) => {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter((item) => item !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: next });
  };

  const reset = () => {
    onChange({
      platforms: [],
      genres: [],
      minRating: 0,
      minF2P: 0,
      freeOnly: false,
      hasGachaFilter: "all",
      maxPlaytime: 1000,
    });
  };

  return (
    <aside className="flex h-full w-[236px] shrink-0 flex-col overflow-y-auto border-r border-search-border bg-white px-[18px] py-5">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-search text-[17px] font-bold text-search-text">
          絞り込み
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="font-body p-0 text-[11px] text-search-primary"
          >
            リセット
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-0 text-search-dim"
              aria-label="フィルターを閉じる"
            >
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <Section title="価格">
        <button
          type="button"
          onClick={() => onChange({ ...filters, freeOnly: !filters.freeOnly })}
          className="flex items-center gap-2"
        >
          <CheckIcon checked={filters.freeOnly} />
          <span className="text-[13px] text-search-label">基本無料のみ</span>
        </button>
      </Section>

      <Section title="ガチャ">
        <div className="flex flex-col gap-2">
          {(
            [
              ["all", "すべて"],
              ["gacha", "ガチャあり"],
              ["nogacha", "ガチャなし"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...filters, hasGachaFilter: value })}
              className="flex items-center gap-2"
            >
              <RadioIcon checked={filters.hasGachaFilter === value} />
              <span className="text-[13px] text-search-label">{label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="プラットフォーム">
        <div className="flex flex-col gap-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => togglePlatform(platform)}
              className="flex items-center gap-2"
            >
              <CheckIcon checked={filters.platforms.includes(platform)} />
              <span className="text-[13px] text-search-label">{platform}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="ジャンル">
        <div className="flex flex-wrap gap-[5px]">
          {GENRES.map((genre) => {
            const active = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`rounded px-2 py-1 text-[11px] transition-all duration-150 ${
                  active
                    ? "border border-search-primary bg-[#EEF2FF] font-semibold text-search-primary"
                    : "border border-search-border bg-[#F8F9FF] font-normal text-search-muted"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title={`無課金遊びやすさ：${filters.minF2P > 0 ? `${filters.minF2P}以上` : "指定なし"}`}
      >
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={filters.minF2P}
          onChange={(event) =>
            onChange({ ...filters, minF2P: Number(event.target.value) })
          }
          className="w-full accent-[#059669]"
        />
        <div className="mt-1 flex justify-between text-[10px] text-search-dim">
          <span>指定なし</span>
          <span>完全無課金</span>
        </div>
      </Section>

      <Section title={`最低評価：${filters.minRating.toFixed(1)}以上`}>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={(event) =>
            onChange({ ...filters, minRating: Number(event.target.value) })
          }
          className="w-full accent-search-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-search-dim">
          <span>0</span>
          <span>5.0</span>
        </div>
      </Section>

      <Section title={`プレイボリューム：${filters.maxPlaytime}時間以下`}>
        <input
          type="range"
          min={10}
          max={1000}
          step={10}
          value={filters.maxPlaytime}
          onChange={(event) =>
            onChange({ ...filters, maxPlaytime: Number(event.target.value) })
          }
          className="w-full accent-search-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-search-dim">
          <span>10h</span>
          <span>1000h+</span>
        </div>
      </Section>
    </aside>
  );
}
