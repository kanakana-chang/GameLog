"use client";

import { useState } from "react";
import { REVIEWS } from "./data";
import { Stars, ThumbIcon } from "./icons";

export function ReviewFeed() {
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});

  return (
    <section className="border-t border-[#e3e4ea] bg-[#f5f6f8] py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-[#1a1c22]">
          新着レビュー・口コミ
        </h2>
        <button
          type="button"
          className="text-xs font-bold text-[#5c4dff] hover:underline"
        >
          すべて見る →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REVIEWS.map((review) => {
          const isHelpful = Boolean(helpful[review.id]);

          return (
            <div
              key={review.id}
              className="rounded-2xl border border-[#e3e4ea] bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#eeedf8] px-2.5 py-1 text-xs font-bold text-[#5c4dff]">
                    {review.game}
                  </span>
                  <span className="rounded-full bg-[#f0f1f5] px-2 py-0.5 text-xs text-[#7a7d8a]">
                    {review.platform}
                  </span>
                </div>
                <span className="text-xs text-[#7a7d8a]">{review.time}</span>
              </div>

              <div className="mb-3 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: review.avColor }}
                >
                  {review.av}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1a1c22]">
                      {review.user}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: review.badgeColor }}
                    >
                      {review.badge}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Stars rating={review.rating} size="xs" />
                    <span className="text-xs text-[#7a7d8a]">
                      ⏱ {review.playtime}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mb-3 text-sm leading-relaxed text-[#1a1c22]">
                {review.text}
              </p>

              <button
                type="button"
                onClick={() =>
                  setHelpful((current) => ({
                    ...current,
                    [review.id]: !current[review.id],
                  }))
                }
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isHelpful
                    ? "text-[#5c4dff]"
                    : "text-[#7a7d8a] hover:text-[#5c4dff]"
                }`}
              >
                <ThumbIcon filled={isHelpful} />
                参考になった {review.helpful + (isHelpful ? 1 : 0)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
