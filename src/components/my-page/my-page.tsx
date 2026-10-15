"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { UserAvatar } from "@/components/user-avatar";
import { GAMES, REVIEWS, TABS, type GameStatus } from "./data";
import { GameCard } from "./game-card";
import {
  IconClock,
  IconGamepad,
  IconLogOut,
  IconSettings,
  IconTrophy,
} from "./icons";
import { ReviewCard } from "./review-card";

const BANNER_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export function MyPage({ isOwner = true }: { isOwner?: boolean }) {
  const router = useRouter();
  const { user, ready, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<GameStatus>("全て");
  const [activeSection, setActiveSection] = useState<"shelf" | "reviews">(
    "shelf",
  );

  useEffect(() => {
    if (ready && !isLoggedIn) router.replace("/login");
  }, [ready, isLoggedIn, router]);

  const totalHours = GAMES.reduce((sum, game) => sum + game.hours, 0);
  const clearedCount = GAMES.filter((game) => game.status === "クリア済み").length;
  const playingCount = GAMES.filter((game) => game.status === "プレイ中").length;
  const filteredGames =
    activeTab === "全て"
      ? GAMES
      : GAMES.filter((game) => game.status === activeTab);

  const tabCounts: Record<GameStatus, number> = {
    全て: GAMES.length,
    プレイ中: GAMES.filter((game) => game.status === "プレイ中").length,
    クリア済み: GAMES.filter((game) => game.status === "クリア済み").length,
    積みゲー: GAMES.filter((game) => game.status === "積みゲー").length,
    やめた: GAMES.filter((game) => game.status === "やめた").length,
  };

  if (!ready || !user) return null;

  return (
    <div className="min-h-full bg-page font-mypage text-ink">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="relative h-24 bg-gradient-to-br from-brand via-[#8b6dff] to-[#c084fc]">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: BANNER_PATTERN }}
            />
          </div>

          <div className="px-5 pb-5">
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className="relative">
                <div className="rounded-2xl border-4 border-white bg-line shadow-md">
                  <UserAvatar
                    src={user.avatarSrc}
                    name={user.displayName}
                    size={80}
                    rounded="2xl"
                  />
                </div>
                <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              {isOwner ? (
                <div className="mb-1 flex gap-2">
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs text-subtle transition-all hover:border-brand hover:text-brand"
                  >
                    <IconSettings size={13} />
                    アカウント設定
                  </Link>
                  <Link
                    href="/settings?tab=danger"
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-50"
                  >
                    <IconLogOut size={13} />
                    退会
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-ink">
                  {user.displayName}
                </h1>
              </div>
              <p className="text-sm text-subtle">@{user.username}</p>
              <p className="text-sm text-subtle">{user.email}</p>
              {user.aboutText ? (
                <p className="mt-2 text-sm leading-relaxed text-subtle">
                  {user.aboutText}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-page p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <span className="text-brand">
                    <IconClock size={13} />
                  </span>
                  <span className="text-xs text-subtle">総プレイ時間</span>
                </div>
                <div className="font-mono text-xl font-semibold text-ink">
                  {totalHours.toLocaleString()}
                </div>
                <div className="text-xs text-subtle">時間</div>
              </div>
              <div className="rounded-xl bg-page p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <span className="text-amber-500">
                    <IconTrophy size={13} />
                  </span>
                  <span className="text-xs text-subtle">クリア済み</span>
                </div>
                <div className="font-mono text-xl font-semibold text-ink">
                  {clearedCount}
                </div>
                <div className="text-xs text-subtle">本</div>
              </div>
              <div className="rounded-xl bg-page p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <span className="text-emerald-500">
                    <IconGamepad size={13} />
                  </span>
                  <span className="text-xs text-subtle">プレイ中</span>
                </div>
                <div className="font-mono text-xl font-semibold text-ink">
                  {playingCount}
                </div>
                <div className="text-xs text-subtle">本</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("shelf")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeSection === "shelf"
                ? "bg-brand text-white shadow-sm"
                : "border border-line bg-white text-subtle hover:border-brand/50"
            }`}
          >
            ゲーム棚 ({GAMES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("reviews")}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              activeSection === "reviews"
                ? "bg-brand text-white shadow-sm"
                : "border border-line bg-white text-subtle hover:border-brand/50"
            }`}
          >
            レビュー ({REVIEWS.length})
          </button>
        </div>

        {activeSection === "shelf" ? (
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-subtle hover:border-ink/30"
                  }`}
                >
                  {tab}
                  <span
                    className={`text-xs ${activeTab === tab ? "text-white/60" : "text-subtle"}`}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
