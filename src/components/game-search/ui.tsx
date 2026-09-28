"use client";

import { useId } from "react";
import { PLATFORM_BADGE, type Platform } from "./data";

export function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const uid = useId();
  const px = size === "sm" ? 12 : 14;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0;
        const gradientId = `${uid}-${star}`;
        return (
          <svg
            key={star}
            width={px}
            height={px}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gradientId}>
                <stop offset={`${fill * 100}%`} stopColor="#F59E0B" />
                <stop offset={`${fill * 100}%`} stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              d="M6 1l1.3 2.6L10.4 4l-2.2 2.1.5 3.1L6 7.8 3.3 9.2l.5-3.1L1.6 4l3.1-.4L6 1z"
              fill={`url(#${gradientId})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

export function ScoreDots({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((index) => (
        <span
          key={index}
          className="inline-block h-[7px] w-[7px] rounded-full"
          style={{ background: index <= score ? color : "#E2E4EC" }}
        />
      ))}
    </div>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORM_BADGE[platform as Platform] ?? {
    color: "#4A5068",
    bg: "#F5F6FA",
    border: "#E2E5EF",
    label: platform,
  };
  return (
    <span
      className="rounded-[3px] px-1.5 py-px text-[10px] leading-[1.7] font-semibold tracking-[0.04em] whitespace-nowrap"
      style={{
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.label}
    </span>
  );
}

export function CheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] transition-all duration-150 ${
        checked
          ? "bg-search-primary"
          : "border-[1.5px] border-[#C8CADB] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]"
      }`}
    >
      {checked ? (
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M2 5l2.5 2.5L8 3"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export function RadioIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 ${
        checked
          ? "border-search-primary bg-search-primary"
          : "border-[#C8CADB] bg-white"
      }`}
    >
      {checked ? <span className="block h-1.5 w-1.5 rounded-full bg-white" /> : null}
    </span>
  );
}

export function F2PBadge({ score }: { score: number }) {
  const label =
    score >= 5
      ? "完全無課金OK"
      : score >= 4
        ? "無課金寄り"
        : score >= 3
          ? "課金有利"
          : "課金推奨";
  const styles =
    score >= 5
      ? { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" }
      : score >= 4
        ? { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" }
        : score >= 3
          ? { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" }
          : { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" };

  return (
    <span
      className="rounded-[3px] px-[7px] py-0.5 text-[10px] font-bold tracking-[0.03em] whitespace-nowrap"
      style={{
        color: styles.color,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
    >
      {label}
    </span>
  );
}

export function ClockIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="5" stroke="#9999B3" strokeWidth="1.2" />
      <path
        d="M6 3v3l2 1.5"
        stroke="#9999B3"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({ size = 8 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l4 4M6 2L2 6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="7.5" width="12" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 4h10M4 7h6M6 10h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
