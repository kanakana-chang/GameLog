import Image from "next/image";
import type { Review } from "./data";
import { IconChevronRight, IconHeart, IconMessage, IconStar } from "./icons";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="cursor-pointer rounded-2xl border border-line bg-white p-4 transition-colors hover:border-brand/30">
      <div className="mb-3 flex gap-3">
        <Image
          src={review.cover}
          alt={review.gameTitle}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl bg-line object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="mb-1 line-clamp-1 text-sm leading-tight font-bold text-ink">
            {review.gameTitle}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={index < review.rating ? "text-amber-400" : "text-line"}
                >
                  <IconStar size={11} filled={index < review.rating} />
                </span>
              ))}
            </div>
            <span className="text-xs text-subtle">{review.date}</span>
          </div>
        </div>
        <span className="shrink-0 self-center text-line">
          <IconChevronRight size={16} />
        </span>
      </div>

      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-copy">
        {review.text}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-subtle">
          <button
            type="button"
            className="flex items-center gap-1 text-xs transition-colors hover:text-heart"
          >
            <IconHeart size={13} />
            <span>{review.likes}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-xs transition-colors hover:text-brand"
          >
            <IconMessage size={13} />
            <span>{review.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
