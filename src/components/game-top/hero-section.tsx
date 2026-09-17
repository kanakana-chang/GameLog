"use client";

import { useEffect, useRef, useState } from "react";
import { QUICK_TAGS, SEARCH_SUGGESTIONS } from "./data";
import { SearchIcon } from "./icons";

export function HeroSection({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = SEARCH_SUGGESTIONS.filter(
    (suggestion) => suggestion.includes(query) || query === "",
  );

  const submit = (value: string) => {
    if (!value.trim()) return;
    onSearch(value);
    setShowSuggestions(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1030] via-[#2d1f5e] to-[#1a1030] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-[-80px] left-[-60px] h-[400px] w-[400px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #5c4dff 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-40px] bottom-[-60px] h-[300px] w-[300px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #ff4d84 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[200px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-5"
          style={{
            background: "radial-gradient(ellipse, #ffffff 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-20">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff4d84]" />
          12,400以上のゲームを収録
        </div>

        <h1 className="mb-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
          ゲームを選ぶなら、
          <br />
          <span className="bg-gradient-to-r from-[#a78bfa] to-[#fb7185] bg-clip-text text-transparent">
            GameLog
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          無課金での遊びやすさ・プレイボリューム・実際の口コミで
          <br className="hidden sm:block" />
          あなたにぴったりのゲームが見つかる
        </p>

        <div ref={ref} className="relative mx-auto mb-6 max-w-xl">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-5 py-4 shadow-2xl">
            <span className="shrink-0 text-[#7a7d8a]">
              <SearchIcon size={20} />
            </span>
            <input
              type="text"
              placeholder="ゲーム名・キーワードで検索..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit(query);
              }}
              className="flex-1 text-sm text-[#1a1c22] outline-none placeholder:text-[#7a7d8a]"
            />
            <button
              type="button"
              onClick={() => submit(query)}
              className="rounded-xl bg-[#5c4dff] px-5 py-2 text-sm font-bold whitespace-nowrap text-white transition-colors hover:bg-[#4a3de6]"
            >
              検索
            </button>
          </div>

          {showSuggestions && filtered.length > 0 ? (
            <div className="absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-xl border border-[#e3e4ea] bg-white shadow-xl">
              {filtered.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    submit(suggestion);
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-[#1a1c22] transition-colors hover:bg-[#f5f6f8]"
                >
                  <span className="shrink-0 text-[#7a7d8a]">
                    <SearchIcon size={16} />
                  </span>
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSearch(tag)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
